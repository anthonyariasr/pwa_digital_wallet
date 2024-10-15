import { IonAlert, IonButton, IonContent, IonInput, IonItem, IonPage, IonText } from '@ionic/react';
import axios from 'axios';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const history = useHistory();

  const handleRegister = async () => {
    if (username && email && password) {
      try {
        const response = await axios.post('http://localhost:5000/api/register', {
          username,
          email,
          password,
        });

        if (response.data.success) {
          setAlertMessage('Registration successful! Please login.');
          setShowAlert(true);
          // Redirect to login page after successful registration
          history.push('/login');
        } else {
          setAlertMessage('Registration failed. Please try again.');
          setShowAlert(true);
        }
      } catch (error) {
        setAlertMessage('Error connecting to server. Please try again later.');
        setShowAlert(true);
      }
    } else {
      setAlertMessage('Please enter a valid username, password, and email.');
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

        <IonButton expand="block" onClick={handleRegister}>Register</IonButton>

        <IonText>Already have an account? <a href="/login">Login Here</a></IonText>

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
