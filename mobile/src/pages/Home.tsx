import { IonContent, IonPage, IonItem, IonLabel, IonIcon } from '@ionic/react';
import { sunny, partlySunny, moon } from 'ionicons/icons';
import ExploreContainer from '../components/ExploreContainer';
import './Home.css';
import { ReactElement, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

import { setToken, checkToken, removeToken } from '../services/auth.service';

import { useHistory } from 'react-router-dom';

const Home: React.FC = () => {
  const [userName, setUserName] = useState('Default');
  const history = useHistory();

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

  useEffect(() => {
    const loadUsername = async () => {
      const token = await checkToken();

      if (token) {
        try {
          const decodedData: any = jwtDecode(token);

          const expireDate = decodedData.exp * 1000;
          const currentDate = Date.now();

          if (currentDate > expireDate) {
            throw new Error('Expired Token');
          }

          setUserName(decodedData.name);
        } catch (error) {
          removeToken();
          history.replace('/login', {
            message: 'Session expired. Please login again',
          });
        }
      } else {
        history.replace('/login', {
          message: 'Session expired. Please login again',
        });
      }
    };

    loadUsername();
  }, []);

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
            <IonLabel style={{ width: 'fit-content' }}>{userName}</IonLabel>
          </IonLabel>
        </IonItem>
        <ExploreContainer name="Home page" />
      </IonContent>
    </IonPage>
  );
};

export default Home;
