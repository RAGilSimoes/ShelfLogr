import {
  IonContent,
  IonPage,
  IonItem,
  IonLabel,
  IonIcon,
  IonHeader,
  IonToolbar,
  IonToast,
  IonGrid,
  useIonViewWillLeave,
  useIonViewWillEnter,
  IonModal,
  IonButton,
  IonButtons,
} from '@ionic/react';
import { sunny, partlySunny, moon, refreshCircle } from 'ionicons/icons';

import { ReactElement, useEffect, useState, useRef } from 'react';

import styles from './Home.module.css';

import api from '../services/api.service';

import axios from 'axios';

import BookInfo from '../components/BookInfo';
import { bookInfo } from '@shelflogr/shared';
import { useHistory, useLocation, useRouteMatch } from 'react-router';

import LoadSpinner from '../components/LoadSpinner';
import BookSwiper from '../components/BookSwiper';

const Home: React.FC<{ userName: string }> = ({ userName }) => {
  const history = useHistory();
  const location = useLocation();

  const timeoutRef = useRef(0);

  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);

  const [displayErrorMessage, setDisplayErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [activeBookInfo, setActiveBookInfo] = useState<bookInfo | undefined>(
    undefined,
  );
  const [trendingBooksInfo, setTrendingBooksInfo] = useState<
    Array<bookInfo> | undefined
  >(undefined);

  const [statusMessage, setStatusMessage] = useState<string>();
  const [trendingMessage, setTrendingMessage] = useState<string>();

  const [recomendationType, setRecomendationType] = useState<string>();
  const [trendingType, setTrendingType] = useState<string>();
  const [trendingCategory, setTrendingCategory] = useState<string>();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRetrying, setIsRetyring] = useState<boolean>(false);

  useIonViewWillLeave(() => {
    setStatusMessage('');
    setTrendingBooksInfo(undefined);
    setErrorMessage('');
    setDisplayErrorMessage(false);
    setIsLoading(false);
    setActiveBookInfo(undefined);
    setIsRetyring(false);
    setTrendingType('');

    const timeoutId = timeoutRef.current;
    clearTimeout(timeoutId);
  });

  useIonViewWillEnter(() => {
    getUserBooksRecomendation();
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

  const interpretData = (data: {
    activeBook?: { type: string; list: string; book: bookInfo };
    trending: {
      type: string;
      category?: string;
      trendingBooksInfo: Array<bookInfo>;
    };
  }) => {
    if (data.activeBook) {
      const activeInfo = data.activeBook;
      let book = activeInfo.book;
      let bookStatus = activeInfo.list!;

      setStatusMessage(
        `This book is in your ${
          bookStatus?.charAt(0).toUpperCase() + bookStatus?.slice(1)
        } List`,
      );

      setActiveBookInfo(book);

      setRecomendationType(activeInfo.type);
    }

    if (data.trending) {
      const trendingInfo = data.trending;
      setTrendingType(trendingInfo.type);

      switch (trendingInfo.type) {
        case 'category': {
          setTrendingCategory(trendingInfo.category);
          if (trendingInfo.trendingBooksInfo.length > 0) {
            setTrendingMessage(`Because you liked ${trendingInfo.category}`);
            setTrendingBooksInfo(trendingInfo.trendingBooksInfo);
          } else {
            setErrorMessage(
              `Couldn't Get Recommendations About ${trendingInfo.category}`,
            );
          }

          break;
        }

        case 'trending': {
          if (trendingInfo.trendingBooksInfo.length > 0) {
            setTrendingMessage("What's on the trends this week");
            setTrendingBooksInfo(trendingInfo.trendingBooksInfo);
          } else {
            setErrorMessage(`Couldn't Get Trending Books`);
          }

          break;
        }

        default:
          break;
      }
    }
  };

  const getUserBooksRecomendation = async () => {
    setIsLoading(true);
    setButtonDisabled(true);
    try {
      const response = await api.get('/get-user-books-recomendations');

      const status = response.status;

      if (status == 200) {
        if (Object.keys(response.data).length) {
          const data: {
            activeBook?: { type: string; list: string; book: bookInfo };
            trending: {
              type: string;
              category?: string;
              trendingBooksInfo: Array<bookInfo>;
            };
          } = response.data;
          interpretData(data);
        } else {
          throw new Error();
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
      setIsLoading(false);
      setIsRetyring(false);
      const timeoutID = setTimeout(() => {
        setButtonDisabled(false);
      }, 5000);

      timeoutRef.current = timeoutID;
    }
  };

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
        {isLoading && !activeBookInfo ? (
          <LoadSpinner
            message={'Getting Book Recomendations For You...'}
            fullScreen={true}
          />
        ) : (
          <IonGrid className={styles.grid}>
            {recomendationType === 'personal' && activeBookInfo && (
              <>
                <h3 className={styles.statusMessage}>{statusMessage}</h3>
                <div
                  onClick={() => {
                    history.push(`/app/book`, {
                      information: activeBookInfo,
                    });
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <BookInfo bookInfo={activeBookInfo} detailed={false} />
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
                    getUserBooksRecomendation();
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
