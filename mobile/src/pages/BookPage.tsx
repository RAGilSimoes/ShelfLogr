import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
} from '@ionic/react';

import BookInfo from '../components/BookInfo';
import { bookInfo } from '@shelflogr/shared';

import { useHistory, useLocation } from 'react-router';

const BookPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation<{
    information: { book: bookInfo; category?: string; list?: string };
  }>();

  const information: {
    book: bookInfo;
    category?: string;
    list?: string;
  } = location.state?.information;

  if (information) {
    const bookInfo = information.book;

    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton></IonBackButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          {bookInfo && <BookInfo bookInfo={bookInfo} detailed={true} />}
          <p>{information.list ? information.list : 'não está nas listas'}</p>
        </IonContent>
      </IonPage>
    );
  } else {
    return <>Erro</>;
  }
};

export default BookPage;
