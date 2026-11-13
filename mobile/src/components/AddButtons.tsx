import {
  IonIcon,
  IonAlert,
  IonButton,
  IonSelect,
  IonSelectOption,
  IonList,
} from '@ionic/react';

import { addOutline, book } from 'ionicons/icons';

import styles from './AddButtons.module.css';

import { useState, useEffect } from 'react';

import { useUserShelves } from '../queryOptions/useUserShelves';

import CompletedBookForm from './CompletedBookForm';

import api from '../services/api.service';
import axios from 'axios';

import { useQueryClient } from '@tanstack/react-query';

import useAuthStore from '../store/useAuthStore';
import LoadSpinner from './LoadSpinner';

import Toast from '../components/Toast';

import { MIN_SHELF_NAME_SIZE, MAX_SHELF_NAME_SIZE } from '@shelflogr/shared';

const AddButtons: React.FC<{
  defaultValues?: {
    initialRequiredShelf: { name: string; id: string };
    initialOptionalShelves: Array<{ name: string; id: string }>;
  };
  onAddBook: (
    requiredShelf: { name: string; id: string },
    formattedShelvesNames: Array<string>,
    reviewData: {
      rating: number;
      display: string;
      liked: boolean;
      review: string | null;
    } | null,
    optionalShelves: Array<{ name: string; id: string }>,
  ) => void;
  onCancel: () => void;
}> = ({ defaultValues, onAddBook, onCancel }) => {
  const [isAddAlertOpen, setIsAddAlertOpen] = useState<boolean>(false);
  const [isCreateAlertOpen, setIsCreateAlertOpen] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [toastMessage, setToastMessage] = useState<string>('');
  const [displayToast, setDisplayToast] = useState<boolean>(false);
  const [toastType, setToastType] = useState<string>('');

  const availableToastTypes = {
    success: 'success',
    error: 'error',
  };

  const shelvesNamesQuery = useUserShelves();

  const queryClient = useQueryClient();
  const userID = useAuthStore((state) => state.userID);

  const [reviewData, setReviewData] = useState<{
    rating: number;
    display: string;
    liked: boolean;
    review: string | null;
  }>({ rating: 0, display: '', liked: false, review: null });

  const [requiredShelfID, setRequiredShelfID] = useState<string>('');
  const [requiredShelfName, setRequiredShelfName] = useState<string>('');
  const [requiredShelf, setRequiredShelf] = useState<{
    name: string;
    id: string;
  }>({ name: '', id: '' });
  const [optionalShelves, setOptionalShelves] = useState<
    { name: string; id: string }[]
  >([]);

  useEffect(() => {
    if (shelvesNamesQuery.isSuccess && defaultValues) {
      const shelves = shelvesNamesQuery.data.shelves;
      const systemShelves = shelves.filter(
        (shelf: any) => shelf.is_system === true,
      );
      const extraShelves = shelves.filter((shelf: any) => !shelf.is_system);

      const rawReq = defaultValues.initialRequiredShelf;
      const reqName =
        (typeof rawReq === 'object' && rawReq !== null
          ? rawReq.name
          : rawReq) || '';

      if (reqName) {
        const found = systemShelves.find(
          (shelf: any) =>
            shelf.name.toLowerCase() === reqName.toLowerCase() ||
            (typeof rawReq === 'object' && shelf.id === rawReq.id),
        );

        if (found) {
          const formatted =
            found.name.charAt(0).toUpperCase() + found.name.slice(1);
          setRequiredShelfID(found.id);
          setRequiredShelfName(formatted);
          setRequiredShelf({ name: formatted, id: found.id });
        }
      }

      if (
        defaultValues.initialOptionalShelves &&
        defaultValues.initialOptionalShelves.length > 0
      ) {
        const matchingObjects = extraShelves.filter((extra: any) =>
          defaultValues.initialOptionalShelves.some((opt: any) => {
            const optName =
              typeof opt === 'object' && opt !== null ? opt.name : opt;
            const optId =
              typeof opt === 'object' && opt !== null ? opt.id : opt;
            return (
              (optName && extra.name.toLowerCase() === optName.toLowerCase()) ||
              (optId && extra.id === optId)
            );
          }),
        );
        setOptionalShelves(matchingObjects);
      }
    }
  }, [shelvesNamesQuery.data, defaultValues]);

  if (shelvesNamesQuery.isSuccess) {
    const shelves: Array<{
      id: string;
      name: string;
      is_system: boolean;
      quantity: number;
    }> = shelvesNamesQuery.data.shelves;

    const systemShelves = shelves.filter((shelf) => shelf.is_system === true);
    const extraShelves = shelves.filter((shelf) => shelf.is_system === false);

    const extraShelvesNames = extraShelves
      .filter((item) => optionalShelves.some((opt) => opt.id === item.id))
      .map((item) => item.name);

    const shelvesNamesArray = [requiredShelfName, ...extraShelvesNames];

    const handleReviewAdd = (
      rating: number,
      display: string,
      liked: boolean,
      review: string | null,
    ) => {
      setReviewData({ rating, display, liked, review });
    };

    const disabledButton =
      requiredShelfID === '' ||
      (requiredShelfName === 'Completed' &&
        (reviewData.rating < 0 ||
          reviewData.rating > 5 ||
          reviewData.display === ''));

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

    return (
      <>
        <Toast
          message={toastMessage}
          onDismiss={() => setDisplayToast(false)}
          type={toastType}
          open={displayToast}
        />

        <IonAlert
          isOpen={isAddAlertOpen || isCreateAlertOpen}
          header={
            isCreateAlertOpen
              ? 'Create Shelf'
              : isAddAlertOpen
              ? 'Confirm Action'
              : ''
          }
          message={
            isCreateAlertOpen
              ? 'Enter a name for the new shelf'
              : isAddAlertOpen
              ? `Are you sure you want to add this book to:\n\n${shelvesNamesArray.join(
                  '  •  ',
                )}`
              : ''
          }
          cssClass="custom-isbn-alert"
          inputs={
            isCreateAlertOpen
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
              text: 'Confirm',
              role: 'confirm',
              cssClass: 'alert-confirm-button',
              handler: (alertData) => {
                if (isCreateAlertOpen) {
                  const selectedName = String(alertData.inputName).trim();
                  if (selectedName) {
                    if (
                      shelves.some(
                        (shelf: {
                          id: string;
                          name: string;
                          is_system: boolean;
                          quantity: number;
                        }) =>
                          shelf.name.toLowerCase() ===
                          selectedName.toLowerCase(),
                      )
                    ) {
                      setDisplayToast(true);
                      setToastMessage('Shelf with that name already exists.');
                      return false;
                    } else {
                      submitNewShelf(selectedName);
                    }
                  } else {
                    setDisplayToast(true);
                    setToastMessage('Please enter a name');
                    return false;
                  }
                } else {
                  onAddBook(
                    requiredShelf,
                    shelvesNamesArray,
                    requiredShelfName === 'Completed' ? reviewData : null,
                    optionalShelves,
                  );
                }
              },
            },
          ]}
          onDidDismiss={() => {
            setIsAddAlertOpen(false);
            setIsCreateAlertOpen(false);
          }}
          className={styles.alert}
        ></IonAlert>

        {isLoading ? (
          <LoadSpinner message="Creating new shelf..." fullScreen={true} />
        ) : (
          <>
            <div className={styles.dividerDiv}>
              <hr className={styles.divider} />
              SHELVES
              <hr className={styles.divider} />
            </div>

            <IonList inset={true} className={styles.shelvesSelect}>
              <IonSelect
                placeholder="Shelf To Add"
                interfaceOptions={{ header: 'Choose A Shelf' }}
                onIonChange={(e) => {
                  const shelfName = systemShelves.find(
                    (shelf) => shelf.id === e.detail.value,
                  )!.name;

                  const formattedName =
                    shelfName.charAt(0).toUpperCase() + shelfName.slice(1);
                  setRequiredShelfID(e.detail.value);
                  setRequiredShelfName(formattedName);
                  setRequiredShelf({ name: formattedName, id: e.detail.value });

                  if (formattedName !== 'Completed')
                    setReviewData({
                      rating: 0,
                      display: '',
                      liked: false,
                      review: null,
                    });
                }}
                label="Status"
                multiple={false}
                value={requiredShelfID}
              >
                {systemShelves.map(
                  (
                    shelf: {
                      id: string;
                      name: string;
                      is_system: boolean;
                      quantity: number;
                    },
                    index: number,
                  ) => {
                    return (
                      <IonSelectOption key={index} value={shelf.id}>
                        {shelf.name.charAt(0).toUpperCase() +
                          shelf.name.slice(1)}
                      </IonSelectOption>
                    );
                  },
                )}
              </IonSelect>
            </IonList>

            {requiredShelfName === 'Completed' && (
              <CompletedBookForm onReviewChange={handleReviewAdd} />
            )}

            {extraShelves.length > 0 && (
              <IonList inset={true} className={styles.shelvesSelect}>
                <IonSelect
                  placeholder="Extra Shelves"
                  interfaceOptions={{ header: 'Choose The Shelves' }}
                  onIonChange={(e) => {
                    const selectedIDs: string[] = e.detail.value;
                    const selectedObjects = extraShelves.filter((shelf) =>
                      selectedIDs.includes(shelf.id),
                    );
                    setOptionalShelves(selectedObjects);
                  }}
                  label="Optional Shelves"
                  multiple={true}
                  value={optionalShelves.map((shelf) => shelf.id)}
                >
                  {extraShelves.map(
                    (
                      shelf: {
                        id: string;
                        name: string;
                        is_system: boolean;
                        quantity: number;
                      },
                      index: number,
                    ) => {
                      return (
                        <IonSelectOption key={index} value={shelf.id}>
                          {shelf.name.charAt(0).toUpperCase() +
                            shelf.name.slice(1)}
                        </IonSelectOption>
                      );
                    },
                  )}
                </IonSelect>
              </IonList>
            )}

            <IonButton
              expand="block"
              shape="round"
              size="default"
              onClick={() => {
                setIsCreateAlertOpen(true);
              }}
              className={styles.createButton}
              color="primary"
              fill="outline"
            >
              Create New Shelf <IonIcon slot="end" icon={addOutline}></IonIcon>
            </IonButton>

            {defaultValues && defaultValues.initialRequiredShelf !== null ? (
              <div className={styles.editActionsRow}>
                <IonButton
                  shape="round"
                  size="default"
                  fill="outline"
                  onClick={() => onCancel()}
                  className={styles.cancelButton}
                >
                  Cancel
                </IonButton>

                <IonButton
                  shape="round"
                  size="default"
                  color="primary"
                  onClick={() => {
                    setIsAddAlertOpen(true);
                  }}
                  className={styles.saveButton}
                  disabled={disabledButton}
                >
                  {defaultValues && defaultValues.initialRequiredShelf !== null
                    ? 'Save Changes'
                    : 'Add Book To Shelf'}{' '}
                  <IonIcon slot="end" icon={book}></IonIcon>
                </IonButton>
              </div>
            ) : (
              <IonButton
                expand="block"
                shape="round"
                size="default"
                onClick={() => {
                  setIsAddAlertOpen(true);
                }}
                className={styles.submitButton}
                color="primary"
                disabled={disabledButton}
              >
                Add Book To Shelf <IonIcon slot="end" icon={book}></IonIcon>
              </IonButton>
            )}
          </>
        )}
      </>
    );
  }
};

export default AddButtons;
