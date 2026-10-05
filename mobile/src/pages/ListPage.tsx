import {
  IonBackButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
} from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './ListPage.module.css';

import { useLocation } from 'react-router';

const ListPage: React.FC = () => {
  const location: any = useLocation();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/profile"></IonBackButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <ExploreContainer name="List Page" />
      </IonContent>
    </IonPage>
  );
};

export default ListPage;
