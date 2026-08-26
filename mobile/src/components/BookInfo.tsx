import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonCol,
  IonRow,
  IonGrid,
  IonChip,
} from '@ionic/react';

import { bookInfo } from '@shelflogr/shared';

import styles from './BookInfo.module.css';

const BookInfo: React.FC<{
  bookInfo: bookInfo;
  detailed: boolean;
}> = ({ bookInfo, detailed }) => {
  const headerContent = (
    <IonGrid>
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

  const detailedContent = detailed && (
    <div className={styles.detailedInfo}>
      <div className={styles.secondaryInfo}>
        <h3 className={styles.sinopse}>
          <strong>Sinopse:</strong>
        </h3>

        <div className={styles.description}>
          {bookInfo.description ? (
            <div
              dangerouslySetInnerHTML={{
                __html: bookInfo.description,
              }}
            />
          ) : (
            'No description found.'
          )}
        </div>

        <div className={styles.categories}>
          {bookInfo.categories && bookInfo.categories.length !== 0 && (
            <>
              <p className={styles.secondaryCategoriesTitle}>
                <strong>Secondary Categories:</strong>
              </p>

              <div className={styles.secondaryCategoriesDiv}>
                {bookInfo.categories.map((category, index) => {
                  return (
                    <IonChip
                      key={index}
                      color="secondary"
                      className={styles.secondaryCategoriesChip}
                    >
                      {category}
                    </IonChip>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className={styles.footerInfo}>
          <span>
            <strong>Pages:</strong>{' '}
            {bookInfo.pageCount ? bookInfo.pageCount : 'N/A'}
          </span>
          <span>
            <strong>Language:</strong>{' '}
            {bookInfo.language ? bookInfo.language.toUpperCase() : 'N/A'}
          </span>
          <span>
            <strong>Date:</strong>{' '}
            {bookInfo.publishedDate
              ? bookInfo.publishedDate
              : 'No published date found'}
          </span>
        </div>
      </div>
    </div>
  );

  if (detailed) {
    return (
      <div className={styles.fullPage}>
        {headerContent}
        {detailedContent}
      </div>
    );
  } else {
    return <IonCard>{headerContent}</IonCard>;
  }
};

export default BookInfo;
