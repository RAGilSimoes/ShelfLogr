import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonIcon,
  IonButton,
} from '@ionic/react';

import LoadSpinner from '../components/LoadSpinner';

import { useQuery } from '@tanstack/react-query';
import fetchUserReviews from '../queryOptions/reviewsPageQueries';

import styles from './ReviewsPage.module.css';

import useAuthStore from '../store/useAuthStore';
import { bookInfo } from '@shelflogr/shared';

import ReviewCard from '../components/ReviewCard';

import { chatbubbleEllipsesOutline, alertCircleOutline } from 'ionicons/icons';

const ReviewsPage: React.FC = () => {
  const userID = useAuthStore((state) => state.userID);

  const reviewsQuery = useQuery({
    queryKey: ['userReviews', userID],
    queryFn: () => fetchUserReviews(),
    select(data: {
      reviews: Array<{
        book: bookInfo;
        created_at: string;
        display: boolean;
        liked: boolean;
        rating: number;
        review: string;
        updated_at: string;
      }>;
    }) {
      return data.reviews;
    },
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/profile"></IonBackButton>
          </IonButtons>
          <IonTitle>My Reviews</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {reviewsQuery.isFetching ? (
          <LoadSpinner message={'Fetching Your Reviews...'} fullScreen={true} />
        ) : reviewsQuery.isSuccess ? (
          reviewsQuery.data && reviewsQuery.data.length > 0 ? (
            reviewsQuery.data.map((item) => {
              return <ReviewCard info={item} key={item.book.id} />;
            })
          ) : (
            <div className={styles.emptyContainer}>
              <IonIcon
                icon={chatbubbleEllipsesOutline}
                className={styles.emptyIcon}
              />
              <h3 className={styles.emptyTitle}>No Reviews Yet</h3>
              <p className={styles.emptySubtitle}>
                When you share your thoughts on a book, your evaluations will
                appear here.
              </p>
            </div>
          )
        ) : (
          <div className={styles.emptyContainer}>
            <IonIcon icon={alertCircleOutline} className={styles.errorIcon} />
            <h3 className={styles.emptyTitle}>Couldn't Load Reviews</h3>
            <p className={styles.emptySubtitle}>
              There was a problem connecting to the server. Please check your
              connection and try again.
            </p>
            <IonButton
              fill="outline"
              shape="round"
              className={styles.retryBtn}
              onClick={() => reviewsQuery.refetch()}
            >
              Try Again
            </IonButton>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ReviewsPage;
