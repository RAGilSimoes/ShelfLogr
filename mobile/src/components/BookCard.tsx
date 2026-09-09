import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCol,
  IonRow,
  IonGrid,
  IonChip,
} from '@ionic/react';

import { bookInfo } from '@shelflogr/shared';

import styles from './BookCard.module.css';

const BookCard: React.FC<{
  bookInfo: bookInfo;
  detailed: boolean | null;
}> = ({ bookInfo, detailed }) => {
  const content = (
    <IonGrid className={styles.grid}>
      <IonRow>
        <IonCol size="4">
          <img
            alt="Book Cover"
            src={bookInfo.cover ? bookInfo.cover : '/missing-book-cover.jpg'}
            className={styles.bookCover}
          />
        </IonCol>

        <IonCol size="8">
          <IonCardHeader className="ion-no-padding">
            <IonCardTitle className={styles.title}>
              {bookInfo.title ? bookInfo.title : 'No title found'}
            </IonCardTitle>
            <IonCardSubtitle className={styles.authors}>
              {bookInfo.authors
                ? bookInfo.authors?.join(', ')
                : 'No authors found'}
            </IonCardSubtitle>
          </IonCardHeader>

          <div className={styles.metadataInfo}>
            <p>
              <strong>Publisher:</strong>{' '}
              {bookInfo.publisher ? bookInfo.publisher : 'No publisher found'}
            </p>
          </div>
          <>
            <p className={styles.mainCategory}>
              <strong>Main Category:</strong>
            </p>
            <IonChip color="primary">
              {bookInfo.mainCategory
                ? bookInfo.mainCategory
                : 'No Main Category found.'}
            </IonChip>
          </>
        </IonCol>
      </IonRow>
    </IonGrid>
  );

  return detailed === true ? (
    <>{content}</>
  ) : detailed === false ? (
    <IonCard className={styles.card}>{content}</IonCard>
  ) : (
    <></>
  );
};

export default BookCard;
