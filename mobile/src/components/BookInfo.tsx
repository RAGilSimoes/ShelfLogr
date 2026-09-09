import { IonChip } from '@ionic/react';

import { bookInfo } from '@shelflogr/shared';

import styles from './BookInfo.module.css';

import BookCard from './BookCard';

const BookInfo: React.FC<{
  bookInfo: bookInfo;
  detailed: boolean;
}> = ({ bookInfo, detailed }) => {
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

  return detailed ? (
    <div className={styles.fullPage}>
      <BookCard bookInfo={bookInfo} detailed={detailed} />
      {detailedContent}
    </div>
  ) : (
    <BookCard bookInfo={bookInfo} detailed={detailed} />
  );
};

export default BookInfo;
