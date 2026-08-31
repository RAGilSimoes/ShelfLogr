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
  const location = useLocation<{ information?: bookInfo }>();

  const information = location.state?.information;

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
        {information && <BookInfo bookInfo={information} detailed={true} />}
      </IonContent>
    </IonPage>
  );
};

export default BookPage;
