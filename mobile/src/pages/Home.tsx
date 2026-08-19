import {
  IonContent,
  IonPage,
  IonItem,
  IonLabel,
  IonIcon,
  IonHeader,
  IonToolbar,
} from '@ionic/react';
import { sunny, partlySunny, moon } from 'ionicons/icons';
import ExploreContainer from '../components/ExploreContainer';
import './Home.css';

import { ReactElement, useEffect, useState } from 'react';

const Home: React.FC<{ userName: string }> = ({ userName }) => {
  function getTimeIcon(): ReactElement {
    const iconStyle = {
      width: '40px',
      height: '40px',
    };

    const currentHour: number = new Date().getHours();

    const icon =
      currentHour >= 6 && currentHour <= 12 ? (
        <IonIcon aria-hidden="true" icon={sunny} style={iconStyle} />
      ) : currentHour > 12 && currentHour < 20 ? (
        <IonIcon aria-hidden="true" icon={partlySunny} style={iconStyle} />
      ) : (
        <IonIcon aria-hidden="true" icon={moon} style={iconStyle} />
      );

    return icon;
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '15px',
              padding: '10px 0',
            }}
          >
            {getTimeIcon()}

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '14px' }}>Welcome Back</span>
              <strong style={{ fontSize: '16px', fontWeight: '500' }}>
                {userName}
              </strong>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <ExploreContainer name="Home page" />
      </IonContent>
    </IonPage>
  );
};

export default Home;
