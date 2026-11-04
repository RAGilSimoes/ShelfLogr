import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

import ComingSoon from '../components/ComingSoon';
import './ChatBot.css';

const ChatBot: React.FC = () => {
  return (
    <IonPage>
      <IonContent fullscreen>
        <ComingSoon />
      </IonContent>
    </IonPage>
  );
};

export default ChatBot;
