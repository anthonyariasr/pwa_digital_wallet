import { IonAlert, IonButton, IonContent, IonInput, IonItem, IonPage, IonText } from '@ionic/react';
import axios from 'axios';
import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import "./Login.css";

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [idCard, setIdCard] = useState('');
  const [email, setEmail] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
 const [successLogin, setSuccessLogin] = useState('');
  const history = useHistory();

  const handleLogin = async () => {
    if (username && email && password && idCard) {
      try {
        const response = await axios.post('http://192.168.1.75:5000/api/login', {
          username,
          email,
          password,
          idCard,
        });
  
        if (response.data.success) {
          const { clientId } = response.data;
  
          // Store clientId in localStorage for later use
          localStorage.setItem('username', username);
          localStorage.setItem('clientId', clientId);
          console.log('username', username);
          // Redirect to home page after successful login
          setSuccessLogin('Ingreso exitoso');
          history.push('/home');
        } else {
          setAlertMessage('Invalid username or password or email.');
          setShowAlert(true);
        }
      } catch (error) {
        setAlertMessage('Error connecting to server. Please try again later.');
        setShowAlert(true);
      }
    } else {
      setAlertMessage('Some fields are missing.');
      setShowAlert(true);
    }
  };
  

  return (
    <IonPage className="login-page">
      <IonContent className='ion-padding login-form'>
        <h1>Inicio de sesión</h1> {/* Agregando un título */}
        <IonItem className='input-item'>
          <IonInput
            value={username}
            onIonChange={(e) => setUsername(e.detail.value!)}
            label="Nombre de usuario"
            labelPlacement="stacked"
            placeholder=""
          ></IonInput>
        </IonItem>

        <IonItem className='input-item'>
          <IonInput
            value={idCard}
            onIonChange={(e) => setIdCard(e.detail.value!)}
            label="Carnet de identidad"
            labelPlacement="stacked"
            placeholder=""
          ></IonInput>
        </IonItem>

        <IonItem className='input-item'>
          <IonInput
            value={email}
            onIonChange={(e) => setEmail(e.detail.value!)}
            label="Correo electrónico"
            labelPlacement="stacked"
            placeholder=""
          ></IonInput>
        </IonItem>

        <IonItem className='input-item'>
          <IonInput
            value={password}
            onIonChange={(e) => setPassword(e.detail.value!)}
            label="Contraseña"
            type="password"
            labelPlacement="stacked"
            placeholder=""
          ></IonInput>
        </IonItem>

        <IonButton expand="block" className="login-button" onClick={handleLogin}>Login</IonButton>

        <IonText className="register-link">
          Don't have an account? <Link to="/Register">Register Here</Link>
        </IonText>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={'Login Failed'}
          message={alertMessage}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;
