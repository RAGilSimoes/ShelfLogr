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

const Tabs: React.FC<{ userName: string }> = ({ userName }) => {
  const match = useRouteMatch();
  const path = match.url;

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path={path + '/home'}>
          <Home userName={userName} />
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
        <Route exact path={path + '/book'}>
          <BookPage />
        </Route>
        <Route exact path={path}>
          <Redirect to={path + '/home'} />
        </Route>
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton tab="home" href={path + '/home'}>
          <IonIcon aria-hidden="true" icon={home} />
          <IonLabel>Home</IonLabel>
        </IonTabButton>
        <IonTabButton tab="search" href={path + '/search'}>
          <IonIcon aria-hidden="true" icon={search} />
          <IonLabel>Search</IonLabel>
        </IonTabButton>
        <IonTabButton tab="add" href={path + '/add'}>
          <IonIcon aria-hidden="true" icon={addCircle} />
          <IonLabel>Add</IonLabel>
        </IonTabButton>
        <IonTabButton tab="chatbot" href={path + '/chatbot'}>
          <IonIcon aria-hidden="true" icon={chatbubbles} />
          <IonLabel>ChatBot</IonLabel>
        </IonTabButton>
        <IonTabButton tab="profile" href={path + '/profile'}>
          <IonIcon aria-hidden="true" icon={person} />
          <IonLabel>Profile</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default Tabs;
