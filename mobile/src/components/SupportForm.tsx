import {
  IonIcon,
  IonButton,
  IonCard,
  IonCardContent,
  IonItem,
  IonList,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
} from '@ionic/react';

import styles from './SupportForm.module.css';

import Toast from '../components/Toast';

import {
  bugOutline,
  chatboxOutline,
  documentTextOutline,
  helpCircleOutline,
  sendOutline,
  sparklesOutline,
} from 'ionicons/icons';

import { useState, useEffect } from 'react';

import api from '../services/api.service';
import axios from 'axios';

import LoadSpinner from './LoadSpinner';

import {
  MIN_SUPPORT_SUBJECT_SIZE,
  MAX_SUPPORT_SUBJECT_SIZE,
  MIN_SUPPORT_TEXT_SIZE,
  MAX_SUPPORT_TEXT_SIZE,
} from '../constants/app.constant';

const SupportForm: React.FC<{
  onClose: () => void;
  onSuccess: (message: string) => void;
}> = ({ onClose, onSuccess }) => {
  const [inputType, setInputType] = useState<string>('bug');
  const [inputSubject, setInputSubject] = useState<string>('');
  const [inputText, setInputText] = useState<string>('');

  const [isValidInputType, setIsValidInputType] = useState<boolean>(false);
  const [isValidInputSubject, setIsValidInputSubject] =
    useState<boolean>(false);
  const [isValidInputText, setIsValidInputText] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [toastMessage, setToastMessage] = useState<string>('');
  const [displayToast, setDisplayToast] = useState<boolean>(false);
  const [toastType, setToastType] = useState<string>('');

  const availableToastTypes = {
    success: 'success',
    error: 'error',
  };

  const inputAvailableTypes = {
    bug: 'bug',
    feature: 'feature',
    question: 'question',
  };

  const inputAvailableTypesIcons: Record<string, string> = {
    bug: bugOutline,
    feature: sparklesOutline,
    question: helpCircleOutline,
  };

  const validateSubject = () => {
    setIsValidInputSubject(
      inputSubject.trim().length >= MIN_SUPPORT_SUBJECT_SIZE &&
        inputSubject.trim().length <= MAX_SUPPORT_SUBJECT_SIZE,
    );
  };

  const validateText = () => {
    setIsValidInputText(
      inputText.length >= MIN_SUPPORT_TEXT_SIZE &&
        inputText.length <= MAX_SUPPORT_TEXT_SIZE,
    );
  };

  const validateType = () => {
    setIsValidInputType(inputType !== '');
  };

  useEffect(() => {
    validateText();
    validateSubject();
    validateType();
  }, [inputText, inputSubject, inputType]);

  const isValidForm =
    isValidInputType && isValidInputSubject && isValidInputText;

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidForm) {
      return;
    }
    setIsLoading(true);

    const body = {
      type: inputType,
      subject: inputSubject,
      text: inputText,
    };

    try {
      const response = await api.post('/support', body);

      const status = response.status;

      if (status == 200) {
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
        <LoadSpinner message={'Sending Feedback...'} fullScreen={false} />
      ) : (
        <div className={styles.container}>
          <form onSubmit={submitForm}>
            <IonCard className={styles.card}>
              <IonCardContent className={styles.cardContent}>
                <IonList className={styles.list} lines="none">
                  <IonItem className={styles.item} lines="inset">
                    <IonIcon
                      icon={inputAvailableTypesIcons[inputType]}
                      slot="start"
                      className={styles.inputIcon}
                    />
                    <IonSelect
                      label="Type"
                      labelPlacement="start"
                      className={styles.sortRow}
                      interface="action-sheet"
                      value={inputType}
                      onIonChange={(event) => {
                        setInputType(event.target.value);
                      }}
                    >
                      <IonSelectOption value={inputAvailableTypes.bug}>
                        {inputAvailableTypes.bug}
                      </IonSelectOption>
                      <IonSelectOption value={inputAvailableTypes.feature}>
                        {inputAvailableTypes.feature}
                      </IonSelectOption>
                      <IonSelectOption value={inputAvailableTypes.question}>
                        {inputAvailableTypes.question}
                      </IonSelectOption>
                    </IonSelect>
                  </IonItem>

                  <IonItem className={styles.item} lines="inset">
                    <IonIcon
                      icon={documentTextOutline}
                      slot="start"
                      className={styles.inputIcon}
                    />
                    <IonInput
                      label="Subject"
                      labelPlacement="floating"
                      value={inputSubject}
                      type="text"
                      className={''}
                      name="subject"
                      maxlength={MAX_SUPPORT_SUBJECT_SIZE}
                      minlength={MIN_SUPPORT_SUBJECT_SIZE}
                      counter={true}
                      counterFormatter={(inputLength, maxLength) =>
                        `${maxLength - inputLength} characters remaining`
                      }
                      onIonInput={(event) => {
                        setInputSubject(event.target.value! as string);
                      }}
                    ></IonInput>
                  </IonItem>

                  <IonItem
                    className={`${styles.item} ${styles.textareaItem}`}
                    lines="none"
                  >
                    <IonIcon
                      icon={chatboxOutline}
                      slot="start"
                      className={styles.inputIcon}
                    />
                    <IonTextarea
                      label="Message"
                      labelPlacement="floating"
                      value={inputText}
                      placeholder="Leave your message here..."
                      className={''}
                      name="subject"
                      counter={true}
                      maxlength={MAX_SUPPORT_TEXT_SIZE}
                      minlength={MIN_SUPPORT_TEXT_SIZE}
                      counterFormatter={(inputLength, maxLength) =>
                        `${maxLength - inputLength} characters remaining`
                      }
                      onIonInput={(event) => {
                        setInputText(event.target.value! as string);
                      }}
                      autoGrow={true}
                    ></IonTextarea>
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
              Send Feedback
              <IonIcon
                icon={sendOutline}
                slot="start"
                className={styles.inputIcon}
              />
            </IonButton>
          </form>
        </div>
      )}
    </>
  );
};

export default SupportForm;
