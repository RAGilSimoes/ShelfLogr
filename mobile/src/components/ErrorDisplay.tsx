import { IonIcon, IonButton } from '@ionic/react';

import styles from './ErrorDisplay.module.css';

import { alertCircleOutline } from 'ionicons/icons';

const ErrorDisplay: React.FC<{
  title: string;
  subtitle?: string;
  icon?: string;
  onRetry?: () => void;
  retryText?: string;
  compact?: boolean;
}> = ({
  title,
  subtitle = `There was a problem loading the information`,
  icon = alertCircleOutline,
  onRetry,
  retryText = 'Try Again',
  compact = false,
}) => {
  return (
    <div
      className={`${styles.emptyContainer} ${
        compact ? styles.compactContainer : ''
      }`}
    >
      <IonIcon
        icon={icon}
        className={`${styles.errorIcon} ${compact ? styles.compactIcon : ''}`}
      />
      <h3
        className={`${styles.emptyTitle} ${compact ? styles.compactTitle : ''}`}
      >
        {title}
      </h3>
      <p
        className={`${styles.emptySubtitle} ${
          compact ? styles.compactSubtitle : ''
        }`}
      >
        {subtitle}
      </p>
      {onRetry && (
        <IonButton
          fill="outline"
          shape="round"
          className={`${styles.retryBtn} ${
            compact ? styles.compactRetryBtn : ''
          }`}
          onClick={onRetry}
        >
          {retryText}
        </IonButton>
      )}
    </div>
  );
};

export default ErrorDisplay;
