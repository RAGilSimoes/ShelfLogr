import { IonIcon, IonButton } from '@ionic/react';

import styles from './ErrorDisplay.module.css';

import { alertCircleOutline } from 'ionicons/icons';

const ErrorDisplay: React.FC<{
  title: string;
  subtitle?: string;
  icon?: string;
  onRetry?: () => void;
  retryText?: string;
}> = ({
  title,
  subtitle = `There was a problem loading the information`,
  icon = alertCircleOutline,
  onRetry,
  retryText = 'Try Again',
}) => {
  return (
    <div className={styles.emptyContainer}>
      <IonIcon icon={icon} className={styles.errorIcon} />
      <h3 className={styles.emptyTitle}>{title}</h3>
      <p className={styles.emptySubtitle}>{subtitle}</p>
      {onRetry && (
        <IonButton
          fill="outline"
          shape="round"
          className={styles.retryBtn}
          onClick={onRetry}
        >
          {retryText}
        </IonButton>
      )}
    </div>
  );
};

export default ErrorDisplay;
