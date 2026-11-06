import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
  IonItem,
  IonInput,
  IonInputPasswordToggle,
} from '@ionic/react';

import api from '../services/api.service';
import axios from 'axios';

import styles from './ResetPage.module.css';

import Toast from '../components/Toast';

import { useState, useEffect } from 'react';

import useAuthStore from '../store/useAuthStore';

import {
  MIN_PASSWORD_SIZE,
  MAX_PASSWORD_SIZE,
} from '../constants/app.constant';

const ResetPage: React.FC = () => {
  const [displayToast, setDisplayToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  const [toastType, setToastType] = useState<string>('');

  const availableToastTypes = {
    success: 'success',
    error: 'error',
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [isTouched, setIsTouched] = useState<boolean>(false);
  const [isValidEmail, setIsValidEmail] = useState<boolean>(false);
  const [isValidCode, setisValidCode] = useState<boolean>(false);
  const [isValidPassword, setIsValidPassword] = useState<boolean>(false);
  const [isValidVerifyPassword, setIsValidVerifyPassword] =
    useState<boolean>(false);
  const [inputPassword, setInputPassword] = useState<string>('');
  const [inputVerifyPassword, setInputVerifyPassword] = useState<string>('');

  const [inputEmail, setInputEmail] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');

  const [isCodeSent, setIsCodeSent] = useState<boolean>(false);

  const validateEmail = (email: string) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const validateCode = (code: string) => {
    return !isNaN(Number(code)) && code.length === 6;
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

      case 'code': {
        setInputCode(value);
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

  const validatePassword = () => {
    setIsValidPassword(
      inputPassword.length >= MIN_PASSWORD_SIZE &&
        inputPassword.length <= MAX_PASSWORD_SIZE,
    );
  };

  const validatePasswordInputs = () => {
    setIsValidVerifyPassword(inputPassword == inputVerifyPassword);
  };

  useEffect(() => {
    validateEmail(inputEmail) !== null
      ? setIsValidEmail(true)
      : setIsValidEmail(false);
  }, [inputEmail]);

  useEffect(() => {
    setisValidCode(validateCode(inputCode));
    validatePassword();
    validatePasswordInputs();
  }, [inputCode, inputPassword, inputVerifyPassword]);

  const isValidRequestForm = isValidEmail;

  const isValidResetForm =
    isValidPassword && isValidVerifyPassword && isValidCode;

  const updateAuthToken = useAuthStore((state) => state.updateJWT);

  const generateCode = async (event: React.FormEvent<HTMLFormElement>) => {
    setIsLoading(true);
    event.preventDefault();

    if (!isValidRequestForm) {
      return;
    }

    const body = {
      email: inputEmail,
    };

    try {
      const response = await api.post('/forgot-password', body);

      const status = response.status;

      if (status === 200) {
        setDisplayToast(true);
        setToastMessage(response.data.message);
        setToastType(availableToastTypes.success);
        setIsCodeSent(true);
        setIsTouched(false);
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
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    console.log('Password reset');
    return;
    //   setIsLoading(true);
    //   event.preventDefault();

    //   if (!isValidResetForm) {
    //     return;
    //   }

    //   const body = {
    //     code: inputCode,
    //   };

    //   try {
    //     const response = await api.post('/forgot-password', body);

    //     const status = response.status;

    //     if (status === 200) {
    //       setDisplayToast(true);
    //       setToastMessage(response.data.message);
    //       setToastType(availableToastTypes.success);
    //       setIsCodeSent(true);
    //     }
    //   } catch (error) {
    //     setDisplayToast(true);

    //     if (axios.isAxiosError(error)) {
    //       const serverMessage =
    //         error.response?.data?.error || 'Server communication error.';
    //       setToastMessage(serverMessage);
    //     } else {
    //       setToastMessage('Unexpected error occurred.');
    //     }
    //     setToastType(availableToastTypes.error);
    //   } finally {
    //     setIsLoading(false);
    //   }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton></IonBackButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {!isCodeSent ? (
          <form onSubmit={generateCode} className={styles.resetForm}>
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

            <div className="action-group">
              <IonButton
                disabled={!isValidRequestForm || isLoading}
                type="submit"
                expand="block"
              >
                Generate Code
              </IonButton>
            </div>
          </form>
        ) : (
          <form onSubmit={resetPassword} className={styles.resetForm}>
            <h1>Insert the code sent to your e-mail</h1>
            <h6>Check your e-mail inbox or the spam folder</h6>
            <IonItem>
              <IonInput
                className={styles.codeInput}
                label="Code"
                name="code"
                type="text"
                placeholder="xxxxxx"
                labelPlacement="stacked"
                value={inputCode}
                inputMode="numeric"
                maxlength={6}
                required
                onIonInput={(event) => validate(event)}
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
              <IonButton
                disabled={!isValidResetForm || isLoading}
                type="submit"
                expand="block"
              >
                Reset Password
              </IonButton>
            </div>
          </form>
        )}

        <Toast
          message={toastMessage}
          onDismiss={() => setDisplayToast(false)}
          type={toastType}
          open={displayToast}
        />
      </IonContent>
    </IonPage>
  );
};

export default ResetPage;
