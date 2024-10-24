const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const CryptoJS = require('crypto-js'); // Cambiar a require

const app = express();
const port = 5000;
const SECRET_KEY = "";

function decryptMessage(secretKey, encryptedMessage) {
  const key = CryptoJS.enc.Utf8.parse(secretKey.padEnd(32));
  const decodedMessage = CryptoJS.enc.Base64.parse(encryptedMessage);
  const iv = CryptoJS.lib.WordArray.create(decodedMessage.words.slice(0, 4));
  const ciphertext = CryptoJS.lib.WordArray.create(decodedMessage.words.slice(4));
  const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: ciphertext },
      key,
      {
          iv: iv,
          padding: CryptoJS.pad.Pkcs7,
          mode: CryptoJS.mode.CBC
      }
  );
  return decrypted.toString(CryptoJS.enc.Utf8);
}

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  user: '',
  host: '',
  database: '',
  password: '',
  port: ''
});

// Middleware
app.use(cors());
app.use(express.json());

// Ruta para manejar la autenticaciónj
app.post('/api/login', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM Clients WHERE name = $1 AND email = $2 AND password_client = $3',
      [username, email, password]
    );

    if (result.rows.length > 0) {
      // Extraer client_id del resultado
      const clientId = result.rows[0].client_id;
      const clientName = result.rows[0].name;
      // Enviar client_id en la respuesta
      res.json({ success: true, message: 'Login successful', user: result.rows[0], clientId, clientName });
    } else {
      res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
});

app.post('/api/register', async (req, res) => {
  const { username, idCard, email, phone, password} = req.body;

  try {
    // Verificar si el usuario o el correo ya existe
    const userCheck = await pool.query(
      'SELECT * FROM Clients WHERE name = $1 OR email = $2',
      [username, email]
    );

    if (userCheck.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Username or email already exists' });
    }

    // Insertar el nuevo usuario
    await pool.query(
      'INSERT INTO Clients (name, id_card, email, phone, password_client) VALUES ($1, $2, $3, $4, $5)',
      [username, idCard, email, phone, password]
    );

    res.json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});

app.post('/api/money', async (req, res) => {
  const { id } = req.body;
  try {
    const result = await pool.query(
      'SELECT balance FROM Wallet WHERE client_id = $1',
      [id]
    );

    if (result.rows.length > 0) {
      const balance = result.rows[0].balance;
      res.json({ success: true, balance, message: 'Money retrieved successfully' });
    } else {
      res.json({ success: false, message: 'Wallet not found' });
    }
  } catch (error) {
    console.error('Error during money retrieval:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});

app.post('/api/qrValidation', async (req, res) => {
  const { data, id } = req.body;
  console.log(data);
  
  let qr;
  try {
    if (typeof data === 'string') {
      qr = JSON.parse(data.replace(/'/g, '"'));
    } else if (typeof data === 'object') {
      qr = data;
    } else {
      throw new Error('Formato de datos no soportado');
    }
  } catch (error) {
    console.log('Error al parsear la cadena JSON:', error);
    return res.status(400).json({ message: 'Error al procesar el QR.' });
  }

  console.log("Datos del QR recibido:", qr);
  const { transaction, amount, encrypted_message } = qr;

  if (!transaction || !amount || !encrypted_message) {
    return res.status(400).json({ message: 'Datos del QR incompletos.' });
  }

  try {
    const decryptedMessage = decryptMessage(SECRET_KEY, encrypted_message);
    
    if (decryptedMessage !== "is valid") {
      return res.status(400).json({ message: 'QR inválido.' });
    }

    console.log("QR válido, procesando la recarga...");
    return generateRecharge(id, amount, res);
  } catch (error) {
    console.error('Error al desencriptar el mensaje:', error);
    return res.status(500).json({ message: 'Error al procesar la recarga.' });
  }
});


app.post('/api/saleValidation', async (req, res) => {
  const { data, id } = req.body;
  console.log(data);

  let qr;
  try {
    // Verificar si 'data' es un objeto o una cadena
    if (typeof data === 'string') {
      // Si es una cadena, intenta parsear reemplazando comillas simples por dobles
      qr = JSON.parse(data.replace(/'/g, '"'));
    } else if (typeof data === 'object') {
      // Si es un objeto, asignarlo directamente
      qr = data;
    } else {
      throw new Error('Formato de datos no soportado');
    }
  } catch (error) {
    console.log('Error al parsear la cadena JSON:', error);
    return res.status(400).json({ message: 'Error al procesar el QR.' });
  }

  console.log('Datos del QR recibido:');
  console.log(qr);
  const { transaction, OrderID } = qr; // Cambiado a 'OrderID'
  console.log(transaction);
  console.log(OrderID);
  
  // Verificar que los campos necesarios estén presentes
  if (!transaction || !OrderID) {
    return res.status(400).json({ message: 'Datos del QR incompletos.' });
  }

  console.log('QR válido, procesando la venta...');
  return generateSale(id, OrderID, res); // Asegúrate de que la función generateSale esté definida
});

// Función para ver historial de compras
app.post('/api/salesHistory', async (req, res) => {
  const { id } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM sales_history WHERE client_id = $1',
      [id]
    );

    if (result.rows.length > 0) {
      return res.json({ success: true, sales: result.rows, message: 'Sales history retrieved successfully' });
    } else {
      return res.json({ success: false, message: 'Sales history not found' });
    }
  } catch (error) {
    console.error('Error during sales history retrieval:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});

async function generateSale(client_id, orderId, res) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const orderList = await client.query(
        'SELECT * FROM Sale_Order WHERE order_id = $1',
        [orderId]
      );

      if (orderList.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Order not found.' });
      }
      
      const orderUpdate = await client.query(
        'UPDATE Sale_Order SET processed = true WHERE order_id = $1 RETURNING total',
        [orderId]
      );

      if (orderUpdate.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Order not found.' });
      }


      const clientUpdate = await client.query(
        'UPDATE Sale_Order SET client_id = $1 WHERE order_id = $2 RETURNING client_id',
        [client_id, orderId]
      );

      if (clientUpdate.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Client not found.' });
      }


      const saleHistory = await client.query(
        'INSERT INTO sales_history ( client_id, amount) VALUES ($1, $2) returning client_id',
        [client_id, orderUpdate.rows[0].total]
      );

      if (saleHistory.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Order not found.' });
      }

      const walletUpdate = await client.query(
        'UPDATE Wallet SET balance = balance - $1 WHERE client_id = $2 RETURNING balance',
        [orderUpdate.rows[0].total, client_id]
      );

      if (walletUpdate.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Order not found.' });
      }
  
  
      await client.query('COMMIT');
      return res.json({ success: true, message: 'Sale successful'});
    }
    catch (error) {
      console.error('Error during recharge:', error);
      await client.query('ROLLBACK');
      res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    } finally {
      client.release();
    }

  }

// Función para procesar la recarga
async function generateRecharge(client_id, amount, res) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Actualizar el balance en la tabla Wallet
    const updateResult = await client.query(
      'UPDATE Wallet SET balance = balance + $1 WHERE client_id = $2 RETURNING balance',
      [amount, client_id]
    );

    if (updateResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Client not found.' });
    }

    await client.query('COMMIT');
    return res.json({ success: true, message: 'Recharge successful', balance: updateResult.rows[0].balance });
  } catch (error) {
    console.error('Error during recharge:', error);
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  } finally {
    client.release();
  }
}

app.listen(port, () => {
  console.log(`Server running on http://192.168.1.75:${port}`);
});
