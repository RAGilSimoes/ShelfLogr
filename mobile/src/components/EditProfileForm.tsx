import {
  IonIcon,
  IonButton,
  IonList,
  IonInput,
  IonItem,
  IonCard,
  IonCardContent,
} from '@ionic/react';

import Toast from '../components/Toast';

import { personOutline, mailOutline } from 'ionicons/icons';

import styles from './EditProfileForm.module.css';

import { useState, useEffect } from 'react';

import useAuthStore from '../store/useAuthStore';

import api from '../services/api.service';
import axios from 'axios';

import { useQueryClient } from '@tanstack/react-query';

import LoadSpinner from './LoadSpinner';

const EditProfileForm: React.FC<{
  onClose: () => void;
  profile: { name: string; email: string };
  onSuccess: (message: string) => void;
}> = ({ onClose, profile, onSuccess }) => {
  const queryClient = useQueryClient();
  const userID = useAuthStore((state) => state.userID);

  const { name, email } = profile;

  const [isValidUsername, setIsValidUsername] = useState<boolean>(false);
  const [isValidEmail, setIsValidEmail] = useState<boolean>(false);

  const [inputEmail, setInputEmail] = useState<string>(email);
  const [inputUsername, setInputUsername] = useState<string>(name);

  const [isTouched, setIsTouched] = useState(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [toastMessage, setToastMessage] = useState<string>('');
  const [displayToast, setDisplayToast] = useState<boolean>(false);
  const [toastType, setToastType] = useState<string>('');

  const availableToastTypes = {
    success: 'success',
    error: 'error',
  };

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

  useEffect(() => {
    validateEmail(inputEmail) !== null
      ? setIsValidEmail(true)
      : setIsValidEmail(false);
    validateUsername();
  }, [inputEmail, inputUsername]);

  const isValidForm =
    isValidEmail &&
    isValidUsername &&
    (inputEmail !== email || inputUsername !== name);

  const updateAuthToken = useAuthStore((state) => state.updateJWT);

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidForm) {
      return;
    }
    setIsLoading(true);
    const body = {
      email: inputEmail,
      username: inputUsername,
    };

    try {
      const response = await api.patch('/user/edit-profile', body);

      const status = response.status;

      if (status == 200) {
        const token = response.data.token;
        updateAuthToken(token);
        queryClient.invalidateQueries({
          queryKey: ['userProfile', userID],
        });
        setIsLoading(false);
        onSuccess(response.data.message);
        setToastType(availableToastTypes.success);
        onClose();
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
    <>
      <Toast
        message={toastMessage}
        onDismiss={() => setDisplayToast(false)}
        type={toastType}
        open={displayToast}
      />

      {isLoading ? (
        <LoadSpinner
          message={'Updating Profile Information...'}
          fullScreen={false}
        />
      ) : (
        <div className={styles.container}>
          <form onSubmit={submitForm}>
            <IonCard className={styles.card}>
              <IonCardContent className={styles.cardContent}>
                <IonList className={styles.list} lines="none">
                  <IonItem className={styles.item} lines="inset">
                    <IonIcon
                      icon={personOutline}
                      slot="start"
                      className={styles.inputIcon}
                    />
                    <IonInput
                      label="Username"
                      labelPlacement="floating"
                      value={inputUsername}
                      className={`${
                        isValidUsername ? 'ion-valid' : 'ion-invalid'
                      } ${isTouched ? 'ion-touched' : ''} ${styles.input}`}
                      name="username"
                      type="text"
                      errorText="Invalid username"
                      onIonInput={(event) => validate(event)}
                      onIonBlur={() => markTouched()}
                    ></IonInput>
                  </IonItem>

                  <IonItem className={styles.item} lines="none">
                    <IonIcon
                      icon={mailOutline}
                      slot="start"
                      className={styles.inputIcon}
                    />
                    <IonInput
                      label="E-mail"
                      labelPlacement="floating"
                      value={inputEmail}
                      type="email"
                      className={`${
                        isValidEmail ? 'ion-valid' : 'ion-invalid'
                      } ${isTouched ? 'ion-touched' : ''} ${styles.input}`}
                      name="email"
                      errorText="Invalid email"
                      onIonInput={(event) => validate(event)}
                      onIonBlur={() => markTouched()}
                    ></IonInput>
                  </IonItem>
                </IonList>
              </IonCardContent>
            </IonCard>

            <IonButton
              disabled={!isValidForm}
              type="submit"
              expand="block"
              className={styles.button}
            >
              Save Changes
            </IonButton>
          </form>
        </div>
      )}
    </>
  );
};

export default EditProfileForm;
