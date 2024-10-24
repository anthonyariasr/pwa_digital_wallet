import { IonAlert, IonButton, IonContent, IonInput, IonItem, IonPage, IonText } from '@ionic/react';
import axios from 'axios';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import logo from '../images/logo-1913689_1280.png';
import './Register.css'; // Asegúrate de importar el archivo CSS

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [idCard, setIdCard] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const history = useHistory();

  const handleRegister = async () => {
    if (username && email && password && phone && idCard) {
      try {
        const response = await axios.post('http://192.168.1.75:5000/api/register', {
          username,
          email,
          password,
          phone,
          idCard,
        });
        if (response.data.success) {
          setAlertMessage('Registration successful! Please login.');
          setShowAlert(true);
          // Redirect to login page after successful registration
          history.push('/tab1');
        } else {
          setAlertMessage('Registration failed. Please try again.');
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
    <IonPage className="register-page">
      <IonContent className="ion-padding register-form"> {/* Agregar clase de contenedor */}
      <img src={logo} alt="logo" className="logo" />
      <h1>Registro</h1> {/* Agregando un título */}
        <IonItem className="input-item">
          <IonInput
            value={username}
            onIonChange={(e) => setUsername(e.detail.value!)}
            label="Nombre de usuario"
            labelPlacement="stacked"
            placeholder=""
          ></IonInput>
        </IonItem>
        <IonItem className="input-item">
          <IonInput
            value={idCard}
            onIonChange={(e) => setIdCard(e.detail.value!)}
            label="Cédula"
            labelPlacement="stacked"
            placeholder=""
          ></IonInput>
        </IonItem>
        <IonItem className="input-item">
          <IonInput
            value={email}
            onIonChange={(e) => setEmail(e.detail.value!)}
            label="Correo electrónico"
            labelPlacement="stacked"
            placeholder=""
          ></IonInput>
        </IonItem>
        <IonItem className="input-item">
          <IonInput
            value={phone}
            onIonChange={(e) => setPhone(e.detail.value!)}
            label="Número de teléfono"
            labelPlacement="stacked"
            placeholder=""
          ></IonInput>
        </IonItem>
        <IonItem className="input-item">
          <IonInput
            value={password}
            onIonChange={(e) => setPassword(e.detail.value!)}
            label="Contraseña"
            type="password"
            labelPlacement="stacked"
            placeholder=""
          ></IonInput>
        </IonItem>
        <IonButton expand="block" onClick={handleRegister}>Register</IonButton>
        <IonText>
          Already have an account? <a href="/tab1">Login Here</a>
        </IonText>
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={'Registration'}
          message={alertMessage}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Register;
