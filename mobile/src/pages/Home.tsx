import { IonContent, IonPage, IonItem, IonLabel, IonIcon } from '@ionic/react';
import { sunny, cloudyNight, moon } from 'ionicons/icons';
import ExploreContainer from '../components/ExploreContainer';
import './Home.css';
import { ReactElement } from 'react';

const Home: React.FC = () => {
  function getTimeIcon(): ReactElement {
    const iconStyle = {
      width: '40px',
      height: '40px',
    };

    const currentHour: number = Number(
      new Date().toLocaleTimeString('pt-PT').split(':')[0],
    );

    const icon =
      currentHour >= 6 && currentHour <= 12 ? (
        <IonIcon aria-hidden="true" icon={sunny} style={iconStyle} />
      ) : currentHour > 12 && currentHour < 20 ? (
        <IonIcon aria-hidden="true" icon={cloudyNight} style={iconStyle} />
      ) : (
        <IonIcon aria-hidden="true" icon={moon} style={iconStyle} />
      );

    return icon;
  }

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonItem
          style={{
            justifySelf: 'center',
            width: '75%',
            marginTop: '15px',
            height: 'fit-content',
            padding: '5px 0px',
          }}
        >
          {getTimeIcon()}
          <IonLabel
            style={{
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: 'min-content',
            }}
          >
            <IonLabel style={{ width: 'fit-content' }}>Welcome Back</IonLabel>
            <IonLabel style={{ width: 'fit-content' }}>Username</IonLabel>
          </IonLabel>
        </IonItem>
        <ExploreContainer name="Home page" />
      </IonContent>
    </IonPage>
  );
};

export default Home;
