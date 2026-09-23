import {
  IonItem,
  IonInput,
  IonHeader,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonRange,
  IonIcon,
} from '@ionic/react';

import styles from './CompletedBookForm.module.css';
import { star } from 'ionicons/icons';

import { useState } from 'react';

const CompletedBookForm: React.FC = () => {
  const maxReviewSize = 300;

  const [starsRating, setStarsRating] = useState<number>(1);

  const starsDiv = [];

  for (let index = 0; index < starsRating; index++) {
    starsDiv.push(<IonIcon slot="end" icon={star}></IonIcon>);
  }

  return (
    <>
      <form className={styles.completedForm}>
        <IonHeader className={styles.title}>Rate This Book</IonHeader>

        <div>{starsDiv}</div>
        <IonRange
          aria-label="Stars Rating"
          ticks={true}
          snaps={true}
          min={1}
          max={5}
          onIonChange={({ detail }) => {
            setStarsRating(detail.value.valueOf() as number);
          }}
          className={styles.range}
        ></IonRange>

        <IonSegment value="public">
          <IonSegmentButton value="public">
            <IonLabel>Public</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="private">
            <IonLabel>Private</IonLabel>
          </IonSegmentButton>
        </IonSegment>
        <IonItem className={styles.review}>
          <IonInput
            label="Review (optional)"
            maxlength={maxReviewSize}
            labelPlacement="floating"
            counter={true}
          ></IonInput>
        </IonItem>
      </form>
    </>
  );
};

export default CompletedBookForm;
