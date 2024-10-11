import React, { useState } from 'react';
import { IonContent, IonPage, IonInput, IonItem, IonLabel, IonButton, IonAlert, IonText, IonRouterOutlet } from '@ionic/react';
import { Redirect, Route } from 'react-router-dom';
import { useHistory } from 'react-router-dom';

import "./Login.css"

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const history = useHistory();

  const handleLogin = () => {
    // Basic validation to check if username and password are not empty
    if (username && password) {
      // Store username in localStorage
      localStorage.setItem('username', username);
      // Redirect to home page after successful login
      history.push('/home');
    } else {
      // Show alert if the username or password are missing
      setShowAlert(true);
    }
  };

  return (
    <IonPage>
      <IonContent className='ion-padding'>
        
        <IonItem className='input-item'>
            <IonInput label="Email" labelPlacement="stacked" placeholder=""></IonInput>
        </IonItem>

        <IonItem className='input-item'>
            <IonInput label="Password" type="password" labelPlacement="stacked" placeholder=""></IonInput>
        </IonItem>


        <IonButton expand="block" onClick={handleLogin}>Login</IonButton>


        <IonText>Doesn't have an account? <a>Register Here</a></IonText>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={'Login Failed'}
          message={'Please enter a valid username and password.'}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;
