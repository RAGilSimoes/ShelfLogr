import {
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
} from '@ionic/react';

import styles from './StatusFeedback.module.css';

const StatusFeedback: React.FC<{
  successMessage: string;
  shelf: Array<string> | [];
}> = ({ successMessage, shelf }) => {
  return (
    <>
      <IonCard color="success">
        <IonCardHeader className={styles.successHeader}>
          <IonCardTitle>
            Shelves:<br></br>
            {shelf
              .map(
                (item) => '• ' + item.charAt(0).toUpperCase() + item.slice(1),
              )
              .join('\n')}
          </IonCardTitle>
          <IonCardSubtitle className={styles.successTitle}>
            {successMessage}
          </IonCardSubtitle>
        </IonCardHeader>
      </IonCard>
    </>
  );
};

export default StatusFeedback;
