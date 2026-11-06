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
} from '@ionic/react';

import api from '../services/api.service';
import axios from 'axios';

import styles from './ResetPage.module.css';

import Toast from '../components/Toast';

import { useState, useEffect } from 'react';

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

  const [inputEmail, setInputEmail] = useState<string>('');

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

      default:
        break;
    }
  };

  const markTouched = () => {
    setIsTouched(true);
  };

  useEffect(() => {
    validateEmail(inputEmail) !== null
      ? setIsValidEmail(true)
      : setIsValidEmail(false);
  }, [inputEmail]);

  const isValidForm = isValidEmail;

  const generateCode = async (event: React.FormEvent<HTMLFormElement>) => {
    setIsLoading(true);
    event.preventDefault();

    if (!isValidForm) {
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
              disabled={!isValidForm || isLoading}
              type="submit"
              expand="block"
            >
              Generate Code
            </IonButton>
          </div>
        </form>

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
