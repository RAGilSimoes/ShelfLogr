import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
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

setupIonicReact();

const AppRouter: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      const token = await checkToken();
      const publicPaths = ['/login', '/register'];
      const isPublicPath = publicPaths.includes(location.pathname);

      if (token) {
        try {
          const decodedData: any = jwtDecode(token);
          const expireDate = decodedData.exp * 1000;
          const currentDate = Date.now();

          if (currentDate > expireDate) {
            throw new Error('Expired Token');
          }

          setUserName(decodedData.name);
          const response = await api.get('/refresh-token');
          setToken(response.data.token);

          if (isPublicPath) {
            history.replace('/app/home');
          }
        } catch (error) {
          removeToken();
          history.replace('/login', {
            message: 'Session expired. Please login again',
          });
        }
      } else {
        if (!isPublicPath) {
          history.replace('/login', {
            message: 'Please login to continue',
          });
        }
      }
    };

    verifyToken();
  }, [location.pathname]);

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
