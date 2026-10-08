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
  IonAccordionGroup,
  IonAccordion,
  IonLabel,
  IonItem,
  IonChip,
  IonSegment,
  IonSegmentButton,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonList,
} from '@ionic/react';

import LoadSpinner from '../components/LoadSpinner';

import { useQuery } from '@tanstack/react-query';
import fetchUserReviews from '../queryOptions/reviewsPageQueries';

import styles from './ReviewsPage.module.css';

import useAuthStore from '../store/useAuthStore';
import { bookInfo } from '@shelflogr/shared';

import ReviewCard from '../components/ReviewCard';

import {
  chatbubbleEllipsesOutline,
  alertCircleOutline,
  star,
  globe,
  lockClosed,
  optionsOutline,
  albumsOutline,
  swapVerticalOutline,
} from 'ionicons/icons';

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

  const maxStarRating = 5;

  const getStarsChips = () => {
    const starsChips = [];

    for (let index = 0; index <= maxStarRating; index++) {
      starsChips.push(
        <IonChip key={index} color="warning">
          <IonLabel>{index}</IonLabel>
          <IonIcon icon={star}></IonIcon>
        </IonChip>,
      );
    }

    return starsChips;
  };

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
        ) : reviewsQuery.isSuccess && reviewsQuery.data.length > 0 ? (
          <>
            <div className={styles.filterCard}>
              <IonAccordionGroup>
                <IonAccordion value="first">
                  <IonItem slot="header" className={styles.accordionHeader}>
                    <IonLabel>Filter & Order By...</IonLabel>
                    <IonIcon slot="start" icon={optionsOutline}></IonIcon>
                  </IonItem>
                  <div slot="content" className={styles.accordionContent}>
                    <IonList className={styles.filterList}>
                      <IonItem className={styles.ratingRow}>
                        <IonChip>All</IonChip>
                        {getStarsChips()}
                      </IonItem>

                      <IonItem className={styles.segmentRow}>
                        <IonSegment value="all">
                          <IonSegmentButton value="all" layout="icon-start">
                            <IonIcon icon={albumsOutline}></IonIcon>
                            <IonLabel>All</IonLabel>
                          </IonSegmentButton>
                          <IonSegmentButton value="public" layout="icon-start">
                            <IonIcon icon={globe}></IonIcon>
                            <IonLabel>Public</IonLabel>
                          </IonSegmentButton>
                          <IonSegmentButton value="private" layout="icon-start">
                            <IonIcon icon={lockClosed}></IonIcon>
                            <IonLabel>Private</IonLabel>
                          </IonSegmentButton>
                        </IonSegment>
                      </IonItem>

                      <IonItem className={styles.searchRow}>
                        <IonSearchbar></IonSearchbar>
                      </IonItem>

                      <IonSelect
                        label="Order By..."
                        labelPlacement="start"
                        className={styles.sortRow}
                        interface="action-sheet"
                      >
                        <IonIcon
                          icon={swapVerticalOutline}
                          slot="start"
                          aria-hidden={true}
                        ></IonIcon>
                        <IonSelectOption value="recent">
                          Most Recent
                        </IonSelectOption>
                        <IonSelectOption value="older">
                          Most Older
                        </IonSelectOption>
                        <IonSelectOption value="best">
                          Best Classified
                        </IonSelectOption>
                        <IonSelectOption value="worst">
                          Worst Classified
                        </IonSelectOption>
                        <IonSelectOption value="ascending">
                          Ascending Title
                        </IonSelectOption>
                        <IonSelectOption value="descending">
                          Descending Title
                        </IonSelectOption>
                      </IonSelect>
                    </IonList>
                  </div>
                </IonAccordion>
              </IonAccordionGroup>
            </div>

            {reviewsQuery.data && reviewsQuery.data.length > 0
              ? reviewsQuery.data.map((item) => {
                  return <ReviewCard info={item} key={item.book.id} />;
                })
              : reviewsQuery.data.length === 0 && (
                  <div className={styles.emptyContainer}>
                    <IonIcon
                      icon={chatbubbleEllipsesOutline}
                      className={styles.emptyIcon}
                    />
                    <h3 className={styles.emptyTitle}>No Reviews Yet</h3>
                    <p className={styles.emptySubtitle}>
                      When you share your thoughts on a book, your evaluations
                      will appear here.
                    </p>
                  </div>
                )}
          </>
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
