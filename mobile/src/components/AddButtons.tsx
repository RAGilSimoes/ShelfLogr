import {
  IonIcon,
  IonAlert,
  IonButton,
  IonSelect,
  IonSelectOption,
  IonList,
  IonToast,
} from '@ionic/react';

import { addOutline, book } from 'ionicons/icons';

import styles from './AddButtons.module.css';

import { useState } from 'react';

import { useUserLists } from '../queryOptions/useUserLists';

import CompletedBookForm from './CompletedBookForm';

import api from '../services/api.service';
import axios from 'axios';

import { useQueryClient } from '@tanstack/react-query';

import useAuthStore from '../store/useAuthStore';
import LoadSpinner from './LoadSpinner';

const AddButtons: React.FC<{
  onAddBook: (
    requiredList: string,
    formattedListNames: Array<string>,
    reviewData: {
      rating: number;
      display: string;
      liked: boolean;
      review: string | null;
    } | null,
    optionalLists: Array<string> | null,
  ) => void;
}> = ({ onAddBook }) => {
  const [isAddAlertOpen, setIsAddAlertOpen] = useState<boolean>(false);
  const [isCreateAlertOpen, setIsCreateAlertOpen] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [toastMessage, setToastMessage] = useState<string>('');
  const [displayToast, setDisplayToast] = useState<boolean>(false);

  const listsNamesQuery = useUserLists();

  const [requiredListID, setRequiredListID] = useState<string>('');
  const [requiredListName, setRequiredListName] = useState<string>('');

  const [optionalListsID, setOptionalListsID] = useState<string[]>([]);

  const queryClient = useQueryClient();
  const userID = useAuthStore((state) => state.userID);

  const [reviewData, setReviewData] = useState<{
    rating: number;
    display: string;
    liked: boolean;
    review: string | null;
  }>({ rating: 0, display: '', liked: false, review: null });

  if (listsNamesQuery.isSuccess) {
    const lists: Array<{
      id: string;
      name: string;
      is_system: boolean;
      quantity: number;
    }> = listsNamesQuery.data.lists;

    const systemLists = lists.filter((list) => list.is_system === true);
    const extraLists = lists.filter((list) => list.is_system === false);

    const extraListsNames = extraLists
      .filter((item) => optionalListsID.includes(item.id))
      .map((item) => item.name);

    const listsNamesArray = [requiredListName, ...extraListsNames];

    const handleReviewAdd = (
      rating: number,
      display: string,
      liked: boolean,
      review: string | null,
    ) => {
      setReviewData({ rating, display, liked, review });
    };

    const disabledButton =
      requiredListID === '' ||
      (requiredListName === 'Completed' &&
        (reviewData.rating < 0 ||
          reviewData.rating > 5 ||
          reviewData.display === ''));

    const submitNewList = async (newName: string) => {
      setIsLoading(true);
      const body = {
        name: newName,
      };

      try {
        const response = await api.post('/user/create-list', body);

        const status = response.status;

        if (status == 200) {
          queryClient.invalidateQueries({
            queryKey: ['userLists', userID],
          });
          setIsLoading(false);
          setDisplayToast(true);
          setToastMessage(response.data.message);
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

        <IonAlert
          isOpen={isAddAlertOpen || isCreateAlertOpen}
          header={
            isCreateAlertOpen
              ? 'Create List'
              : isAddAlertOpen
              ? 'Confirm Action'
              : ''
          }
          message={
            isCreateAlertOpen
              ? 'Insert the name for the new list'
              : isAddAlertOpen
              ? `Are you sure you want to add this book to the following lists?\n\n
            ${listsNamesArray.map((item) => '• ' + item).join('\n')}`
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
                if (isCreateAlertOpen) {
                  const selectedName = String(alertData.inputName).trim();
                  if (selectedName) {
                    if (
                      lists.some(
                        (list: {
                          id: string;
                          name: string;
                          is_system: boolean;
                          quantity: number;
                        }) =>
                          list.name.toLowerCase() ===
                          selectedName.toLowerCase(),
                      )
                    ) {
                      setDisplayToast(true);
                      setToastMessage('Shelf with that name already exists.');
                      return false;
                    } else {
                      submitNewList(selectedName);
                    }
                  } else {
                    setDisplayToast(true);
                    setToastMessage('Please insert a name');
                    return false;
                  }
                } else {
                  onAddBook(
                    requiredListID,
                    listsNamesArray,
                    requiredListName === 'Completed' ? reviewData : null,
                    optionalListsID,
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
          <LoadSpinner message="Creating new list..." fullScreen={true} />
        ) : (
          <>
            <div className={styles.dividerDiv}>
              <hr className={styles.divider} />
              LISTS
              <hr className={styles.divider} />
            </div>

            <IonList inset={true} className={styles.listsSelect}>
              <IonSelect
                placeholder="List To Add"
                interfaceOptions={{ header: 'Choose A List' }}
                onIonChange={(e) => {
                  const listName = systemLists.find(
                    (list) => list.id === e.detail.value,
                  )!.name;

                  const formattedName =
                    listName.charAt(0).toUpperCase() + listName.slice(1);
                  setRequiredListID(e.detail.value);
                  setRequiredListName(formattedName);

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
                value={requiredListID}
              >
                {systemLists.map(
                  (
                    list: {
                      id: string;
                      name: string;
                      is_system: boolean;
                      quantity: number;
                    },
                    index: number,
                  ) => {
                    return (
                      <IonSelectOption key={index} value={list.id}>
                        {list.name.charAt(0).toUpperCase() + list.name.slice(1)}
                      </IonSelectOption>
                    );
                  },
                )}
              </IonSelect>
            </IonList>

            {requiredListName === 'Completed' && (
              <CompletedBookForm onReviewChange={handleReviewAdd} />
            )}

            {extraLists.length > 0 && (
              <IonList inset={true} className={styles.listsSelect}>
                <IonSelect
                  placeholder="Extra List(s)"
                  interfaceOptions={{ header: 'Choose The List(s)' }}
                  onIonChange={(e) => {
                    setOptionalListsID(e.detail.value);
                  }}
                  label="Optional Lists"
                  multiple={true}
                  value={optionalListsID}
                >
                  {extraLists.map(
                    (
                      list: {
                        id: string;
                        name: string;
                        is_system: boolean;
                        quantity: number;
                      },
                      index: number,
                    ) => {
                      return (
                        <IonSelectOption key={index} value={list.id}>
                          {list.name.charAt(0).toUpperCase() +
                            list.name.slice(1)}
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
              className="ion-margin-top ion-margin-bottom"
              color="primary"
              fill="outline"
            >
              Create New List <IonIcon slot="end" icon={addOutline}></IonIcon>
            </IonButton>

            <IonButton
              expand="block"
              shape="round"
              size="default"
              onClick={() => {
                setIsAddAlertOpen(true);
              }}
              className="ion-margin-top ion-margin-bottom"
              color="primary"
              disabled={disabledButton}
            >
              Add Book To List <IonIcon slot="end" icon={book}></IonIcon>
            </IonButton>
          </>
        )}
      </>
    );
  }
};

export default AddButtons;
