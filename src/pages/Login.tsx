import { IonAlert, IonButton, IonContent, IonInput, IonItem, IonPage, IonText } from '@ionic/react';
import axios from 'axios';
import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import "./Login.css";

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const history = useHistory();

  const handleLogin = async () => {
    if (username && email && password) {
      try {
        const response = await axios.post('http://localhost:5000/api/login', {
          username,
          email,
          password,
        });

        if (response.data.success) {
          // Store username in localStorage
          localStorage.setItem('username', username);
          // Redirect to home page after successful login
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
      setAlertMessage('Please enter a valid username and password and email.');
      setShowAlert(true);
    }
  };

  return (
    <IonPage>
      <IonContent className='ion-padding'>
        <IonItem className='input-item'>
          <IonInput
            value={username}
            onIonChange={(e) => setUsername(e.detail.value!)}
            label="Username"
            labelPlacement="stacked"
            placeholder=""
          ></IonInput>
        </IonItem>

        <IonItem className='input-item'>
          <IonInput
            value={email}
            onIonChange={(e) => setEmail(e.detail.value!)}
            label="Email"
            labelPlacement="stacked"
            placeholder=""
          ></IonInput>
        </IonItem>

        <IonItem className='input-item'>
          <IonInput
            value={password}
            onIonChange={(e) => setPassword(e.detail.value!)}
            label="Password"
            type="password"
            labelPlacement="stacked"
            placeholder=""
          ></IonInput>
        </IonItem>

        <IonButton expand="block" onClick={handleLogin}>Login</IonButton>

        <IonText>
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