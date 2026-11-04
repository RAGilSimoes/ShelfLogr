import { IonChip, IonIcon, IonButton } from '@ionic/react';

import {
  checkmarkCircle,
  createOutline,
  bookmarkOutline,
} from 'ionicons/icons';

import styles from './StatusFeedback.module.css';

const StatusFeedback: React.FC<{
  shelf: Array<string> | [];
}> = ({ shelf }) => {
  const onEditShelf = async () => {
    console.log('edited shelf');
  };

  return (
    <div className={styles.libraryStatusCard}>
      <div className={styles.cardHeader}>
        <div className={styles.statusBadge}>
          <IonIcon icon={checkmarkCircle} className={styles.checkIcon} />
          <span>In Your Library</span>
        </div>
        {onEditShelf && (
          <IonButton
            fill="clear"
            size="small"
            className={styles.editButton}
            onClick={onEditShelf}
          >
            <IonIcon slot="start" icon={createOutline} />
            Change
          </IonButton>
        )}
      </div>
      <div className={styles.shelvesSection}>
        <span className={styles.shelvesLabel}>Current Shelves</span>
        <div className={styles.chipsContainer}>
          {shelf.map((item, index) => (
            <IonChip key={index} className={styles.shelfChip}>
              <IonIcon icon={bookmarkOutline} />
              <span>{item.charAt(0).toUpperCase() + item.slice(1)}</span>
            </IonChip>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatusFeedback;
