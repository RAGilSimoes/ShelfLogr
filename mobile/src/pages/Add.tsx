import {
  IonBackButton,
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Add.css';

import {
  BarcodeScanner,
  BarcodeFormat,
} from '@capacitor-mlkit/barcode-scanning';

const Add: React.FC = () => {
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
    let cameraPermission = await checkPermissions();

    if (cameraPermission !== 'granted') {
      cameraPermission = await requestPermissions();
    }

    if (cameraPermission === 'granted') {
      const barcodes = await scan();
      if (barcodes.length > 0) {
        console.log('ISBN detetado:', barcodes[0].displayValue);
      }
    } else {
      alert('Precisas de dar permissão à câmara para ler o código de barras.');
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <ExploreContainer name="Add page" />
        <IonButton onClick={lerBarcode}>Carrega</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Add;
