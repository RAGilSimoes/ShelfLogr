import { IonChip, IonIcon, IonButton } from '@ionic/react';

import {
  checkmarkCircle,
  createOutline,
  bookmarkOutline,
} from 'ionicons/icons';

import styles from './StatusFeedback.module.css';

const StatusFeedback: React.FC<{
  shelf: Array<{ name: string; id: string }> | string[];
  onEditShelf?: () => void;
}> = ({ shelf, onEditShelf }) => {
  return (
    <div className={styles.libraryStatusCard}>
      <div className={styles.cardHeader}>
        <div className={styles.statusBadge}>
          <IonIcon icon={checkmarkCircle} className={styles.checkIcon} />
          <span>In Your Library</span>
        </div>

        <IonButton
          fill="clear"
          size="small"
          className={styles.editButton}
          onClick={onEditShelf}
        >
          <IonIcon slot="start" icon={createOutline} />
          Change
        </IonButton>
      </div>
      <div className={styles.shelvesSection}>
        <span className={styles.shelvesLabel}>Current Shelves</span>
        <div className={styles.chipsContainer}>
          {shelf.map((item: any, index) => {
            const name = typeof item === 'string' ? item : item.name;
            return (
              <IonChip key={index} className={styles.shelfChip}>
                <IonIcon icon={bookmarkOutline} />
                <span>{name.charAt(0).toUpperCase() + name.slice(1)}</span>
              </IonChip>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatusFeedback;
