import {
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonIcon,
} from '@ionic/react';

import { checkmarkCircleOutline } from 'ionicons/icons';

import styles from './StatusFeedback.module.css';

const StatusFeedback: React.FC<{ successMessage: string; list: string }> = ({
  successMessage,
  list,
}) => {
  return (
    <>
      <IonCard color="success">
        <IonCardHeader className={styles.successHeader}>
          <IonCardTitle>
            It's in your <strong>{list} List</strong>.
          </IonCardTitle>
          <IonCardSubtitle className={styles.successTitle}>
            <IonIcon icon={checkmarkCircleOutline} />
            {successMessage}
          </IonCardSubtitle>
        </IonCardHeader>
      </IonCard>
    </>
  );
};

export default StatusFeedback;
