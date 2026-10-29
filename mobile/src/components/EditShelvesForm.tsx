import {
  IonIcon,
  IonAlert,
  IonList,
  IonItem,
  IonCard,
  IonCardContent,
  IonButton,
} from '@ionic/react';

import ErrorDisplay from './ErrorDisplay';

import styles from './EditShelvesForm.module.css';

import { useState } from 'react';

import useAuthStore from '../store/useAuthStore';

import api from '../services/api.service';
import axios from 'axios';

import { useQueryClient } from '@tanstack/react-query';

import LoadSpinner from './LoadSpinner';

import Toast from '../components/Toast';

import { useUserShelves } from '../queryOptions/useUserShelves';
import { pencilOutline, trashBinOutline, addOutline } from 'ionicons/icons';

import {
  MIN_SHELF_NAME_SIZE,
  MAX_SHELF_NAME_SIZE,
} from '../constants/app.constant';

const EditShelvesForm: React.FC<{
  onClose: () => void;
  onSuccess: (message: string) => void;
}> = ({ onClose, onSuccess }) => {
  const shelvesNamesQuery = useUserShelves();

  const queryClient = useQueryClient();
  const userID = useAuthStore((state) => state.userID);

  const [toastMessage, setToastMessage] = useState<string>('');
  const [displayToast, setDisplayToast] = useState<boolean>(false);

  const [toastType, setToastType] = useState<string>('');

  const availableToastTypes = {
    success: 'success',
    error: 'error',
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [isEditAlertOpen, setIsEditAlertOpen] = useState<boolean>(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState<boolean>(false);
  const [isCreateAlertOpen, setIsCreateAlertOpen] = useState<boolean>(false);

  const [selectedShelfID, setSelectedShelfID] = useState<string>('');
  const [selectedShelfName, setSelectedShelfName] = useState<string>('');

  let shelvesNames: Array<{
    id: string;
    name: string;
    is_system: boolean;
    quantity: number;
  }> = shelvesNamesQuery.isSuccess ? shelvesNamesQuery.data.shelves : [];

  const submitShelfEdit = async (newName: string) => {
    setIsLoading(true);
    const body = {
      name: newName,
      shelfID: selectedShelfID,
    };

    try {
      const response = await api.patch('/user/edit-shelf', body);

      const status = response.status;

      if (status == 200) {
        queryClient.invalidateQueries({
          queryKey: ['userShelves', userID],
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

  const submitNewShelf = async (newName: string) => {
    setIsLoading(true);
    const body = {
      name: newName,
    };

    try {
      const response = await api.post('/user/create-shelf', body);

      const status = response.status;

      if (status == 200) {
        queryClient.invalidateQueries({
          queryKey: ['userShelves', userID],
        });
        setIsLoading(false);
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

  const deleteShelf = async () => {
    setIsLoading(true);

    try {
      const response = await api.delete(
        `/user/delete-shelf/${selectedShelfID}`,
      );

      const status = response.status;

      if (status == 200) {
        queryClient.invalidateQueries({
          queryKey: ['userShelves', userID],
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
      <IonAlert
        isOpen={isEditAlertOpen || isDeleteAlertOpen || isCreateAlertOpen}
        header={
          isDeleteAlertOpen
            ? 'Delete Shelf'
            : isEditAlertOpen
            ? 'Edit Shelf'
            : isCreateAlertOpen
            ? 'Create Shelf'
            : ''
        }
        message={
          isEditAlertOpen
            ? 'Enter a new name for this shelf'
            : isDeleteAlertOpen
            ? `Are you sure you want to delete ${selectedShelfName}?`
            : isCreateAlertOpen
            ? 'Enter a name for the new shelf'
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
                  value: `${selectedShelfName}`,
                  placeholder: `${selectedShelfName}`,
                  cssClass: 'alert-isbn-input',
                  attributes: {
                    minLength: MIN_SHELF_NAME_SIZE,
                    maxLength: MAX_SHELF_NAME_SIZE,
                  },
                },
              ]
            : isCreateAlertOpen
            ? [
                {
                  type: 'text',
                  name: 'inputName',
                  placeholder: 'Favorites',
                  cssClass: 'alert-isbn-input',
                  attributes: {
                    minLength: MIN_SHELF_NAME_SIZE,
                    maxLength: MAX_SHELF_NAME_SIZE,
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
              if (isEditAlertOpen || isCreateAlertOpen) {
                const selectedName = String(alertData.inputName).trim();
                if (selectedName) {
                  if (
                    shelvesNames.some(
                      (shelf: {
                        id: string;
                        name: string;
                        is_system: boolean;
                        quantity: number;
                      }) => {
                        if (isEditAlertOpen) {
                          return (
                            shelf.name.toLowerCase() ===
                              selectedName.toLowerCase() &&
                            shelf.id !== selectedShelfID
                          );
                        } else if (isCreateAlertOpen) {
                          return (
                            shelf.name.toLowerCase() ===
                            selectedName.toLowerCase()
                          );
                        }
                      },
                    )
                  ) {
                    setDisplayToast(true);
                    setToastMessage('Shelf with that name already exists.');
                    setToastType(availableToastTypes.error);
                    return false;
                  } else if (
                    isEditAlertOpen &&
                    selectedShelfName !== selectedName
                  ) {
                    setSelectedShelfName(selectedName);
                    submitShelfEdit(selectedName);
                  } else if (isCreateAlertOpen) {
                    submitNewShelf(selectedName);
                  }
                } else {
                  setDisplayToast(true);
                  setToastMessage('Please enter a name.');
                  setToastType(availableToastTypes.error);
                  return false;
                }
              } else {
                deleteShelf();
              }
            },
          },
        ]}
        onDidDismiss={() => {
          setIsEditAlertOpen(false);
          setIsDeleteAlertOpen(false);
          setIsCreateAlertOpen(false);
        }}
        className={styles.alert}
      ></IonAlert>
      <Toast
        message={toastMessage}
        onDismiss={() => setDisplayToast(false)}
        type={toastType}
        open={displayToast}
      />

      {isLoading ? (
        <LoadSpinner
          message={'Updating Shelf Information...'}
          fullScreen={false}
        />
      ) : shelvesNamesQuery.isFetching ? (
        <LoadSpinner
          message={'Getting Shelves Information...'}
          fullScreen={false}
        />
      ) : shelvesNamesQuery.isSuccess && shelvesNames.length > 0 ? (
        <>
          <div className={styles.container}>
            <IonCard className={styles.card}>
              <IonCardContent className={styles.cardContent}>
                <IonList className={styles.list} lines="full">
                  {shelvesNames.map((shelf) => {
                    const formattedShelfName =
                      shelf.name.charAt(0).toUpperCase() + shelf.name.slice(1);
                    return (
                      <IonItem key={shelf.id} className={styles.item}>
                        <span className={styles.shelfName}>
                          {formattedShelfName}
                        </span>
                        {shelf.is_system ? (
                          <span slot="end" className={styles.defaultBadge}>
                            Default
                          </span>
                        ) : (
                          <div slot="end" className={styles.actions}>
                            <IonIcon
                              icon={pencilOutline}
                              onClick={() => {
                                setIsEditAlertOpen(true);
                                setSelectedShelfName(shelf.name);
                                setSelectedShelfID(shelf.id);
                              }}
                              className={styles.editIcon}
                            ></IonIcon>
                            <IonIcon
                              icon={trashBinOutline}
                              onClick={() => {
                                setIsDeleteAlertOpen(true);
                                setSelectedShelfName(shelf.name);
                                setSelectedShelfID(shelf.id);
                              }}
                              className={styles.deleteIcon}
                            ></IonIcon>
                          </div>
                        )}
                      </IonItem>
                    );
                  })}
                </IonList>
                <IonButton
                  expand="block"
                  shape="round"
                  size="default"
                  onClick={() => {
                    setIsCreateAlertOpen(true);
                  }}
                  className="ion-margin-top ion-margin-bottom"
                  color="primary"
                  fill="outline"
                >
                  Create New Shelf{' '}
                  <IonIcon slot="end" icon={addOutline}></IonIcon>
                </IonButton>
              </IonCardContent>
            </IonCard>
          </div>
        </>
      ) : (
        <ErrorDisplay
          title="Couldn't Load Shelves"
          subtitle="There was a problem loading your shelves."
          onRetry={() => {
            shelvesNamesQuery.refetch();
          }}
        />
      )}
    </>
  );
};

export default EditShelvesForm;
