import { IonSpinner } from '@ionic/react';

import styles from './LoadSpinner.module.css';

const LoadSpinner: React.FC<{ message: string; fullScreen: boolean }> = ({
  message,
  fullScreen,
}) => {
  return (
    <div className={fullScreen ? styles.fullscreen : styles.reduced}>
      <strong>{message}</strong>
      <IonSpinner name="lines" color="primary" />
    </div>
  );
};

export default LoadSpinner;
