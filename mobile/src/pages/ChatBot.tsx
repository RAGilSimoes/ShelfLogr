import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './ChatBot.css';

const ChatBot: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>ChatBot</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">ChatBot</IonTitle>
          </IonToolbar>
        </IonHeader>
        <ExploreContainer name="ChatBot page" />
      </IonContent>
    </IonPage>
  );
};

export default ChatBot;
