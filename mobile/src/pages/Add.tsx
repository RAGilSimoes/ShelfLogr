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

import { book, bookmark } from 'ionicons/icons';

import { bookInfo } from '@shelflogr/shared';

import DOMPurify from 'dompurify';

const Add: React.FC = () => {
  const [bookInfo, setBookInfo] = useState<bookInfo | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [displayErrorMessage, setDisplayErrorMessage] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);

  const [tempIsbn, setTempIsbn] = useState<number>(0);

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

  const lerBarcode = async () => {
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

          setIsAlertOpen(true);
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

  useIonViewWillLeave(() => {
    setBookInfo(undefined);
  });

  const fetchBookInfo = async (isbn: number) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/get-book-info/${isbn}`);

      if (response.status === 200) {
        if (
          response.data.description &&
          response.data.description.length !== 0
        ) {
          response.data.description = DOMPurify.sanitize(
            response.data.description,
          );
        }
        const responseBookInfo: bookInfo = response.data;
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
      setIsAlertOpen(false);
    }
  };

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
          isOpen={isAlertOpen}
          header="ISBN Detected"
          message="Confirm if the displayed ISBN matches the one from the book"
          cssClass="custom-isbn-alert"
          inputs={[
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
          ]}
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
                const finalIsbn = Number(alertData.isbnField);
                fetchBookInfo(finalIsbn);
              },
            },
          ]}
          onDidDismiss={() => {
            setIsAlertOpen(false);
            setTempIsbn(0);
          }}
          className={styles.alert}
        ></IonAlert>

        {isLoading ? (
          <LoadSpinner message={`Getting book info...`} />
        ) : (
          <>
            <IonGrid
              className={`${styles.grid} ${
                bookInfo === undefined ? styles.centerContent : ''
              }`}
            >
              {bookInfo && (
                <>
                  <BookInfo bookInfo={bookInfo} detailed={true} />
                  <IonButton>
                    Add to Reading List{' '}
                    <IonIcon slot="end" icon={book}></IonIcon>
                  </IonButton>
                  <IonButton>
                    Add to Wish List
                    <IonIcon slot="end" icon={bookmark}></IonIcon>
                  </IonButton>
                </>
              )}
              <IonButton onClick={lerBarcode}>Scan Barcode</IonButton>
            </IonGrid>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Add;
