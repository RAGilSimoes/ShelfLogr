import {
  IonButton,
  IonContent,
  IonPage,
  IonToast,
  IonGrid,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
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

import axios from 'axios';

import LoadSpinner from '../components/LoadSpinner';
import BookInfo from '../components/BookInfo';

import {
  book,
  bookmark,
  checkmarkCircleOutline,
  barcodeOutline,
} from 'ionicons/icons';

import { bookInfo } from '@shelflogr/shared';

import DOMPurify from 'dompurify';

import { useQuery } from '@tanstack/react-query';
import fetchBookInfo from '../queryOptions/addQueries';
import useAuthStore from '../store/useAuthStore';

const Add: React.FC = () => {
  const [bookInfo, setBookInfo] = useState<bookInfo | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [displayErrorMessage, setDisplayErrorMessage] =
    useState<boolean>(false);
  const [isScanAlertOpen, setIsScanAlertOpen] = useState<boolean>(false);
  const [listToAdd, setListToAdd] = useState<string>('');
  const [isAddAlertOpen, setIsAddAlertOpen] = useState<boolean>(false);

  const [tempIsbn, setTempIsbn] = useState<number>(0);
  const [finalIsbn, setFinalIsbn] = useState<string>('');

  const userID = useAuthStore().userID;

  useIonViewWillLeave(() => {
    setBookInfo(undefined);
    setErrorMessage('');
    setDisplayErrorMessage(false);
    setIsScanAlertOpen(false);
    setListToAdd('');
    setIsAddAlertOpen(false);
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
    queryKey: ['bookInfoISBN', finalIsbn, userID],
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

  const addBookToList = async () => {
    try {
      const response = await api.post(`/add-book-to-list`, {
        book: bookInfoQuery.data.book,
        list: listToAdd,
      });

      if (response.status === 200) {
        const message = response.data.message;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setDisplayErrorMessage(true);
        const serverMessage =
          error.response?.data?.error || 'Server communication error.';
        setErrorMessage(serverMessage);
      }
    } finally {
      setIsAddAlertOpen(false);
    }
  };

  const showAddToListsButton =
    bookInfoQuery.isSuccess &&
    bookInfoQuery.data.book &&
    bookInfoQuery.data.currentStatus === undefined;

  const showAlreadyHasBook =
    bookInfoQuery.isSuccess &&
    bookInfoQuery.data.book &&
    bookInfoQuery.data.currentStatus !== undefined;

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonToast
          trigger="open-toast"
          message={errorMessage}
          duration={5000}
          isOpen={displayErrorMessage}
          onDidDismiss={() => {
            setDisplayErrorMessage(false);
            setErrorMessage('');
          }}
          className={styles.customToast}
          position="top"
        ></IonToast>

        <IonAlert
          isOpen={isScanAlertOpen || isAddAlertOpen}
          header={isScanAlertOpen ? 'ISBN Detected' : 'Confirm Action'}
          message={
            isScanAlertOpen
              ? 'Confirm if the displayed ISBN matches the one from the book'
              : `Are you sure you want to add this book to your ${
                  listToAdd.charAt(0).toUpperCase() + listToAdd.slice(1)
                } List?`
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
          buttons={
            isScanAlertOpen
              ? [
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
                ]
              : [
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
                      addBookToList();
                    },
                  },
                ]
          }
          onDidDismiss={() => {
            setIsScanAlertOpen(false);
            setIsAddAlertOpen(false);
          }}
          className={styles.alert}
        ></IonAlert>

        {bookInfoQuery.isFetching ? (
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
                    Add to Completed List{' '}
                    <IonIcon slot="end" icon={book}></IonIcon>
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
                    Add to Reading List{' '}
                    <IonIcon slot="end" icon={book}></IonIcon>
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
              )) ||
                (showAlreadyHasBook && (
                  <>
                    <IonCard color="success">
                      <IonCardHeader className={styles.successHeader}>
                        <IonCardSubtitle className={styles.successTitle}>
                          <IonIcon icon={checkmarkCircleOutline} />
                          {bookInfoQuery.isSuccess
                            ? 'You already added this book!'
                            : ''}
                        </IonCardSubtitle>
                        <IonCardTitle>
                          It's in your{' '}
                          <strong>
                            {bookInfoQuery.data.currentStatus
                              .charAt(0)
                              .toUpperCase() +
                              bookInfoQuery.data.currentStatus.slice(1)}{' '}
                            List
                          </strong>
                          .
                        </IonCardTitle>
                      </IonCardHeader>
                    </IonCard>
                  </>
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
