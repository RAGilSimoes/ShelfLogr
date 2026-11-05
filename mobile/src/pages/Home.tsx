import {
  IonContent,
  IonPage,
  IonIcon,
  IonHeader,
  IonToolbar,
  IonGrid,
  useIonViewWillLeave,
  IonSkeletonText,
} from '@ionic/react';
import { sunny, partlySunny, moon } from 'ionicons/icons';

import { ReactElement, useState, useRef, useEffect } from 'react';

import styles from './Home.module.css';

import BookCard from '../components/BookCard';
import { useHistory } from 'react-router';

import LoadSpinner from '../components/LoadSpinner';
import BookSwiper from '../components/BookSwiper';

import { useQuery } from '@tanstack/react-query';
import fetchTrendingBooksRecommendation from '../queryOptions/homeQueries';

import { getUserShelvesOptions } from '../queryOptions/useUserShelves';

import useAuthStore from '../store/useAuthStore';
import { bookInfo } from '@shelflogr/shared';

import Toast from '../components/Toast';

import ErrorDisplay from '../components/ErrorDisplay';

import LoadCard from '../components/LoadCard';

const Home: React.FC = () => {
  const username = useAuthStore((state) => state.username);
  const userID = useAuthStore((state) => state.userID);
  const activeBookID = useAuthStore((state) => state.activeBookID);

  const history = useHistory();

  const timeoutRef = useRef(0);

  const [displayToast, setDisplayToast] = useState(false);

  const availableToastTypes = {
    success: 'success',
    error: 'error',
  };

  useIonViewWillLeave(() => {
    setDisplayToast(false);

    const timeoutId = timeoutRef.current;
    clearTimeout(timeoutId);
  });

  function getTimeIcon(): ReactElement {
    const currentHour: number = new Date().getHours();

    const icon =
      currentHour >= 6 && currentHour <= 12 ? (
        <IonIcon aria-hidden="true" icon={sunny} className={styles.iconStyle} />
      ) : currentHour > 12 && currentHour < 20 ? (
        <IonIcon
          aria-hidden="true"
          icon={partlySunny}
          className={styles.iconStyle}
        />
      ) : (
        <IonIcon aria-hidden="true" icon={moon} className={styles.iconStyle} />
      );

    return icon;
  }

  const activeBookQuery = useQuery({
    ...getUserShelvesOptions(userID),
    select(data: {
      category?: string;
      shelves: {
        reading: Array<{ book: bookInfo; shelves: Array<string> }>;
        wish: Array<{ book: bookInfo; shelves: Array<string> }>;
      };
    }) {
      let shelfName =
        data.shelves.reading.length > 0
          ? 'reading'
          : data.shelves.wish.length > 0
          ? 'wish'
          : undefined;
      let shelf =
        data.shelves.reading.length > 0
          ? data.shelves.reading
          : data.shelves.wish.length > 0
          ? data.shelves.wish
          : undefined;

      if (shelfName && shelf) {
        if (activeBookID === undefined) {
          const ind: number = Math.floor(Math.random() * shelf.length);
          const item = shelf[ind];

          return {
            category: data.category,
            book: item.book,
            bookShelves: item.shelves,
            shelf: shelfName,
          };
        } else {
          const backupShelf =
            shelfName === 'reading' ? data.shelves.wish : data.shelves.reading;
          const backupShelfName = shelfName === 'reading' ? 'wish' : 'reading';

          let item: { book: bookInfo; shelves: Array<string> };

          item = shelf.find((item) => activeBookID === item.book.id)!;

          if (!item) {
            item = backupShelf.find((item) => activeBookID === item.book.id)!;
            if (item) {
              shelfName = backupShelfName;
              shelf = backupShelf;
            }
          }

          if (item) {
            return {
              category: data.category,
              book: item.book,
              bookShelves: item.shelves,
              shelf: shelfName,
            };
          } else {
            const ind: number = Math.floor(Math.random() * shelf.length);
            const item = shelf[ind];

            return {
              category: data.category,
              book: item.book,
              bookShelves: item.shelves,
              shelf: shelfName,
            };
          }
        }
      } else if (data.category !== null) {
        return {
          category: data.category,
          book: null,
          bookShelves: null,
          shelf: null,
        };
      } else {
        return { category: null, book: null, bookShelves: null, shelf: null };
      }
    },
  });

  useEffect(() => {
    if (activeBookQuery.data?.book?.id)
      useAuthStore
        .getState()
        .updateActiveBookRecommendationID(activeBookQuery.data?.book?.id);
  }, [activeBookQuery.data?.book?.id]);

  const trendingCategoryBookQuery = useQuery({
    queryKey: ['trendingCategoryBooks', userID, activeBookQuery.data?.category],
    queryFn: () =>
      fetchTrendingBooksRecommendation(
        activeBookQuery.data?.category,
        undefined,
      ),
    enabled:
      activeBookQuery.status === 'success' &&
      activeBookQuery.data.category !== null,
  });

  const trendingBookQuery = useQuery({
    queryKey: ['trendingBooks', userID],
    queryFn: () => fetchTrendingBooksRecommendation(undefined, undefined),
    enabled: activeBookQuery.status === 'success',
  });

  return (
    <IonPage>
      <IonHeader className={`ion-no-border ${styles.header}`}>
        <IonToolbar>
          <div className={styles.welcomeDiv}>
            {getTimeIcon()}

            <div className={styles.welcomeTextDiv}>
              <span className={styles.welcomeTextStatic}>Welcome Back</span>
              <strong className={styles.welcomeTextDynamic}>{username}</strong>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <Toast
          message={
            activeBookQuery.isError
              ? activeBookQuery.error.message
              : trendingBookQuery.isError
              ? trendingBookQuery.error.message
              : ''
          }
          onDismiss={() => setDisplayToast(false)}
          type={availableToastTypes.error}
          open={displayToast}
        />

        <IonGrid className={styles.grid}>
          {activeBookQuery.isLoading ? (
            <LoadCard />
          ) : activeBookQuery.isSuccess &&
            activeBookQuery.data.book &&
            Object.keys(activeBookQuery.data.book).length > 0 ? (
            <div className={styles.sectionContainer}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionEyebrow}>
                  This book is in your
                </span>
                <h2 className={styles.sectionTitle}>
                  {activeBookQuery.data.shelf
                    ? activeBookQuery.data.shelf.charAt(0).toUpperCase() +
                      activeBookQuery.data.shelf.slice(1)
                    : ''}{' '}
                  Shelf
                </h2>
              </div>
              <div
                onClick={() => {
                  history.push(`/app/book/${activeBookQuery.data.book?.id}`, {
                    information: activeBookQuery.data,
                  });
                }}
                style={{ cursor: 'pointer' }}
              >
                <BookCard
                  bookInfo={activeBookQuery.data.book}
                  detailed={false}
                />
              </div>
            </div>
          ) : (
            activeBookQuery.isError && (
              <ErrorDisplay
                title="Error loading suggestion"
                onRetry={() => activeBookQuery.refetch()}
                compact={true}
              />
            )
          )}

          {(activeBookQuery.isLoading ||
            Boolean(activeBookQuery.data?.category)) && (
            <div className={styles.sectionContainer}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionEyebrow}>Because you liked</span>
                <h2 className={styles.sectionTitle}>
                  {activeBookQuery.isSuccess ? (
                    activeBookQuery.data!.category
                  ) : (
                    <IonSkeletonText animated={true}></IonSkeletonText>
                  )}
                </h2>
              </div>
              {activeBookQuery.isLoading ||
              trendingCategoryBookQuery.isLoading ? (
                <LoadCard />
              ) : trendingCategoryBookQuery.isSuccess &&
                trendingCategoryBookQuery.data.trendingBooksInfo.length > 0 ? (
                <BookSwiper
                  books={trendingCategoryBookQuery.data.trendingBooksInfo}
                />
              ) : (
                trendingCategoryBookQuery.isError && (
                  <ErrorDisplay
                    title={`Couldn't Get Recommendations About ${
                      activeBookQuery.data?.category || 'Your Favorite Book'
                    }`}
                    onRetry={() => trendingCategoryBookQuery.refetch()}
                    compact={true}
                  />
                )
              )}
            </div>
          )}

          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>What's Trending This Week</h2>
            </div>

            {trendingBookQuery.isLoading ? (
              <LoadCard />
            ) : trendingBookQuery.isSuccess &&
              trendingBookQuery.data.trendingBooksInfo &&
              trendingBookQuery.data.trendingBooksInfo.length > 0 ? (
              <BookSwiper books={trendingBookQuery.data.trendingBooksInfo} />
            ) : (
              trendingBookQuery.isError && (
                <ErrorDisplay
                  title={`Couldn't Get Trending Books`}
                  onRetry={() => trendingBookQuery.refetch()}
                  compact={true}
                />
              )
            )}
          </div>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Home;
