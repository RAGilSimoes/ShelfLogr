import { IonIcon } from '@ionic/react';

import styles from './ComingSoon.module.css';

import { hammerOutline } from 'ionicons/icons';

const ComingSoon: React.FC = () => {
  return (
    <div className={styles.emptyContainer}>
      <IonIcon icon={hammerOutline} className={styles.errorIcon} />
      <h3 className={styles.emptyTitle}>Coming Soon</h3>
      <p className={styles.emptySubtitle}>
        This feature will be available in the future
      </p>
    </div>
  );
};

export default ComingSoon;
