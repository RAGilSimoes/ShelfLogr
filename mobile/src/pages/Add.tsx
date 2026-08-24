import {
  IonBackButton,
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonToast,
  IonGrid,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  useIonViewWillLeave,
  IonIcon,
  IonAlert,
} from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';

import {
  BarcodeScanner,
  BarcodeFormat,
} from '@capacitor-mlkit/barcode-scanning';

import { useEffect, useState } from 'react';

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

const Add: React.FC = () => {
  const [bookInfo, setBookInfo] = useState<bookInfo | undefined>(undefined);
  const [bookStatus, setBookStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [displayErrorMessage, setDisplayErrorMessage] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isScanAlertOpen, setIsScanAlertOpen] = useState<boolean>(false);
  const [listToAdd, setListToAdd] = useState<string>('');
  const [isAddAlertOpen, setIsAddAlertOpen] = useState<boolean>(false);
  const [currentJob, setCurrentJob] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const [tempIsbn, setTempIsbn] = useState<number>(0);

  useIonViewWillLeave(() => {
    setBookInfo(undefined);
    setBookStatus(null);
    setErrorMessage('');
    setDisplayErrorMessage(false);
    setIsLoading(false);
    setIsScanAlertOpen(false);
    setListToAdd('');
    setIsAddAlertOpen(false);
    setCurrentJob('');
    setSuccessMessage('');
  });

  const checkPermissions = async () => {
    const { camera } = await BarcodeScanner.checkPermissions();
    return camera;
  };

  const requestPermissions = async () => {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera;
  };

  const openSettings = async () => {
    await BarcodeScanner.openSettings();
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
        setIsLoading(false);
      }
    } else {
      setErrorMessage('You need to grant permission to use the camera.');
      setDisplayErrorMessage(true);
    }
  };

  const fetchBookInfo = async (isbn: number) => {
    setIsLoading(true);
    setCurrentJob('info');
    try {
      const response = await api.get(`/get-book-info/${isbn}`);

      if (response.status === 200) {
        if (
          response.data.book.description &&
          response.data.book.description.length !== 0
        ) {
          response.data.book.description = DOMPurify.sanitize(
            response.data.book.description,
          );
        }
        const responseBookInfo: bookInfo = response.data.book;
        if (response.data.currentStatus) {
          setBookStatus(response.data.currentStatus);
          setSuccessMessage('You already added this book!');
        } else {
          setBookStatus('');
        }
        setBookInfo(responseBookInfo);
        setIsLoading(false);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setDisplayErrorMessage(true);
        const serverMessage =
          error.response?.data?.error || 'Server communication error.';
        setErrorMessage(serverMessage);
      }
    } finally {
      setIsLoading(false);
      setIsScanAlertOpen(false);
      setCurrentJob('');
    }
  };

  const addBookToList = async () => {
    setIsLoading(true);
    setCurrentJob('add');
    try {
      const response = await api.post(`/add-book-to-list`, {
        book: bookInfo,
        list: listToAdd,
      });

      if (response.status === 200) {
        const message = response.data.message;
        setBookStatus(listToAdd);
        setSuccessMessage(message);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setDisplayErrorMessage(true);
        const serverMessage =
          error.response?.data?.error || 'Server communication error.';
        setErrorMessage(serverMessage);
      }
    } finally {
      setIsLoading(false);
      setIsAddAlertOpen(false);
      setCurrentJob('');
    }
  };

  const showAddToListsButton = bookInfo && bookStatus === '';
  const showAlreadyHasBook =
    bookInfo && bookStatus !== '' && bookStatus !== null;

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
                  listToAdd === 'reading'
                    ? 'Reading List'
                    : listToAdd === 'completed'
                    ? 'Completed List'
                    : 'Wish List'
                }?`
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
                      const finalIsbn = Number(alertData.isbnField);
                      fetchBookInfo(finalIsbn);
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
            if (isScanAlertOpen) {
              setIsScanAlertOpen(false);
              setTempIsbn(0);
            } else {
              setIsAddAlertOpen(false);
            }
          }}
          className={styles.alert}
        ></IonAlert>

        {isLoading ? (
          <LoadSpinner
            message={
              currentJob === 'info'
                ? `Getting book info...`
                : currentJob === 'add'
                ? `Adding book to ${
                    listToAdd === 'reading'
                      ? 'Reading List'
                      : listToAdd === 'completed'
                      ? 'Completed List'
                      : 'Wish List'
                  } ...`
                : ''
            }
          />
        ) : (
          <>
            <IonGrid
              className={`${styles.grid} ${
                bookInfo === undefined ? styles.centerContent : ''
              }`}
            >
              {bookInfo && <BookInfo bookInfo={bookInfo} detailed={true} />}
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
                      setListToAdd('wishlist');
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
                          {successMessage}
                        </IonCardSubtitle>
                        <IonCardTitle>
                          It's in your{' '}
                          <strong>
                            $
                            {bookStatus === 'reading'
                              ? 'Reading List'
                              : bookStatus === 'completed'
                              ? 'Completed List'
                              : 'Wish List'}
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
