import {
  IonContent,
  IonPage,
  IonItem,
  IonLabel,
  IonIcon,
  IonImg,
  IonGrid,
  IonButton,
  IonInput,
  IonInputPasswordToggle,
} from '@ionic/react';
import { sunny, cloudyNight, moon, logIn } from 'ionicons/icons';
import ExploreContainer from '../components/ExploreContainer';
import './Login.css';
import { ReactElement, useEffect, useState } from 'react';

import api from '../services/api.service';

const Login: React.FC = () => {
  const [isTouched, setIsTouched] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState<boolean>(false);
  const [isValidPassword, setIsValidPassword] = useState<boolean>(false);

  const [inputEmail, setInputEmail] = useState<string>('');
  const [inputPassword, setInputPassword] = useState<string>('');

  const validateEmail = (email: string) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const validate = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    const name = target.name;

    switch (name) {
      case 'email': {
        setInputEmail(value);
        break;
      }

      case 'password': {
        setInputPassword(value);
        break;
      }

      default:
        break;
    }
  };

  const markTouched = () => {
    setIsTouched(true);
  };

  const validatePassword = () => {
    setIsValidPassword(inputPassword.length >= 8 && inputPassword.length <= 20);
  };

  useEffect(() => {
    validateEmail(inputEmail) !== null
      ? setIsValidEmail(true)
      : setIsValidEmail(false);
    validatePassword();
  }, [inputEmail, inputPassword]);

  const isValidForm = isValidEmail && isValidPassword;

  const submitForm = async (event: Event) => {
    event.preventDefault();

    try {
      const response = await api.get('/');

      console.log(response);
    } catch (error) {
      console.log('erro');
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <form onSubmit={submitForm}>
          <IonGrid style={{ display: 'flex', flexDirection: 'column' }}>
            <IonImg src="../public/ShelfLogr_logo.png"></IonImg>
            <IonItem>
              <IonInput
                className={`${isValidEmail && 'ion-valid'} ${isValidEmail === false && 'ion-invalid'} ${isTouched && 'ion-touched'}`}
                label="Email"
                name="email"
                type="email"
                placeholder="email@domain.com"
                labelPlacement="stacked"
                fill="solid"
                errorText="Invalid email"
                onIonInput={(event) => validate(event)}
                onIonBlur={() => markTouched()}
                value={inputEmail}
                required
              ></IonInput>
            </IonItem>

            <IonItem>
              <IonInput
                className={`${isValidPassword && 'ion-valid'} ${isValidPassword === false && 'ion-invalid'} ${isTouched && 'ion-touched'}`}
                label="Password"
                name="password"
                type="password"
                labelPlacement="stacked"
                fill="outline"
                placeholder="●●●●●●●●"
                onIonInput={(event) => validate(event)}
                onIonBlur={() => markTouched()}
                value={inputPassword}
                required
              >
                <IonInputPasswordToggle slot="end" />
              </IonInput>
            </IonItem>
            <IonButton disabled={!isValidForm} type="submit">
              Login
              <IonIcon slot="end" icon={logIn}></IonIcon>
            </IonButton>
          </IonGrid>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default Login;
