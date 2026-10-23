import {
  IonIcon,
  IonButton,
  IonCard,
  IonCardContent,
  IonItem,
  IonList,
  IonInput,
  IonInputPasswordToggle,
} from '@ionic/react';

import styles from './ChangePasswordForm.module.css';

import { useState, useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import useAuthStore from '../store/useAuthStore';

import axios from 'axios';

import api from '../services/api.service';

import { lockClosedOutline } from 'ionicons/icons';

import LoadSpinner from './LoadSpinner';

import Toast from '../components/Toast';

const ChangePasswordForm: React.FC<{
  onClose: () => void;
  onSuccess: (message: string) => void;
}> = ({ onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const userID = useAuthStore((state) => state.userID);

  const [isTouched, setIsTouched] = useState(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [toastMessage, setToastMessage] = useState<string>('');
  const [displayToast, setDisplayToast] = useState<boolean>(false);

  const [toastType, setToastType] = useState<string>('');

  const availableToastTypes = {
    success: 'success',
    error: 'error',
  };

  const [inputOldPassword, setInputOldPassword] = useState<string>('');
  const [inputPassword, setInputPassword] = useState<string>('');
  const [inputVerifyPassword, setInputVerifyPassword] = useState<string>('');

  const [isValidOldPassword, setIsValidOldPassword] = useState<boolean>(false);
  const [isValidPassword, setIsValidPassword] = useState<boolean>(false);
  const [isValidVerifyPassword, setIsValidVerifyPassword] =
    useState<boolean>(false);

  const validate = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    const name = target.name;

    switch (name) {
      case 'oldPassword': {
        setInputOldPassword(value);
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

  const validateOldPassword = () => {
    setIsValidOldPassword(
      inputOldPassword.length >= 8 && inputOldPassword.length <= 20,
    );
  };

  const validatePassword = () => {
    setIsValidPassword(inputPassword.length >= 8 && inputPassword.length <= 20);
  };

  const validatePasswordInputs = () => {
    setIsValidVerifyPassword(inputPassword == inputVerifyPassword);
  };

  useEffect(() => {
    validateOldPassword();
    validatePassword();
    validatePasswordInputs();
  }, [inputOldPassword, inputPassword, inputVerifyPassword]);

  const isValidForm =
    isValidOldPassword && isValidPassword && isValidVerifyPassword;

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidForm) {
      return;
    }
    setIsLoading(true);
    const body = {
      oldPassword: inputOldPassword,
      password: inputPassword,
    };

    try {
      const response = await api.patch('/user/edit-password', body);

      const status = response.status;

      if (status == 200) {
        queryClient.invalidateQueries({
          queryKey: ['userProfile', userID],
        });
        setIsLoading(false);
        onSuccess(response.data.message);
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
        <LoadSpinner message={'Updating password...'} fullScreen={false} />
      ) : (
        <div className={styles.container}>
          <form onSubmit={submitForm}>
            <IonCard className={styles.card}>
              <IonCardContent className={styles.cardContent}>
                <IonList className={styles.list} lines="none">
                  <IonItem className={styles.item} lines="inset">
                    <IonIcon
                      icon={lockClosedOutline}
                      slot="start"
                      className={styles.inputIcon}
                    />
                    <IonInput
                      label="Current Password"
                      labelPlacement="stacked"
                      value={inputOldPassword}
                      className={`${
                        isValidOldPassword ? 'ion-valid' : 'ion-invalid'
                      } ${isTouched ? 'ion-touched' : ''} ${styles.input}`}
                      name="oldPassword"
                      type="password"
                      errorText="Invalid current password"
                      placeholder="●●●●●●●●"
                      onIonInput={(event) => validate(event)}
                      onIonBlur={() => markTouched()}
                    >
                      <IonInputPasswordToggle slot="end" />
                    </IonInput>
                  </IonItem>

                  <IonItem className={styles.item} lines="inset">
                    <IonIcon
                      icon={lockClosedOutline}
                      slot="start"
                      className={styles.inputIcon}
                    />
                    <IonInput
                      label="New Password"
                      labelPlacement="stacked"
                      value={inputPassword}
                      type="password"
                      className={`${
                        isValidPassword ? 'ion-valid' : 'ion-invalid'
                      } ${isTouched ? 'ion-touched' : ''} ${styles.input}`}
                      name="password"
                      errorText="Invalid password"
                      placeholder="●●●●●●●●"
                      onIonInput={(event) => validate(event)}
                      onIonBlur={() => markTouched()}
                    >
                      <IonInputPasswordToggle slot="end" />
                    </IonInput>
                  </IonItem>

                  <IonItem className={styles.item} lines="none">
                    <IonIcon
                      icon={lockClosedOutline}
                      slot="start"
                      className={styles.inputIcon}
                    />
                    <IonInput
                      label="Confirm Password"
                      labelPlacement="stacked"
                      value={inputVerifyPassword}
                      type="password"
                      className={`${
                        isValidVerifyPassword ? 'ion-valid' : 'ion-invalid'
                      } ${isTouched ? 'ion-touched' : ''} ${styles.input}`}
                      name="verifyPassword"
                      errorText="Passwords don't match"
                      placeholder="●●●●●●●●"
                      onIonInput={(event) => validate(event)}
                      onIonBlur={() => markTouched()}
                    >
                      <IonInputPasswordToggle slot="end" />
                    </IonInput>
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
              Change Password
            </IonButton>
          </form>
        </div>
      )}
    </>
  );
};

export default ChangePasswordForm;
