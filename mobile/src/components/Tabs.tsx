import { Redirect, Route } from 'react-router-dom';
import {
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/react';

import { home, search, addCircle, chatbubbles, person } from 'ionicons/icons';
import Home from '../pages/Home';
import Search from '../pages/Search';
import Add from '../pages/Add';
import Profile from '../pages/Profile';
import ChatBot from '../pages/ChatBot';

const Tabs: React.FC = () => {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/app/home">
          <Home />
        </Route>
        <Route exact path="/app/search">
          <Search />
        </Route>
        <Route path="/app/add">
          <Add />
        </Route>
        <Route path="/app/chatbot">
          <ChatBot />
        </Route>
        <Route exact path="/app/profile">
          <Profile />
        </Route>
        <Route exact path="/app">
          <Redirect to="/app/home" />
        </Route>
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton tab="home" href="/app/home">
          <IonIcon aria-hidden="true" icon={home} />
          <IonLabel>Home</IonLabel>
        </IonTabButton>
        <IonTabButton tab="search" href="/app/search">
          <IonIcon aria-hidden="true" icon={search} />
          <IonLabel>Search</IonLabel>
        </IonTabButton>
        <IonTabButton tab="add" href="/app/add">
          <IonIcon aria-hidden="true" icon={addCircle} />
          <IonLabel>Add</IonLabel>
        </IonTabButton>
        <IonTabButton tab="chatbot" href="/app/chatbot">
          <IonIcon aria-hidden="true" icon={chatbubbles} />
          <IonLabel>ChatBot</IonLabel>
        </IonTabButton>
        <IonTabButton tab="profile" href="/app/profile">
          <IonIcon aria-hidden="true" icon={person} />
          <IonLabel>Profile</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default Tabs;
