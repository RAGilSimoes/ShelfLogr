import {
  IonIcon,
  IonButton,
  IonCard,
  IonCardContent,
  IonItem,
  IonList,
  IonToast,
  IonInput,
  IonInputPasswordToggle,
} from '@ionic/react';

import styles from './SupportPage.module.css';

import { lockClosedOutline, saveOutline } from 'ionicons/icons';

import LoadSpinner from './LoadSpinner';

const SupportPage: React.FC<{
  onClose: () => void;
  onSuccess: (message: string) => void;
}> = ({ onClose, onSuccess }) => {
  return (
    <>
      <div className={styles.container}>
        <IonCard className={styles.card}>
          <IonCardContent className={styles.cardContent}>
            <IonList className={styles.list} lines="none">
              <IonItem className={styles.item} lines="inset">
                <strong>Olá</strong>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>
      </div>
    </>
  );
};

export default SupportPage;
