import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
} from '@ionic/react';

import ComingSoon from '../components/ComingSoon';
import styles from './ContributePage.module.css';

const ContributePage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton></IonBackButton>
          </IonButtons>
          <IonTitle>Contribute</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <ComingSoon />
      </IonContent>
    </IonPage>
  );
};

export default ContributePage;
