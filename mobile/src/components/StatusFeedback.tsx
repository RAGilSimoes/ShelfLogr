import {
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
} from '@ionic/react';

import styles from './StatusFeedback.module.css';

const StatusFeedback: React.FC<{
  successMessage: string;
  list: Array<string>;
}> = ({ successMessage, list }) => {
  return (
    <>
      <IonCard color="success">
        <IonCardHeader className={styles.successHeader}>
          <IonCardTitle>
            List(s):<br></br>
            {list.map((item) => '• ' + item).join('\n')}
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
