import {
  IonIcon,
  IonButton,
  IonCard,
  IonCardContent,
  IonItem,
  IonList,
  IonToast,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
} from '@ionic/react';

import styles from './SupportForm.module.css';

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

  const minLengthSubject = 10;
  const maxLengthSubject = 50;

  const minLengthText = 15;
  const maxLengthText = 500;

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
      inputSubject.trim().length >= minLengthSubject &&
        inputSubject.trim().length <= maxLengthSubject,
    );
  };

  const validateText = () => {
    setIsValidInputText(
      inputText.length >= minLengthText && inputText.length <= maxLengthText,
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <IonToast
        trigger="open-toast"
        message={toastMessage}
        duration={2500}
        isOpen={displayToast}
        onDidDismiss={() => {
          setDisplayToast(false);
          setToastMessage('');
        }}
        className={`${styles.customToast} ${styles.errorToast}`}
        position="top"
      ></IonToast>
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
                        Bug
                      </IonSelectOption>
                      <IonSelectOption value={inputAvailableTypes.feature}>
                        Feature
                      </IonSelectOption>
                      <IonSelectOption value={inputAvailableTypes.question}>
                        Question
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
                      maxlength={maxLengthSubject}
                      minlength={minLengthSubject}
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
                      maxlength={maxLengthText}
                      minlength={minLengthText}
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
