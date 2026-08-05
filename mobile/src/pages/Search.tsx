import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSearchbar,
} from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Search.css';

const Search: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonSearchbar
            animated={true}
            placeholder="Search"
            showClearButton="focus"
          ></IonSearchbar>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <ExploreContainer name="Search page" />
      </IonContent>
    </IonPage>
  );
};

export default Search;
