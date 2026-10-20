import {
  IonIcon,
  IonAlert,
  IonToast,
  IonList,
  IonItem,
  IonCard,
  IonCardContent,
  IonButton,
} from '@ionic/react';

import styles from './EditShelvesForm.module.css';

import { useState } from 'react';

import useAuthStore from '../store/useAuthStore';

import api from '../services/api.service';
import axios from 'axios';

import { useQueryClient } from '@tanstack/react-query';

import LoadSpinner from './LoadSpinner';

import { useUserLists } from '../queryOptions/useUserLists';
import {
  pencilOutline,
  trashBinOutline,
  alertCircleOutline,
} from 'ionicons/icons';

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

  const submitShelfEdit = async (newName: string) => {
    setIsLoading(true);
    const body = {
      name: newName,
      listID: selectedListID,
    };

    try {
      const response = await api.patch('/user/edit-list', body);

      const status = response.status;

      if (status == 200) {
        queryClient.invalidateQueries({
          queryKey: ['userLists', userID],
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
    } finally {
      setIsLoading(false);
    }
  };

  const deleteShelf = async () => {
    setIsLoading(true);

    try {
      const response = await api.delete(`/user/delete-list/${selectedListID}`);

      const status = response.status;

      if (status == 200) {
        queryClient.invalidateQueries({
          queryKey: ['userLists', userID],
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <IonAlert
        isOpen={isEditAlertOpen || isDeleteAlertOpen}
        header={isDeleteAlertOpen ? 'Delete Shelf' : 'Edit Shelf'}
        message={
          isEditAlertOpen
            ? 'Insert new name for this shelf'
            : isDeleteAlertOpen
            ? `Are you sure you want to delete ${selectedListName}?`
            : ''
        }
        cssClass={
          isDeleteAlertOpen ? 'custom-danger-alert' : 'custom-confirm-alert'
        }
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
            text: isDeleteAlertOpen ? 'Delete' : 'Save',
            role: 'confirm',
            cssClass: isDeleteAlertOpen
              ? 'alert-danger-confirm-button'
              : 'alert-confirm-button',
            handler: (alertData) => {
              if (isEditAlertOpen) {
                const selectedName = String(
                  alertData.inputName || selectedListName,
                ).trim();
                if (selectedName) {
                  if (
                    listsNames.some(
                      (list: {
                        id: string;
                        name: string;
                        is_system: boolean;
                        quantity: number;
                      }) =>
                        list.name.toLowerCase() ===
                          selectedName.toLowerCase() &&
                        list.id !== selectedListID,
                    )
                  ) {
                    setDisplayToast(true);
                    setToastMessage('Shelf with that name already exists.');
                  } else if (selectedListName !== selectedName) {
                    setSelectedListName(selectedName);
                    submitShelfEdit(selectedName);
                  }
                }
              } else {
                deleteShelf();
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
          message={'Updating Shelf Information...'}
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
            <IonCard className={styles.card}>
              <IonCardContent className={styles.cardContent}>
                <IonList className={styles.list} lines="full">
                  {listsNames.map((item) => {
                    const formattedListName =
                      item.name.charAt(0).toUpperCase() + item.name.slice(1);
                    return (
                      <IonItem key={item.id} className={styles.item}>
                        <span className={styles.shelfName}>
                          {formattedListName}
                        </span>
                        {item.is_system ? (
                          <span slot="end" className={styles.defaultBadge}>
                            Default
                          </span>
                        ) : (
                          <div slot="end" className={styles.actions}>
                            <IonIcon
                              icon={pencilOutline}
                              onClick={() => {
                                setIsEditAlertOpen(true);
                                setSelectedListName(item.name);
                                setSelectedListID(item.id);
                              }}
                              className={styles.editIcon}
                            ></IonIcon>
                            <IonIcon
                              icon={trashBinOutline}
                              onClick={() => {
                                setIsDeleteAlertOpen(true);
                                setSelectedListName(item.name);
                                setSelectedListID(item.id);
                              }}
                              className={styles.deleteIcon}
                            ></IonIcon>
                          </div>
                        )}
                      </IonItem>
                    );
                  })}
                </IonList>
              </IonCardContent>
            </IonCard>
          </div>
        </>
      ) : (
        <div className={styles.emptyContainer}>
          <IonIcon icon={alertCircleOutline} className={styles.errorIcon} />
          <h3 className={styles.emptyTitle}>Couldn't Load Books</h3>
          <p className={styles.emptySubtitle}>
            There was a problem connecting to the server. Please check your
            connection and try again.
          </p>
          <IonButton
            fill="outline"
            shape="round"
            className={styles.retryBtn}
            onClick={() => listsNamesQuery.refetch()}
          >
            Try Again
          </IonButton>
        </div>
      )}
    </>
  );
};

export default EditShelvesForm;
