import { IonToast } from '@ionic/react';

import styles from './Toast.module.css';

const Toast: React.FC<{
  message: string;
  onDismiss: () => void;
  type: string;
  open: boolean;
}> = ({ message, onDismiss, type, open }) => {
  return (
    <IonToast
      trigger="open-toast"
      message={message}
      duration={2500}
      isOpen={open}
      onDidDismiss={onDismiss}
      className={`${styles.customToast} ${
        type === 'error' ? styles.errorToast : styles.successToast
      }`}
      position="top"
    ></IonToast>
  );
};

export default Toast;
