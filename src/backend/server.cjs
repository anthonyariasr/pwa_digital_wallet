const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 5000;

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

// Ruta para manejar la autenticación
app.post('/api/login', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM Clients WHERE name = $1 AND email = $2 AND password_client = $3',
      [username, email, password]
    );

    if (result.rows.length > 0) {
      res.json({ success: true, message: 'Login successful', user: result.rows[0] });
    } else {
      res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
});

app.post('/api/register', async (req, res) => {
  const { username, email, phone, password } = req.body;

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
      'INSERT INTO Clients (name, email, phone, password_client) VALUES ($1, $2, $3, $4)',
      [username, email, phone, password]
    );

    res.json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
