import { IonContent, IonPage, IonItem, IonLabel, IonIcon } from '@ionic/react';
import { sunny, cloudyNight, moon } from 'ionicons/icons';
import ExploreContainer from '../components/ExploreContainer';
import './Login.css';
import { ReactElement } from 'react';

const Login: React.FC = () => {
  return (
    <IonPage>
      <IonContent fullscreen>
        <ExploreContainer name="Login page" />
      </IonContent>
    </IonPage>
  );
};

export default Login;
