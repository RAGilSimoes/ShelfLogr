import { IonIcon } from '@ionic/react';

import styles from './ReviewCard.module.css';

import { star, globe, lockClosed } from 'ionicons/icons';
import { useState } from 'react';
import { bookInfo } from '@shelflogr/shared';

import BookCard from '../components/BookCard';
import { useHistory } from 'react-router';

const ReviewCard: React.FC<{
  info: {
    book: bookInfo;
    created_at: string;
    display: boolean;
    liked: boolean;
    rating: number;
    review: string | null;
    updated_at: string;
  };
}> = ({ info }) => {
  const history = useHistory();
  const maxStars = 5;

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const createRatingVisual = (stars: number) => {
    const starsDiv = [];
    for (let index = 1; index <= maxStars; index++) {
      starsDiv.push(
        <IonIcon
          slot="end"
          icon={star}
          key={index}
          className={index <= stars ? styles.activeStar : styles.disabledStar}
        ></IonIcon>,
      );
    }

    return starsDiv;
  };

  const maxReviewNormalDisplay = 100;

  const isLongReview = info.review
    ? info.review.length > maxReviewNormalDisplay
    : false;

  const displayReview = info.review
    ? isLongReview && !isExpanded
      ? info.review.slice(0, maxReviewNormalDisplay) + '...'
      : !isLongReview || isExpanded
      ? info.review
      : ''
    : `You didn't write anything on this review.`;

  return (
    <div className={styles.reviewCard}>
      <div
        onClick={() => {
          history.push(`/app/book/${info.book.id}`, {
            information: { book: info.book },
          });
        }}
        style={{ cursor: 'pointer' }}
      >
        <BookCard bookInfo={info.book} detailed={false} />
      </div>

      <div className={styles.topReviewCard}>
        <div className={styles.starsContainer}>
          {createRatingVisual(info.rating)}
        </div>

        <div className={styles.reviewMeta}>
          <div className={styles.privacyBadge}>
            <IonIcon icon={info.display ? globe : lockClosed} />
            <span>{info.display ? 'Public' : 'Private'}</span>
          </div>

          <span className={styles.dateText}>
            Updated:{' '}
            <strong>
              {new Date(info.updated_at).toLocaleDateString(undefined, {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </strong>
          </span>
        </div>
      </div>
      <div className={styles.bottomReviewCard}>
        <span className={!info.review ? styles.emptyReview : undefined}>
          {displayReview}
        </span>

        {isLongReview && (
          <button
            type="button"
            className={styles.readMoreBtn}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Read Less...' : 'Read More...'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;
