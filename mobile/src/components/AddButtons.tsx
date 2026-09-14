import { IonIcon, IonAlert, IonButton } from '@ionic/react';

import { book, bookmark } from 'ionicons/icons';

import styles from './AddButtons.module.css';

import { useState } from 'react';

const AddButtons: React.FC<{ onAddBook: (list: string) => void }> = ({
  onAddBook,
}) => {
  const [listToAdd, setListToAdd] = useState<string>('');
  const [isAddAlertOpen, setIsAddAlertOpen] = useState<boolean>(false);
  return (
    <>
      <IonAlert
        isOpen={isAddAlertOpen}
        header={'Confirm Action'}
        message={`Are you sure you want to add this book to your ${
          listToAdd.charAt(0).toUpperCase() + listToAdd.slice(1)
        } List?`}
        cssClass="custom-isbn-alert"
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'alert-cancel-button',
          },
          {
            text: 'Confirm',
            role: 'confirm',
            cssClass: 'alert-confirm-button',
            handler: () => {
              onAddBook(listToAdd);
            },
          },
        ]}
        onDidDismiss={() => {
          setIsAddAlertOpen(false);
        }}
        className={styles.alert}
      ></IonAlert>

      <IonButton
        expand="block"
        shape="round"
        size="default"
        onClick={() => {
          setListToAdd('completed');
          setIsAddAlertOpen(true);
        }}
        className="ion-margin-top"
        color="primary"
      >
        Add to Completed List <IonIcon slot="end" icon={book}></IonIcon>
      </IonButton>
      <IonButton
        expand="block"
        shape="round"
        size="default"
        onClick={() => {
          setListToAdd('reading');
          setIsAddAlertOpen(true);
        }}
        className="ion-margin-top"
        color="primary"
      >
        Add to Reading List <IonIcon slot="end" icon={book}></IonIcon>
      </IonButton>
      <IonButton
        expand="block"
        shape="round"
        size="default"
        onClick={() => {
          setListToAdd('wish');
          setIsAddAlertOpen(true);
        }}
        className="ion-margin-top"
        color="tertiary"
      >
        Add to Wish List
        <IonIcon slot="end" icon={bookmark}></IonIcon>
      </IonButton>
    </>
  );
};

export default AddButtons;
