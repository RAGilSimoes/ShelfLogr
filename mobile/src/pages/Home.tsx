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
import { sunny, partlySunny, moon, book } from 'ionicons/icons';

import { ReactElement, useEffect, useState } from 'react';

import styles from './Home.module.css';

import api from '../services/api.service';

import axios from 'axios';

import BookInfo from '../components/BookInfo';
import { bookInfo } from '@shelflogr/shared';
import { useHistory, useLocation, useRouteMatch } from 'react-router';

const Home: React.FC<{ userName: string }> = ({ userName }) => {
  const history = useHistory();
  const location = useLocation();

  const [displayErrorMessage, setDisplayErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [bookInfo, setBookInfo] = useState<bookInfo | undefined>(undefined);
  const [bookStatus, setBookStatus] = useState<string | null>(null);

  const [isShowingDetailedBook, setIsShowingDetailedBook] = useState(false);

  useIonViewWillLeave(() => {
    setBookInfo(undefined);
    setBookStatus(null);
    setErrorMessage('');
    setDisplayErrorMessage(false);
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

  const getUserBooksRecomendation = async () => {
    try {
      const response = await api.get('/get-user-books-recomendations');

      const status = response.status;

      if (status == 200) {
        if (Object.keys(response.data).length) {
          const data = response.data;

          setBookInfo(data.book);
          setBookStatus(data.list);
        } else {
          console.log('não encontrou livro');
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
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
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
        <IonGrid>
          {bookInfo && (
            <>
              <p>{`This book is in your ${
                bookStatus === 'reading'
                  ? 'Reading List'
                  : bookStatus === 'completed'
                  ? 'Completed List'
                  : 'Wish List'
              }!`}</p>
              <div
                onClick={() => {
                  history.push(`/app/book`, {
                    information: bookInfo,
                  });
                }}
                style={{ cursor: 'pointer' }}
              >
                <BookInfo bookInfo={bookInfo} detailed={false} />
              </div>
            </>
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Home;
