import {
  IonButton,
  IonContent,
  IonPage,
  IonToast,
  IonGrid,
  useIonViewWillLeave,
  IonIcon,
  IonAlert,
} from '@ionic/react';

import {
  BarcodeScanner,
  BarcodeFormat,
} from '@capacitor-mlkit/barcode-scanning';

import { useState } from 'react';

import styles from './Add.module.css';

import api from '../services/api.service';

import LoadSpinner from '../components/LoadSpinner';
import BookInfo from '../components/BookInfo';
import StatusFeedback from '../components/StatusFeedback';

import { barcodeOutline } from 'ionicons/icons';

import { bookInfo } from '@shelflogr/shared';

import DOMPurify from 'dompurify';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import fetchBookInfo from '../queryOptions/addQueries';
import useAuthStore from '../store/useAuthStore';
import AddButtons from '../components/AddButtons';

const Add: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [displayErrorMessage, setDisplayErrorMessage] =
    useState<boolean>(false);
  const [isScanAlertOpen, setIsScanAlertOpen] = useState<boolean>(false);
  const [listToAdd, setListToAdd] = useState<string>('');

  const [tempIsbn, setTempIsbn] = useState<number>(0);
  const [finalIsbn, setFinalIsbn] = useState<string>('');

  const queryClient = useQueryClient();

  const userID = useAuthStore().userID;

  useIonViewWillLeave(() => {
    setErrorMessage('');
    setDisplayErrorMessage(false);
    setIsScanAlertOpen(false);
    setListToAdd('');

    queryClient.removeQueries({
      queryKey: ['bookInfoISBN', userID, finalIsbn],
    });
    addBookToList.reset();

    setFinalIsbn('');
  });

  const checkPermissions = async () => {
    const { camera } = await BarcodeScanner.checkPermissions();
    return camera;
  };

  const requestPermissions = async () => {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera;
  };

  const scan = async () => {
    const { barcodes } = await BarcodeScanner.scan({
      formats: [BarcodeFormat.Ean13],
      autoZoom: true,
    });
    return barcodes;
  };

  const readBarcode = async () => {
    setErrorMessage('');
    setDisplayErrorMessage(false);
    setTempIsbn(0);

    let cameraPermission = await checkPermissions();

    if (cameraPermission !== 'granted') {
      cameraPermission = await requestPermissions();
    }

    if (cameraPermission === 'granted') {
      try {
        const barcodes = await scan();

        if (barcodes.length > 0 && barcodes[0].valueType === 'ISBN') {
          const isbn = barcodes[0].displayValue;

          setTempIsbn(Number(isbn));

          setIsScanAlertOpen(true);
        } else {
          setErrorMessage("Barcode doesn't match a book");

          setDisplayErrorMessage(true);
        }
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage('Error scanning barcode');
        }
        setDisplayErrorMessage(true);
      } finally {
        BarcodeScanner.stopScan();
      }
    } else {
      setErrorMessage('You need to grant permission to use the camera.');
      setDisplayErrorMessage(true);
    }
  };

  const bookInfoQuery = useQuery({
    queryKey: ['bookInfoISBN', userID, finalIsbn],
    queryFn: () => fetchBookInfo(finalIsbn),
    enabled: finalIsbn !== '',
    select(data) {
      if (
        data.result &&
        data.result.book.description &&
        data.result.book.description.length !== 0
      ) {
        data.result.book.description = DOMPurify.sanitize(
          data.result.book.description,
        );
      }

      return data.result;
    },
  });

  const addBookToList = useMutation({
    mutationFn: (content: { book: bookInfo; list: string }) => {
      return api.post('/add-book-to-list', content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [['userBook']],
      });
      queryClient.invalidateQueries({
        queryKey: ['trendingCategoryBooks', userID],
      });
      queryClient.invalidateQueries({
        queryKey: ['trendingBooks', userID],
      });
      queryClient.invalidateQueries({
        queryKey: ['bookInfoISBN', userID],
      });
      useAuthStore.getState().removeActiveBookRecommendationID();
    },
  });

  const handleBookAdd = (list: string) => {
    setListToAdd(list);
    addBookToList.mutate({
      book: bookInfoQuery.data.book,
      list: list,
    });
  };

  const showAddToListsButton =
    bookInfoQuery.isSuccess &&
    bookInfoQuery.data.book &&
    bookInfoQuery.data.list === null &&
    addBookToList.isIdle;

  const showAlreadyHasBook =
    bookInfoQuery.isSuccess &&
    bookInfoQuery.data.book &&
    bookInfoQuery.data.list !== null;

  let list;
  let successMessage;

  if (bookInfoQuery.isSuccess && addBookToList.isIdle) {
    list =
      bookInfoQuery.data.list.charAt(0).toUpperCase() +
      bookInfoQuery.data.list.slice(1);
    successMessage = 'You already added this book!';
  } else if (addBookToList.isSuccess) {
    list =
      addBookToList.variables.list.charAt(0).toUpperCase() +
      addBookToList.variables.list.slice(1);
    successMessage = addBookToList.data.data.message;
  }

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonToast
          trigger="open-toast"
          message={
            addBookToList.isError
              ? addBookToList.error?.message
              : bookInfoQuery.isError
              ? bookInfoQuery.error.message
              : errorMessage
          }
          duration={5000}
          isOpen={
            addBookToList.isError ||
            bookInfoQuery.isError ||
            displayErrorMessage
          }
          onDidDismiss={() => {
            setDisplayErrorMessage(false);
            setErrorMessage('');
          }}
          className={styles.customToast}
          position="top"
        ></IonToast>

        <IonAlert
          isOpen={isScanAlertOpen}
          header={'ISBN Detected'}
          message={
            'Confirm if the displayed ISBN matches the one from the book'
          }
          cssClass="custom-isbn-alert"
          inputs={
            isScanAlertOpen
              ? [
                  {
                    type: 'number',
                    name: 'isbnField',
                    value: `${tempIsbn}`,
                    placeholder: `${tempIsbn}`,
                    cssClass: 'alert-isbn-input',
                    attributes: {
                      minLength: 13,
                      maxlength: 13,
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
              text: 'Get Info',
              role: 'confirm',
              cssClass: 'alert-confirm-button',
              handler: (alertData) => {
                const selectedIsbn = String(
                  alertData.isbnField || tempIsbn,
                ).trim();
                if (selectedIsbn) {
                  setIsScanAlertOpen(false);
                  if (selectedIsbn === finalIsbn) bookInfoQuery.refetch();
                  else setFinalIsbn(selectedIsbn);
                }
              },
            },
          ]}
          onDidDismiss={() => {
            setIsScanAlertOpen(false);
          }}
          className={styles.alert}
        ></IonAlert>

        {bookInfoQuery.isFetching || addBookToList.isPending ? (
          <LoadSpinner
            message={
              bookInfoQuery.isFetching
                ? `Getting book info...`
                : `Adding book to ${
                    listToAdd.charAt(0).toUpperCase() + listToAdd.slice(1)
                  } List ...`
            }
            fullScreen={true}
          />
        ) : (
          <>
            <IonGrid
              className={`${styles.grid} ${
                bookInfoQuery.isSuccess && bookInfoQuery.data.book === undefined
                  ? styles.centerContent
                  : ''
              }`}
            >
              {bookInfoQuery.isSuccess && bookInfoQuery.data.book && (
                <BookInfo bookInfo={bookInfoQuery.data.book} detailed={false} />
              )}
              {(showAddToListsButton && (
                <>
                  <AddButtons onAddBook={handleBookAdd} />
                </>
              )) ||
                ((showAlreadyHasBook || addBookToList.isSuccess) && (
                  <StatusFeedback
                    successMessage={successMessage}
                    list={[list]}
                  />
                ))}
              <IonButton
                expand="block"
                shape="round"
                size={showAddToListsButton === true ? 'default' : 'large'}
                fill={showAddToListsButton === true ? 'outline' : 'solid'}
                color={showAddToListsButton === true ? 'medium' : 'primary'}
                onClick={readBarcode}
                className="ion-margin-top"
              >
                <IonIcon slot="start" icon={barcodeOutline}></IonIcon>
                Scan Barcode
              </IonButton>
            </IonGrid>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Add;
