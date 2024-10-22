import { IonAlert, IonButton, IonContent, IonPage, IonText } from '@ionic/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom'; // Importa useHistory para navegación
import './Home.css';
import Scanner from './Scanner';

const Home: React.FC = () => {
  const [walletBalance, setWalletBalance] = useState(0.00);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const history = useHistory();

  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);
  const userId = localStorage.getItem('clientId');
  const username = localStorage.getItem('username');

  const handleMoney = async () => {
    if (userId) {
      try {
        console.log('userId', userId);  
        const response = await axios.post('http://192.168.1.75:5000/api/money', { id: userId });

        if (response.data.success) {
          const balanceInt = parseInt(response.data.balance, 10);
          setWalletBalance(balanceInt || 0.00);
        } else {
          setAlertMessage(response.data.message || 'No se pudo obtener el saldo del monedero.');
          setShowAlert(true);
        }
      } catch (error) {
        setAlertMessage('Error al conectar con el servidor. Inténtalo más tarde.');
        setShowAlert(true);
      }
    } else {
      setAlertMessage('Falta el ID del usuario.');
      setShowAlert(true);
    }
  };

  const handleScanSuccess = async (data: string | null) => {
    setShowScanner(false); // Oculta el escáner después de un escaneo exitoso
    if (data) {
      try {
        setAlertMessage('Validando el código QR...');
        console.log('Data recibido del QR:', data);

        let parsedData;
        try {
          const jsonData = data.replace(/'/g, '"');
          parsedData = JSON.parse(jsonData);
        } catch (error) {
          console.error('Error al parsear el JSON:', error);
          setAlertMessage('El formato del código QR es incorrecto.');
          setShowAlert(true);
          return;
        }      
        let apiEndpoint = '';
        if (parsedData.transaction === 'recharge') {
          apiEndpoint = 'http://192.168.1.75:5000/api/qrValidation';
        } else if (parsedData.transaction === 'sale') {
          apiEndpoint = 'http://192.168.1.75:5000/api/saleValidation';
        } else {
          setAlertMessage('Tipo de transacción no válido en el código QR.');
          setShowAlert(true);
          return;
        }
      
        const response = await axios.post(apiEndpoint, {
          data: parsedData,
          id: userId,
        });
      
        console.log('Respuesta del servidor:', response.data);
      
        if (response.data && response.data.success) {
          setAlertMessage(`Operación exitosa: ${response.data.message}`);
          await handleMoney(); // Actualizar el saldo del monedero después de una operación exitosa
        } else {
          setAlertMessage(`Error en la operación: ${response.data.message || 'Respuesta inesperada del servidor.'}`);
        }
        
        setShowAlert(true);
      } catch (error) {
        console.error('Error al realizar la solicitud:', error);
        setAlertMessage('Error al validar el QR. Por favor, inténtalo de nuevo más tarde.');
        setShowAlert(true);
      }
    } else {
      setAlertMessage('No se encontró ningún dato en el código QR.');
      setShowAlert(true);
    }
  };

  const handleHistorySucces = async () => {
    try {
      const response = await axios.post('http://192.168.1.75:5000/api/salesHistory', {
        id: userId,
      });
      console.log('Respuesta del servidor:', response.data);
      const sales = Array.isArray(response.data.sales) ? response.data.sales : [];
      localStorage.setItem('purchaseHistory', JSON.stringify(sales));
      
      // Navega a la nueva página de historial
      history.push('/History');
    } catch (error) {
      setAlertMessage('Error al obtener el historial de compras. Por favor, inténtalo de nuevo más tarde.');
      setShowAlert(true);
    }
  };

  useEffect(() => {
    handleMoney();
  }, []);
  
  return (
    <IonPage>
      <IonContent className='ion-padding home-form'>
        <div className="home-container">
          <div className="username">
            <IonText>
              <p>{username}</p>
            </IonText>
          </div>
  
          <div className="wallet-balance">
            <IonText>
              <h3>Saldo:</h3>
            </IonText>
            <IonText>
              <p>${walletBalance.toFixed(2)}</p>
            </IonText>
          </div>
  
          <IonButton expand="block" className="history-button" onClick={handleHistorySucces}>
            Historial de compras
          </IonButton>
  
          {showHistory && (
            <div className="history-table">
              <table>
                <thead>
                  <tr>
                    <th>ID de Venta</th>
                    <th>Monto</th>
                    <th>Fecha de Venta</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(purchaseHistory) && purchaseHistory.map((sale) => (
                    <tr key={sale.sale_id}>
                      <td>{sale.sale_id}</td>
                      <td>${sale.amount.toFixed(2)}</td>
                      <td>{new Date(sale.sale_date).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
  
          <IonButton
            className="scan-button"
            shape="round"
            onClick={() => setShowScanner(true)}
          >
            Escanear
          </IonButton>
  
          {showScanner && (
            <div>
              <Scanner onScanSuccess={handleScanSuccess} />
              <IonButton
                className="backbutton"
                shape="round"
                color="danger"
                onClick={() => setShowScanner(false)}  // Acción para cerrar el escáner
              >
                Regresar
              </IonButton>
            </div>
          )}
        </div>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => {
            setShowAlert(false);
            setAlertMessage('');
            setShowScanner(false);
          }}
          header={'Resultado'}
          message={alertMessage}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Home;
