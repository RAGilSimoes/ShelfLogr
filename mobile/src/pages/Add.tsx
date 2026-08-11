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

import { bookInfo, bookCover } from '@shelflogr/shared';

const Add: React.FC = () => {
  const [bookInfo, setBookInfo] = useState<bookInfo | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [displayErrorMessage, setDisplayErrorMessage] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

    let cameraPermission = await checkPermissions();

    if (cameraPermission !== 'granted') {
      cameraPermission = await requestPermissions();
    }

    if (cameraPermission === 'granted') {
      try {
        const barcodes = await scan();
        setIsLoading(true);
        if (barcodes.length > 0 && barcodes[0].valueType === 'ISBN') {
          const isbn = barcodes[0].displayValue;

          const response = await api.get(`/get-book-info/${isbn}`);

          if (response.status === 200) {
            const responseBookInfo: bookInfo = response.data;
            responseBookInfo.modified = true;
            setBookInfo(responseBookInfo);
            setIsLoading(false);
          }
        } else {
          setErrorMessage("Barcode doesn't match a book");
          setDisplayErrorMessage(true);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setDisplayErrorMessage(true);
          const serverMessage =
            error.response?.data?.error || 'Server communication error.';
          setErrorMessage(serverMessage);
        }
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
        {isLoading ? (
          <LoadSpinner />
        ) : (
          <IonGrid
            className={`${styles.grid} ${
              bookInfo === undefined ? styles.centerContent : ''
            }`}
          >
            {bookInfo?.modified && (
              <>
                <BookInfo bookInfo={bookInfo} />
                <IonButton>
                  Add to Reading List <IonIcon slot="end" icon={book}></IonIcon>
                </IonButton>
                <IonButton>
                  Add to Wish List
                  <IonIcon slot="end" icon={bookmark}></IonIcon>
                </IonButton>
              </>
            )}

            <IonButton onClick={lerBarcode}>Scan Barcode</IonButton>
          </IonGrid>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Add;
