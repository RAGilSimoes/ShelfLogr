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
} from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';

import {
  BarcodeScanner,
  BarcodeFormat,
} from '@capacitor-mlkit/barcode-scanning';

import { useEffect, useState } from 'react';

import styles from './Add.module.css';

const Add: React.FC = () => {
  const [ISBNCode, setISBNCode] = useState<string>('');
  const [cameraError, setCameraError] = useState<string>('');
  const [displayCameraError, setDisplayCameraError] = useState<boolean>(false);

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
    setCameraError('');
    setDisplayCameraError(false);
    setISBNCode('');

    let cameraPermission = await checkPermissions();

    if (cameraPermission !== 'granted') {
      cameraPermission = await requestPermissions();
    }

    if (cameraPermission === 'granted') {
      try {
        const barcodes = await scan();
        if (barcodes.length > 0 && barcodes[0].valueType === 'ISBN') {
          setISBNCode(barcodes[0].displayValue);
        } else {
          setCameraError("Barcode doesn't match a book");
          setDisplayCameraError(true);
        }
      } catch (error) {
      } finally {
        BarcodeScanner.stopScan();
      }
    } else {
      setCameraError('You need to grant permission to use the camera.');
      setDisplayCameraError(true);
    }
  };

  useIonViewWillLeave(() => {
    setISBNCode('');
  });

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonToast
          trigger="open-toast"
          message={cameraError}
          duration={5000}
          isOpen={displayCameraError}
          onDidDismiss={() => {
            setDisplayCameraError(false);
            setCameraError('');
          }}
          className={styles.customToast}
          position="top"
        ></IonToast>
        <IonGrid
          className={`${styles.grid} ${
            ISBNCode === '' ? styles.centerContent : ''
          }`}
        >
          {ISBNCode && (
            <IonCard>
              <img
                alt="Silhouette of mountains"
                src="https://ionicframework.com/docs/img/demos/card-media.png"
              />
              <IonCardHeader>
                <IonCardTitle>Card Title</IonCardTitle>
                <IonCardSubtitle>Card Subtitle</IonCardSubtitle>
              </IonCardHeader>

              <IonCardContent>
                Here's a small text description for the card content. Nothing
                more, nothing less.
              </IonCardContent>
            </IonCard>
          )}

          <IonButton onClick={lerBarcode}>Scan Barcode</IonButton>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Add;
