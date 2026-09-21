import {
  IonIcon,
  IonAlert,
  IonButton,
  IonSelect,
  IonSelectOption,
  IonHeader,
} from '@ionic/react';

import styles from './CompletedBookForm.module.css';

const CompletedBookForm: React.FC = () => {
  return (
    <>
      <form className={styles.loginForm}>
        <IonHeader>Rate This Book</IonHeader>
      </form>
    </>
  );
};

export default CompletedBookForm;
