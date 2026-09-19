import {
  IonContent,
  IonPage,
  IonIcon,
  IonHeader,
  IonToolbar,
  IonToast,
  IonGrid,
  useIonViewWillLeave,
  IonButton,
} from '@ionic/react';
import { sunny, partlySunny, moon, refreshCircle } from 'ionicons/icons';

import { ReactElement, useState, useRef, useEffect } from 'react';

import styles from './Home.module.css';

import BookCard from '../components/BookCard';
import { useHistory } from 'react-router';

import LoadSpinner from '../components/LoadSpinner';
import BookSwiper from '../components/BookSwiper';

import { useQuery } from '@tanstack/react-query';
import fetchTrendingBooksRecommendation from '../queryOptions/homeQueries';
import {
  fetchUserLists,
  fetchUserListsNames,
} from '../queryOptions/loginQueries';

import useAuthStore from '../store/useAuthStore';
import { bookInfo } from '@shelflogr/shared';

const Home: React.FC = () => {
  const username = useAuthStore((state) => state.username);
  const userID = useAuthStore((state) => state.userID);
  const activeBookID = useAuthStore((state) => state.activeBookID);

  const history = useHistory();

  const timeoutRef = useRef(0);

  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);

  const [displayErrorMessage, setDisplayErrorMessage] = useState(false);

  useIonViewWillLeave(() => {
    setDisplayErrorMessage(false);

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
    queryKey: ['userBook', userID],
    queryFn: fetchUserLists,
    select(data: {
      category?: string;
      lists: { reading: Array<bookInfo>; wish: Array<bookInfo> };
    }) {
      let listName =
        data.lists.reading.length > 0
          ? 'reading'
          : data.lists.wish.length > 0
          ? 'wish'
          : undefined;
      let list =
        data.lists.reading.length > 0
          ? data.lists.reading
          : data.lists.wish.length > 0
          ? data.lists.wish
          : undefined;

      if (listName && list) {
        if (activeBookID === undefined) {
          const ind: number = Math.floor(Math.random() * list.length);
          const book = list[ind];

          return { category: data.category, book: book, list: listName };
        } else {
          const backupList =
            listName === 'reading' ? data.lists.wish : data.lists.reading;
          const backupListName = listName === 'reading' ? 'wish' : 'reading';

          let book;

          book = list.find((book) => activeBookID === book.id);

          if (!book) {
            book = backupList.find((book) => activeBookID === book.id);

            if (book) {
              listName = backupListName;
              list = backupList;
            }
          }

          if (book) {
            return {
              category: data.category,
              book: book,
              list: listName,
            };
          } else {
            const ind: number = Math.floor(Math.random() * list.length);
            const book = list[ind];

            return { category: data.category, book: book, list: listName };
          }
        }
      } else if (data.category !== null) {
        return { category: data.category, book: null, list: null };
      } else {
        return { category: null, book: null, list: null };
      }
    },
  });

  const listsNamesQuery = useQuery({
    queryKey: ['userLists', userID],
    queryFn: fetchUserListsNames,
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
      fetchTrendingBooksRecommendation(activeBookQuery.data?.category),
    enabled:
      activeBookQuery.status === 'success' &&
      activeBookQuery.data.category !== null,
  });

  const trendingBookQuery = useQuery({
    queryKey: ['trendingBooks', userID],
    queryFn: () => fetchTrendingBooksRecommendation(undefined),
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
        <IonToast
          trigger="open-toast"
          message={
            activeBookQuery.isError
              ? activeBookQuery.error.message
              : trendingBookQuery.isError
              ? trendingBookQuery.error.message
              : ''
          }
          duration={5000}
          isOpen={displayErrorMessage}
          onDidDismiss={() => setDisplayErrorMessage(false)}
          className={styles.customToast}
          position="top"
        ></IonToast>

        <IonGrid className={styles.grid}>
          {activeBookQuery.isFetching ? (
            <LoadSpinner message={'Getting Active Book'} fullScreen={false} />
          ) : (
            activeBookQuery.status === 'success' &&
            activeBookQuery.data.book &&
            Object.keys(activeBookQuery.data.book).length > 0 && (
              <div>
                <h3 className={styles.statusMessage}>
                  This book is in your{' '}
                  {activeBookQuery.data.list?.charAt(0).toUpperCase() +
                    activeBookQuery.data.list?.slice(1)}{' '}
                  List
                </h3>
                <div
                  onClick={() => {
                    history.push(`/app/book`, {
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
            )
          )}

          {activeBookQuery.data?.category !== null &&
            (trendingCategoryBookQuery.isFetching ? (
              <LoadSpinner
                message={`Getting Recommendations about ${
                  activeBookQuery.data?.category || 'Your Favorite Book'
                }`}
                fullScreen={false}
              />
            ) : trendingCategoryBookQuery.status === 'success' &&
              trendingCategoryBookQuery.data.trendingBooksInfo.length > 0 ? (
              <div>
                <h3 className={styles.trendingMessage}>
                  {`Because you liked ${activeBookQuery.data!.category}`}
                </h3>
                {
                  <BookSwiper
                    books={trendingCategoryBookQuery.data.trendingBooksInfo}
                  />
                }
              </div>
            ) : (
              <div>
                <h3 className={styles.failedMessage}>
                  {`Couldn't Get Recommendations About ${
                    activeBookQuery.data?.category || 'Your Favorite Book'
                  }`}
                </h3>
                <IonButton
                  expand="block"
                  shape="round"
                  size="default"
                  onClick={() => {
                    setButtonDisabled(true);
                    trendingCategoryBookQuery.refetch();

                    const timeoutID = setTimeout(() => {
                      setButtonDisabled(false);
                    }, 5000);

                    timeoutRef.current = timeoutID;
                  }}
                  className="ion-margin-top"
                  color="primary"
                  disabled={buttonDisabled}
                >
                  {buttonDisabled ? 'Wait...' : 'Try Again'}
                  <IonIcon slot="end" icon={refreshCircle}></IonIcon>
                </IonButton>
              </div>
            ))}

          {trendingBookQuery.isFetching ? (
            <LoadSpinner
              message={`Getting Trending Books`}
              fullScreen={false}
            />
          ) : trendingBookQuery.status === 'success' &&
            trendingBookQuery.data.trendingBooksInfo &&
            trendingBookQuery.data.trendingBooksInfo.length > 0 ? (
            <div>
              <h3 className={styles.trendingMessage}>
                {`What's Trending This Week`}
              </h3>
              {<BookSwiper books={trendingBookQuery.data.trendingBooksInfo} />}
            </div>
          ) : (
            trendingBookQuery.isError && (
              <div>
                <h3 className={styles.failedMessage}>
                  {`Couldn't Get Trending Books`}
                </h3>
                <IonButton
                  expand="block"
                  shape="round"
                  size="default"
                  onClick={() => {
                    setButtonDisabled(true);
                    trendingBookQuery.refetch();

                    const timeoutID = setTimeout(() => {
                      setButtonDisabled(false);
                    }, 5000);

                    timeoutRef.current = timeoutID;
                  }}
                  className="ion-margin-top"
                  color="primary"
                  disabled={buttonDisabled}
                >
                  {buttonDisabled ? 'Wait...' : 'Try Again'}
                  <IonIcon slot="end" icon={refreshCircle}></IonIcon>
                </IonButton>
              </div>
            )
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Home;
