import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Add.css';

const Add: React.FC = () => {
  return (
    <IonPage>
      <IonContent fullscreen>
        <ExploreContainer name="Add page" />
      </IonContent>
    </IonPage>
  );
};

export default Add;
