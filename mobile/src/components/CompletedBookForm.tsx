import {
  IonItem,
  IonInput,
  IonHeader,
  IonSegment,
  IonSegmentButton,
  IonLabel,
} from '@ionic/react';

import styles from './CompletedBookForm.module.css';

import { useState } from 'react';

const CompletedBookForm: React.FC = () => {
  const maxReviewSize = 300;

  return (
    <>
      <form className={styles.loginForm}>
        <IonHeader>Rate This Book</IonHeader>
        <IonItem>
          <IonInput
            label="Review (optional)"
            maxlength={maxReviewSize}
            labelPlacement="floating"
            counter={true}
          ></IonInput>
        </IonItem>
        <IonSegment value="public">
          <IonSegmentButton value="public">
            <IonLabel>Public</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="private">
            <IonLabel>Private</IonLabel>
          </IonSegmentButton>
        </IonSegment>
      </form>
    </>
  );
};

export default CompletedBookForm;
