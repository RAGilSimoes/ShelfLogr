import {
  IonItem,
  IonInput,
  IonHeader,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonRange,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonTextarea,
} from '@ionic/react';

import styles from './CompletedBookForm.module.css';
import { star, globe, lockClosed } from 'ionicons/icons';

import { useEffect, useState } from 'react';

const CompletedBookForm: React.FC<{
  onReviewChange: (
    rating: number,
    display: string,
    liked: boolean,
    review: string | null,
  ) => void;
}> = ({ onReviewChange }) => {
  const maxReviewSize = 300;

  const [starsRating, setStarsRating] = useState<number>(1);

  const displayOptions: Array<string> = ['public', 'private'];
  const [display, setDisplay] = useState<string>(displayOptions[0]);

  const [review, setReview] = useState<string>('');

  const starsDiv = [];

  const maxStars = 5;

  for (let index = 1; index <= maxStars; index++) {
    starsDiv.push(
      <IonIcon
        slot="end"
        icon={star}
        key={index}
        className={
          index <= starsRating ? styles.activeStar : styles.disabledStar
        }
      ></IonIcon>,
    );
  }

  useEffect(() => {
    onReviewChange(starsRating, display, starsRating >= 3, review);
  }, [starsRating, display, review]);

  return (
    <form className={styles.completedForm}>
      <IonCard className={styles.card}>
        <IonCardHeader className={styles.cardHeader}>
          <IonCardTitle className={styles.title}>Rating</IonCardTitle>
        </IonCardHeader>

        <div className={styles.stars}>
          <div className={styles.starsDiv}>{starsDiv}</div>
          <IonRange
            value={starsRating}
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
        </div>

        <IonSegment
          value={display}
          className={styles.display}
          onIonChange={(event) => {
            setDisplay(event.detail.value as string);
          }}
          mode="ios"
        >
          <IonSegmentButton value={displayOptions[0]} layout="icon-start">
            <IonLabel>Public</IonLabel>
            <IonIcon icon={globe}></IonIcon>
          </IonSegmentButton>
          <IonSegmentButton value={displayOptions[1]} layout="icon-start">
            <IonLabel>Private</IonLabel>
            <IonIcon icon={lockClosed}></IonIcon>
          </IonSegmentButton>
        </IonSegment>

        <IonItem className={styles.review} lines="none">
          <IonTextarea
            label="Review (optional)"
            autoGrow={true}
            rows={3}
            labelPlacement="floating"
            maxlength={maxReviewSize}
            counter={true}
            onIonChange={(event) => {
              setReview(event.detail.value as string);
            }}
            value={review}
          ></IonTextarea>
        </IonItem>
      </IonCard>
    </form>
  );
};

export default CompletedBookForm;
