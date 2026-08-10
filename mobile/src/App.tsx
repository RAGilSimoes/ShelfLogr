import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact,
  IonSpinner,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import Login from './pages/Login';
import Tabs from './components/Tabs';
import Register from './pages/Register';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

import { ReactElement, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

import { setToken, checkToken, removeToken } from './services/auth.service';
import api from './services/api.service';

import { useHistory, useLocation } from 'react-router-dom';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

setupIonicReact();

const AppRouter: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const [userName, setUserName] = useState('');

  const [isLoading, setIsLoading] = useState(true);

  const gracePeriod = 86400000; // 1 day

  useEffect(() => {
    const initApp = async () => {
      await BarcodeScanner.installGoogleBarcodeScannerModule();
    };
    initApp();

    const verifyToken = async () => {
      setIsLoading(true);
      const token = await checkToken();
      const publicPaths = ['/login', '/register'];
      const isPublicPath = publicPaths.includes(location.pathname);

      if (token) {
        try {
          const decodedData: any = await jwtDecode(token);
          const expireDate = decodedData.exp * 1000;
          const currentDate = Date.now();

          if (currentDate - expireDate >= gracePeriod) {
            throw new Error('Expired Token');
          } else if (
            currentDate > expireDate &&
            currentDate - expireDate < gracePeriod
          ) {
            const response = await api.get('/refresh-token');
            setToken(response.data.token);
          }

          setUserName(decodedData.name);

          if (isPublicPath) {
            history.replace('/app/home');
          }
        } catch (error) {
          removeToken();
          history.replace('/login', {
            message: 'Session expired. Please login again',
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        if (!isPublicPath) {
          history.replace('/login', {
            message: 'Please login to continue',
          });
        }
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
          backgroundColor: 'var(--ion-background-color)',
        }}
      >
        <IonSpinner name="lines" color="primary" />
      </div>
    );
  }

  return (
    <IonRouterOutlet>
      <Route exact path="/login">
        <Login />
      </Route>
      <Route exact path="/register">
        <Register />
      </Route>
      <Route path="/app">
        <Tabs userName={userName} />
      </Route>
      <Route exact path="/">
        <Redirect to="/login" />
      </Route>
    </IonRouterOutlet>
  );
};

const App: React.FC = () => {
  return (
    <IonApp>
      <IonReactRouter>
        <AppRouter />
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
