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
  const location: any = useLocation().state;

  const information: {
    id: string;
    is_system: boolean;
    name: string;
    quantity: number;
  } = location.information;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/profile"></IonBackButton>
          </IonButtons>
          <IonTitle>
            {information.name.charAt(0).toUpperCase() +
              information.name.slice(1)}{' '}
            List
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <ExploreContainer name="List Page" />
      </IonContent>
    </IonPage>
  );
};

export default ListPage;
