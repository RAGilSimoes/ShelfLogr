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
      <IonContent fullscreen>
        <ExploreContainer name="ChatBot page" />
      </IonContent>
    </IonPage>
  );
};

export default ChatBot;
