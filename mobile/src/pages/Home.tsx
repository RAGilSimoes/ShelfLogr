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

import { ReactElement, useState, useRef } from 'react';

import styles from './Home.module.css';

import BookInfo from '../components/BookInfo';
import { useHistory } from 'react-router';

import LoadSpinner from '../components/LoadSpinner';
import BookSwiper from '../components/BookSwiper';

import { useQuery } from '@tanstack/react-query';
import {
  fetchUserBookRecommendation,
  fetchTrendingBooksRecommendation,
} from '../queryOptions/homeQueries';

const Home: React.FC<{ userName: string }> = ({ userName }) => {
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
    queryKey: ['userBook'],
    queryFn: fetchUserBookRecommendation,
  });

  const trendingBookQuery = useQuery({
    queryKey: ['trendingBooks', activeBookQuery.data?.category],
    queryFn: () =>
      fetchTrendingBooksRecommendation(activeBookQuery.data?.category),
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
              <strong className={styles.welcomeTextDynamic}>{userName}</strong>
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

        {activeBookQuery.isLoading ? (
          <LoadSpinner
            message={'Getting Book Recomendations For You...'}
            fullScreen={true}
          />
        ) : (
          <IonGrid className={styles.grid}>
            {activeBookQuery.status === 'success' &&
              activeBookQuery.data.activeBook &&
              Object.keys(activeBookQuery.data.activeBook).length > 0 && (
                <>
                  <h3 className={styles.statusMessage}>
                    This book is in your{' '}
                    {activeBookQuery.data.activeBook.list
                      ?.charAt(0)
                      .toUpperCase() +
                      activeBookQuery.data.activeBook.list?.slice(1)}{' '}
                    List
                  </h3>
                  <div
                    onClick={() => {
                      history.push(`/app/book`, {
                        information: activeBookQuery.data.activeBook.book,
                      });
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <BookInfo
                      bookInfo={activeBookQuery.data.activeBook.book}
                      detailed={false}
                    />
                  </div>
                </>
              )}{' '}
            {trendingBookQuery.status === 'success' &&
            trendingBookQuery.data.trendingBooksInfo.length > 0 ? (
              <>
                <h3 className={styles.trendingMessage}>
                  {activeBookQuery.data.category !== undefined
                    ? `Because you liked ${activeBookQuery.data.category}`
                    : `What's Trending This Week`}
                </h3>
                {
                  <BookSwiper
                    books={trendingBookQuery.data.trendingBooksInfo}
                  />
                }
              </>
            ) : trendingBookQuery.isRefetching ? (
              <div className={styles.retryingDiv}>
                <LoadSpinner
                  message={
                    activeBookQuery.data.category !== undefined
                      ? `Getting Book Recommendations for ${trendingBookQuery.data.category} Category`
                      : `Getting Trending Books`
                  }
                  fullScreen={false}
                />
              </div>
            ) : (
              <>
                <h3 className={styles.failedMessage}>
                  {activeBookQuery.data.category !== undefined
                    ? `Couldn't Get Recommendations About ${activeBookQuery.data.category}`
                    : `Couldn't Get Trending Books`}
                </h3>
                <IonButton
                  expand="block"
                  shape="round"
                  size="default"
                  onClick={() => {
                    trendingBookQuery.refetch();
                    setButtonDisabled(true);

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
              </>
            )}
          </IonGrid>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;
