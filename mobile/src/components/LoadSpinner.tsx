import { IonSpinner } from '@ionic/react';

import styles from './LoadSpinner.module.css';

const LoadSpinner: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className={styles.spinnerDiv}>
      <strong>{message}</strong>
      <IonSpinner name="lines" color="primary" />
    </div>
  );
};

export default LoadSpinner;
