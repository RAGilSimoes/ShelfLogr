import {
  IonContent,
  IonPage,
  IonIcon,
  IonHeader,
  IonToolbar,
  IonToast,
  IonGrid,
  useIonViewWillLeave,
  useIonViewWillEnter,
  IonButton,
} from '@ionic/react';
import { sunny, partlySunny, moon, refreshCircle } from 'ionicons/icons';

import { ReactElement, useState, useRef } from 'react';

import styles from './Home.module.css';

import api from '../services/api.service';

import axios from 'axios';

import BookInfo from '../components/BookInfo';
import { bookInfo } from '@shelflogr/shared';
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
  const [errorMessage, setErrorMessage] = useState('');

  const [trendingBooksInfo, setTrendingBooksInfo] = useState<
    Array<bookInfo> | undefined
  >(undefined);

  const [trendingMessage, setTrendingMessage] = useState<string>();

  const [trendingType, setTrendingType] = useState<string>();
  const [trendingCategory, setTrendingCategory] = useState<string>();

  const [isRetrying, setIsRetyring] = useState<boolean>(false);

  useIonViewWillLeave(() => {
    setTrendingBooksInfo(undefined);
    setErrorMessage('');
    setDisplayErrorMessage(false);
    setIsRetyring(false);
    setTrendingType('');

    const timeoutId = timeoutRef.current;
    clearTimeout(timeoutId);
  });

  useIonViewWillEnter(() => {
    getTrendingBooksRecommendation(trendingCategory);
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

  const interpretTrendingData = (
    trendingBooks: {
      type: string;
      trendingBooksInfo: Array<bookInfo>;
    },
    category?: string,
  ) => {
    setTrendingType(trendingBooks.type);

    switch (trendingBooks.type) {
      case 'category': {
        setTrendingCategory(category);
        if (trendingBooks.trendingBooksInfo.length > 0) {
          setTrendingMessage(`Because you liked ${category}`);
          setTrendingBooksInfo(trendingBooks.trendingBooksInfo);
        } else {
          setErrorMessage(`Couldn't Get Recommendations About ${category}`);
        }

        break;
      }

      case 'trending': {
        if (trendingBooks.trendingBooksInfo.length > 0) {
          setTrendingMessage("What's on the trends this week");
          setTrendingBooksInfo(trendingBooks.trendingBooksInfo);
        } else {
          setErrorMessage(`Couldn't Get Trending Books`);
        }

        break;
      }

      default:
        break;
    }
  };

  const getTrendingBooksRecommendation = async (category?: string) => {
    try {
      const trendingBooksResponse = await api.get('/books/trending', {
        params: {
          category,
        },
      });

      const status = trendingBooksResponse.status;

      if (status === 200) {
        if (Object.keys(trendingBooksResponse.data).length > 0) {
          const data: {
            type: string;
            trendingBooksInfo: Array<bookInfo>;
          } = trendingBooksResponse.data;

          if (data.trendingBooksInfo) interpretTrendingData(data, category);
        }
      }
    } catch (error) {
      setDisplayErrorMessage(true);
      if (axios.isAxiosError(error)) {
        const serverMessage =
          error.response?.data?.error || 'Server communication error.';
        setErrorMessage(serverMessage);
      } else {
        setErrorMessage('Unexpected error occurred.');
      }
    } finally {
      setIsRetyring(false);
      const timeoutID = setTimeout(() => {
        setButtonDisabled(false);
      }, 5000);

      timeoutRef.current = timeoutID;
    }
  };

  const activeBookQuery = useQuery({
    queryKey: ['userBook'],
    queryFn: fetchUserBookRecommendation,
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
          message={errorMessage}
          duration={5000}
          isOpen={displayErrorMessage}
          onDidDismiss={() => {
            setDisplayErrorMessage(false);
            setErrorMessage('');
          }}
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
            {trendingBooksInfo ? (
              <>
                <h3 className={styles.trendingMessage}>{trendingMessage}</h3>
                {<BookSwiper books={trendingBooksInfo} />}
              </>
            ) : isRetrying ? (
              <div className={styles.retryingDiv}>
                <LoadSpinner
                  message={
                    trendingType === 'category'
                      ? `Getting Book Recommendations for ${trendingCategory} Category`
                      : `Getting Trending Books`
                  }
                  fullScreen={false}
                />
              </div>
            ) : (
              <>
                <h3 className={styles.failedMessage}>{errorMessage}</h3>
                <IonButton
                  expand="block"
                  shape="round"
                  size="default"
                  onClick={() => {
                    setIsRetyring(true);
                    getTrendingBooksRecommendation(trendingCategory);
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
