import {
  IonContent,
  IonPage,
  IonItem,
  IonIcon,
  IonImg,
  IonGrid,
  IonButton,
  IonInput,
  IonInputPasswordToggle,
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

import styles from './Login.module.css';

import useAuthStore from '../store/useAuthStore';

import { useQueryClient } from '@tanstack/react-query';
import { fetchUserLists } from '../queryOptions/loginQueries';

import {
  useUserLists,
  getUserListsOptions,
  getUserListsNamesOptions,
} from '../queryOptions/useUserLists';
import { jwtDecode } from 'jwt-decode';

import Toast from '../components/Toast';

const Login: React.FC = () => {
  const history = useHistory();
  const location = useLocation<{ message?: string }>();

  const queryClient = useQueryClient();

  const [displayToast, setDisplayToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  const [toastType, setToastType] = useState<string>('');

  const availableToastTypes = {
    success: 'success',
    error: 'error',
  };

  const [isTouched, setIsTouched] = useState<boolean>(false);
  const [isValidEmail, setIsValidEmail] = useState<boolean>(false);
  const [isValidPassword, setIsValidPassword] = useState<boolean>(false);

  const [inputEmail, setInputEmail] = useState<string>('');
  const [inputPassword, setInputPassword] = useState<string>('');

  useEffect(() => {
    if (location.state?.message) {
      setToastMessage(location.state.message);
      setDisplayToast(true);
      setToastType(availableToastTypes.error);

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

  const updateAuthToken = useAuthStore((state) => state.updateJWT);

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidForm) {
      return;
    }

    const body = {
      email: inputEmail,
      password: inputPassword,
    };

    try {
      const response = await api.post('/login', body);

      const status = response.status;

      if (status == 200) {
        const token = response.data.token;
        updateAuthToken(token);

        const decodedToken: { id: string; email: string; name: string } =
          jwtDecode(token);

        queryClient.prefetchQuery(getUserListsOptions(decodedToken.id));

        queryClient.prefetchQuery(getUserListsNamesOptions(decodedToken.id));

        setDisplayToast(false);
        setToastMessage('');
        history.push('/app/home');
      }
    } catch (error) {
      setDisplayToast(true);

      if (axios.isAxiosError(error)) {
        const serverMessage =
          error.response?.data?.error || 'Server communication error.';
        setToastMessage(serverMessage);
      } else {
        setToastMessage('Unexpected error occurred.');
      }
      setToastType(availableToastTypes.error);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen scrollY={false}>
        <IonGrid className={styles.grid}>
          <IonImg src="/ShelfLogr_logo.png" className={styles.logo}></IonImg>
          <form onSubmit={submitForm} className={styles.loginForm}>
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
            <div className="action-group">
              <IonButton
                disabled={!isValidForm}
                type="submit"
                expand="block"
                onClick={(e) => submitForm(e as any)}
              >
                Login
                <IonIcon slot="end" icon={logIn}></IonIcon>
              </IonButton>

              <div className="ion-text-center">
                <IonText color="medium">
                  <p>
                    Don't have an account?{' '}
                    <IonRouterLink routerLink="/register" color="primary">
                      Register Here
                    </IonRouterLink>
                  </p>
                </IonText>
              </div>
            </div>
          </form>
        </IonGrid>

        <Toast
          message={toastMessage}
          onDismiss={() => setDisplayToast(false)}
          type={toastType}
          open={displayToast}
        />
      </IonContent>
      <IonFooter className="ion-no-border" translucent={true} collapse="fade">
        <IonToolbar>
          <div className={`ion-text-center ${styles.footer}`}>
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

export default Login;
