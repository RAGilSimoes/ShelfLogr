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

import { useEffect, useState } from 'react';

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

  const defaultValues: {
    rating: number;
    display: string;
    searchFilter: string;
    orderBy: string;
  } = { rating: -1, display: 'all', searchFilter: '', orderBy: 'recent' };

  const [ratingFilter, setRatingFilter] = useState<number>(
    defaultValues.rating,
  );
  const [displayFilter, setDisplayFilter] = useState<string>(
    defaultValues.display,
  );
  const [searchFilter, setSearchFilter] = useState<string>(
    defaultValues.searchFilter,
  );

  const [orderBy, setOrderBy] = useState<string>(defaultValues.orderBy);

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

  const getStarsButtons = () => {
    const starsButtons = [];

    starsButtons.push(
      <IonButton
        onClick={() => {
          setRatingFilter(defaultValues.rating);
        }}
        className={
          ratingFilter === -1
            ? styles.activeRatingBtn
            : styles.inactiveRatingBtn
        }
      >
        All
      </IonButton>,
    );

    for (let index = 0; index <= maxStarRating; index++) {
      starsButtons.push(
        <IonButton
          key={index}
          onClick={() => setRatingFilter(index)}
          className={
            ratingFilter === index
              ? styles.activeRatingBtn
              : styles.inactiveRatingBtn
          }
        >
          <IonLabel>{index}</IonLabel>
          <IonIcon icon={star}></IonIcon>
        </IonButton>,
      );
    }

    return starsButtons;
  };

  const filteredReviews = reviewsQuery.data
    ?.filter((item) => {
      const display = item.display ? 'public' : 'private';

      return (
        (ratingFilter === -1 || item.rating === ratingFilter) &&
        (displayFilter === 'all' || display === displayFilter) &&
        item.book.title.toLowerCase().includes(searchFilter.toLocaleLowerCase())
      );
    })
    .sort(
      (
        a: {
          book: bookInfo;
          created_at: string;
          display: boolean;
          liked: boolean;
          rating: number;
          review: string;
          updated_at: string;
        },
        b: {
          book: bookInfo;
          created_at: string;
          display: boolean;
          liked: boolean;
          rating: number;
          review: string;
          updated_at: string;
        },
      ) => {
        switch (orderBy) {
          case 'recent': {
            const dateA = new Date(a.updated_at).getTime();
            const dateB = new Date(b.updated_at).getTime();

            return dateB - dateA;
          }

          case 'oldest': {
            const dateA = new Date(a.updated_at).getTime();
            const dateB = new Date(b.updated_at).getTime();

            return dateA - dateB;
          }

          case 'best': {
            return b.rating - a.rating;
          }

          case 'worst': {
            return a.rating - b.rating;
          }

          case 'ascending': {
            return a.book.title.localeCompare(b.book.title);
          }

          case 'descending': {
            return b.book.title.localeCompare(a.book.title);
          }

          default: {
            return 0;
          }
        }
      },
    );

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
                <IonAccordion>
                  <IonItem slot="header" className={styles.accordionHeader}>
                    <IonLabel>Filter & Order By...</IonLabel>
                    <IonIcon slot="start" icon={optionsOutline}></IonIcon>
                  </IonItem>
                  <div slot="content" className={styles.accordionContent}>
                    <IonList className={styles.filterList}>
                      <IonItem className={styles.ratingRow}>
                        {getStarsButtons()}
                      </IonItem>

                      <IonItem className={styles.segmentRow}>
                        <IonSegment value={displayFilter}>
                          <IonSegmentButton
                            value="all"
                            layout="icon-start"
                            onClick={() =>
                              setDisplayFilter(defaultValues.display)
                            }
                            className={
                              displayFilter === 'all'
                                ? styles.activeSegmentBtn
                                : ''
                            }
                          >
                            <IonIcon icon={albumsOutline}></IonIcon>
                            <IonLabel>All</IonLabel>
                          </IonSegmentButton>
                          <IonSegmentButton
                            value="public"
                            layout="icon-start"
                            onClick={() => setDisplayFilter('public')}
                            className={
                              displayFilter === 'public'
                                ? styles.activeSegmentBtn
                                : ''
                            }
                          >
                            <IonIcon icon={globe}></IonIcon>
                            <IonLabel>Public</IonLabel>
                          </IonSegmentButton>
                          <IonSegmentButton
                            value="private"
                            layout="icon-start"
                            onClick={() => setDisplayFilter('private')}
                            className={
                              displayFilter === 'private'
                                ? styles.activeSegmentBtn
                                : ''
                            }
                          >
                            <IonIcon icon={lockClosed}></IonIcon>
                            <IonLabel>Private</IonLabel>
                          </IonSegmentButton>
                        </IonSegment>
                      </IonItem>

                      <IonItem className={styles.searchRow}>
                        <IonSearchbar
                          debounce={100}
                          value={searchFilter}
                          onIonInput={(event) => {
                            setSearchFilter(event.target.value!);
                          }}
                          showClearButton="focus"
                        ></IonSearchbar>
                      </IonItem>

                      <IonSelect
                        label="Order By..."
                        labelPlacement="start"
                        className={styles.sortRow}
                        interface="action-sheet"
                        value={orderBy}
                        onIonChange={(event) => {
                          setOrderBy(event.target.value);
                        }}
                      >
                        <IonIcon
                          icon={swapVerticalOutline}
                          slot="start"
                          aria-hidden={true}
                        ></IonIcon>
                        <IonSelectOption value="recent">
                          Most Recent
                        </IonSelectOption>
                        <IonSelectOption value="oldest">Oldest</IonSelectOption>
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

            {reviewsQuery.data && reviewsQuery.data.length > 0 ? (
              filteredReviews && filteredReviews.length > 0 ? (
                filteredReviews?.map((item) => {
                  return <ReviewCard info={item} key={item.book.id} />;
                })
              ) : (
                <div className={styles.emptyContainer}>
                  <IonIcon
                    icon={chatbubbleEllipsesOutline}
                    className={styles.emptyIcon}
                  />
                  <h3 className={styles.emptyTitle}>
                    No Reviews Match The Filters
                  </h3>
                </div>
              )
            ) : (
              reviewsQuery.data.length === 0 && (
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
              )
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
