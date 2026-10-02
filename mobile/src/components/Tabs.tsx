import { Redirect, Route } from 'react-router-dom';
import {
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/react';

import { useRouteMatch } from 'react-router-dom';

import { home, search, addCircle, chatbubbles, person } from 'ionicons/icons';
import Home from '../pages/Home';
import Search from '../pages/Search';
import Add from '../pages/Add';
import Profile from '../pages/Profile';
import ChatBot from '../pages/ChatBot';
import BookPage from '../pages/BookPage';
import Settings from '../pages/SettingsPage';

const Tabs: React.FC = () => {
  const match = useRouteMatch();
  const path = match.url;

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path={path + '/home'}>
          <Home />
        </Route>
        <Route exact path={path + '/search'}>
          <Search />
        </Route>
        <Route path={path + '/add'}>
          <Add />
        </Route>
        <Route path={path + '/chatbot'}>
          <ChatBot />
        </Route>
        <Route exact path={path + '/profile'}>
          <Profile />
        </Route>
        <Route exact path={path + '/settings'}>
          <Settings />
        </Route>
        <Route exact path={path + '/book'}>
          <BookPage />
        </Route>
        <Route exact path={path}>
          <Redirect to={path + '/home'} />
        </Route>
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton tab="home" href={path + '/home'}>
          <IonIcon aria-hidden="true" aria-label="Home Page" icon={home} />
        </IonTabButton>
        <IonTabButton tab="search" href={path + '/search'}>
          <IonIcon aria-hidden="true" aria-label="Search Page" icon={search} />
        </IonTabButton>
        <IonTabButton tab="add" href={path + '/add'}>
          <IonIcon aria-hidden="true" aria-label="Add Page" icon={addCircle} />
        </IonTabButton>
        <IonTabButton tab="chatbot" href={path + '/chatbot'}>
          <IonIcon
            aria-hidden="true"
            aria-label="ChatBot Page"
            icon={chatbubbles}
          />
        </IonTabButton>
        <IonTabButton tab="profile" href={path + '/profile'}>
          <IonIcon aria-hidden="true" aria-label="Profile Page" icon={person} />
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default Tabs;
