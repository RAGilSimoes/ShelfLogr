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
  IonToast,
  IonText,
  IonRouterLink,
  IonFooter,
  IonToolbar,
} from '@ionic/react';
import { logIn } from 'ionicons/icons';
import { useEffect, useState } from 'react';

import axios from 'axios';

import { useHistory, useLocation } from 'react-router-dom';

import api from '../services/api.service';

import { setToken } from '../services/auth.service';

import styles from './Register.module.css';

const Register: React.FC = () => {
  const history = useHistory();
  const location = useLocation<{ message?: string }>();

  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isTouched, setIsTouched] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState<boolean>(false);
  const [isValidPassword, setIsValidPassword] = useState<boolean>(false);
  const [isValidVerifyPassword, setIsValidVerifyPassword] =
    useState<boolean>(false);
  const [isValidUsername, setIsValidUsername] = useState<boolean>(false);

  const [inputEmail, setInputEmail] = useState<string>('');
  const [inputUsername, setInputUsername] = useState<string>('');
  const [inputPassword, setInputPassword] = useState<string>('');
  const [inputVerifyPassword, setInputVerifyPassword] = useState<string>('');

  useEffect(() => {
    if (location.state?.message) {
      setErrorMessage(location.state.message);
      setShowError(true);

      history.replace('/login', {});
    }
  }, [location.state]);

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

      case 'username': {
        setInputUsername(value);
        break;
      }

      case 'password': {
        setInputPassword(value);
        break;
      }

      case 'verifyPassword': {
        setInputVerifyPassword(value);
        break;
      }

      default:
        break;
    }
  };

  const markTouched = () => {
    setIsTouched(true);
  };

  const validateUsername = () => {
    setIsValidUsername(inputUsername.trim().length >= 2);
  };

  const validatePassword = () => {
    setIsValidPassword(inputPassword.length >= 8 && inputPassword.length <= 20);
  };

  const validatePasswordInputs = () => {
    setIsValidVerifyPassword(inputPassword == inputVerifyPassword);
  };

  useEffect(() => {
    validateEmail(inputEmail) !== null
      ? setIsValidEmail(true)
      : setIsValidEmail(false);
    validateUsername();
    validatePassword();
    validatePasswordInputs();
  }, [inputEmail, inputUsername, inputPassword, inputVerifyPassword]);

  const isValidForm =
    isValidEmail && isValidPassword && isValidVerifyPassword && isValidUsername;

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidForm) {
      return;
    }

    const body = {
      email: inputEmail,
      username: inputUsername,
      password: inputPassword,
    };

    try {
      const response = await api.post('/register', body);

      const status = response.status;

      if (status == 200) {
        const token = response.data.token;
        setToken(token);
        setShowError(false);
        setErrorMessage('');
        history.push('/app/home');
      }
    } catch (error) {
      setShowError(true);

      if (axios.isAxiosError(error)) {
        const serverMessage =
          error.response?.data?.error || 'Server communication error.';
        setErrorMessage(serverMessage);
      } else {
        setErrorMessage('Unexpected error occurred.');
      }
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonGrid className={styles.grid}>
          <IonImg src="/ShelfLogr_logo.png" className={styles.logo}></IonImg>
          <form onSubmit={submitForm} className={styles.registerForm}>
            <IonItem>
              <IonInput
                className={`${isValidEmail ? 'ion-valid' : 'ion-invalid'} ${
                  isTouched ? 'ion-touched' : ''
                } ${styles.input}`}
                label="Email"
                name="email"
                type="email"
                placeholder="email@domain.com"
                labelPlacement="stacked"
                errorText="Invalid email"
                onIonInput={(event) => validate(event)}
                onIonBlur={() => markTouched()}
                value={inputEmail}
                required
              ></IonInput>
            </IonItem>

            <IonItem>
              <IonInput
                className={`${isValidUsername ? 'ion-valid' : 'ion-invalid'} ${
                  isTouched ? 'ion-touched' : ''
                } ${styles.input}`}
                label="Username"
                name="username"
                type="text"
                placeholder="John Doe"
                labelPlacement="stacked"
                errorText="Invalid username"
                onIonInput={(event) => validate(event)}
                onIonBlur={() => markTouched()}
                value={inputUsername}
                required
              ></IonInput>
            </IonItem>

            <IonItem>
              <IonInput
                className={`${isValidPassword ? 'ion-valid' : 'ion-invalid'} ${
                  isTouched ? 'ion-touched' : ''
                } ${styles.input}`}
                label="Password"
                name="password"
                type="password"
                labelPlacement="stacked"
                placeholder="●●●●●●●●"
                errorText="Invalid password"
                onIonInput={(event) => validate(event)}
                onIonBlur={() => markTouched()}
                value={inputPassword}
                required
              >
                <IonInputPasswordToggle slot="end" />
              </IonInput>
            </IonItem>
            <IonItem>
              <IonInput
                className={`${
                  isValidVerifyPassword ? 'ion-valid' : 'ion-invalid'
                } ${isTouched ? 'ion-touched' : ''} ${styles.input}`}
                label="Confirm Password"
                name="verifyPassword"
                type="password"
                labelPlacement="stacked"
                placeholder="●●●●●●●●"
                errorText="Passwords don't match"
                onIonInput={(event) => validate(event)}
                onIonBlur={() => markTouched()}
                value={inputVerifyPassword}
                required
              >
                <IonInputPasswordToggle slot="end" />
              </IonInput>
            </IonItem>
            <div className="action-group">
              <IonButton disabled={!isValidForm} type="submit" expand="block">
                Register
                <IonIcon slot="end" icon={logIn}></IonIcon>
              </IonButton>

              <div className="ion-text-center">
                <IonText color="medium">
                  <p>
                    Already have an account?{' '}
                    <IonRouterLink routerLink="/login" color="primary">
                      Login Here
                    </IonRouterLink>
                  </p>
                </IonText>
              </div>
            </div>
          </form>
        </IonGrid>

        <IonToast
          trigger="open-toast"
          message={errorMessage}
          duration={5000}
          isOpen={showError}
          onDidDismiss={() => {
            setShowError(false);
            setErrorMessage('');
          }}
          className={styles.customToast}
        ></IonToast>
      </IonContent>
      <IonFooter className="ion-no-border" translucent={true} collapse="fade">
        <IonToolbar>
          <div className="ion-text-center" style={{ fontSize: '0.75rem' }}>
            <IonText color="medium">v0.0.1</IonText>
            {' - '}
            <IonText color="medium">
              Developed by{' '}
              <a href="https://ragilsimoes.github.io/">Ricardo André Simões</a>
            </IonText>
          </div>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default Register;
