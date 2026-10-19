import {
  IonIcon,
  IonAlert,
  IonButton,
  IonToast,
  IonSelectOption,
  IonList,
  IonItem,
  IonInput,
} from '@ionic/react';

import styles from './EditShelvesForm.module.css';

import { useState, useEffect } from 'react';

import useAuthStore from '../store/useAuthStore';

import api from '../services/api.service';
import axios from 'axios';

import { useQueryClient } from '@tanstack/react-query';

import LoadSpinner from './LoadSpinner';

import { useUserLists } from '../queryOptions/useUserLists';
import { pencilOutline, trashBinOutline } from 'ionicons/icons';

const EditShelvesForm: React.FC<{
  onClose: () => void;
  onSuccess: (message: string) => void;
}> = ({ onClose, onSuccess }) => {
  const listsNamesQuery = useUserLists();

  const queryClient = useQueryClient();
  const userID = useAuthStore((state) => state.userID);

  const [toastMessage, setToastMessage] = useState<string>('');
  const [displayToast, setDisplayToast] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [isEditAlertOpen, setIsEditAlertOpen] = useState<boolean>(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState<boolean>(false);

  const [selectedListID, setSelectedListID] = useState<string>('');
  const [selectedListName, setSelectedListName] = useState<string>('');

  let listsNames: Array<{
    id: string;
    name: string;
    is_system: boolean;
    quantity: number;
  }> = listsNamesQuery.isSuccess ? listsNamesQuery.data.lists : [];

  const submitShelveEdit = (newName: string) => {
    console.log(newName);
  };

  return (
    <>
      <IonAlert
        isOpen={isEditAlertOpen || isDeleteAlertOpen}
        header={isEditAlertOpen ? 'Edit Shelve' : 'Delete Shelve'}
        message={
          isEditAlertOpen
            ? 'Insert new name for this shelve'
            : `Are you sure you want to delete ${selectedListName}?`
        }
        cssClass="custom-isbn-alert"
        inputs={
          isEditAlertOpen
            ? [
                {
                  type: 'text',
                  name: 'inputName',
                  value: `${selectedListName}`,
                  placeholder: `${selectedListName}`,
                  cssClass: 'alert-isbn-input',
                  attributes: {
                    minLength: 1,
                  },
                },
              ]
            : []
        }
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
            handler: (alertData) => {
              if (isEditAlertOpen) {
                const selectedName = String(
                  alertData.inputName || selectedListName,
                ).trim();
                if (selectedName) {
                  setIsEditAlertOpen(false);
                  if (selectedListName !== selectedName) {
                    setSelectedListName(selectedName);
                    submitShelveEdit(selectedName);
                  }
                }
              } else {
                setIsDeleteAlertOpen(false);
                console.log(`Deleting ${selectedListName}...`);
              }
            },
          },
        ]}
        onDidDismiss={() => {
          isEditAlertOpen
            ? setIsEditAlertOpen(false)
            : setIsDeleteAlertOpen(false);
        }}
        className={styles.alert}
      ></IonAlert>

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
        <LoadSpinner
          message={'Updating Shelve Information...'}
          fullScreen={false}
        />
      ) : listsNamesQuery.isFetching ? (
        <LoadSpinner
          message={'Getting Shelves Information...'}
          fullScreen={false}
        />
      ) : listsNamesQuery.isSuccess && listsNames.length > 0 ? (
        <>
          <div className={styles.container}>
            <IonList>
              {listsNames.map((item) => {
                const formattedListName =
                  item.name.charAt(0).toUpperCase() + item.name.slice(1);
                return (
                  <IonItem key={item.id}>
                    <strong>{formattedListName}</strong>
                    {item.is_system ? (
                      <strong>Default</strong>
                    ) : (
                      <div>
                        <IonIcon
                          icon={pencilOutline}
                          onClick={() => {
                            setIsEditAlertOpen(true);
                            setSelectedListName(item.name);
                            setSelectedListID(item.id);
                          }}
                        ></IonIcon>
                        <IonIcon
                          icon={trashBinOutline}
                          onClick={() => {
                            setIsDeleteAlertOpen(true);
                            setSelectedListName(item.name);
                            setSelectedListID(item.id);
                          }}
                        ></IonIcon>
                      </div>
                    )}
                  </IonItem>
                );
              })}
            </IonList>
          </div>
        </>
      ) : (
        <p>Erro</p>
      )}
    </>
  );
};

export default EditShelvesForm;
