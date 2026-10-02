import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
} from '@ionic/react';
import { cog } from 'ionicons/icons';

import styles from './Profile.module.css';

import { useQuery } from '@tanstack/react-query';
import fetchUserProfileInfo from '../queryOptions/profilePageQueries';

import useAuthStore from '../store/useAuthStore';

import LoadSpinner from '../components/LoadSpinner';

import { useRouteMatch } from 'react-router';

const Profile: React.FC = () => {
  const match = useRouteMatch();
  const path = match.url;
  const userID = useAuthStore((state) => state.userID);

  const profileInfoQuery = useQuery({
    queryKey: ['userProfile', userID],
    queryFn: () => fetchUserProfileInfo(),
  });

  console.log(profileInfoQuery);

  if (profileInfoQuery.isSuccess) console.log(profileInfoQuery.data);

  return (
    <IonPage>
      <IonHeader className={`ion-no-border ${styles.header}`}>
        <IonToolbar>
          <IonButton
            slot="end"
            routerLink="/app/settings"
            routerDirection="forward"
          >
            <IonIcon slot="icon-only" icon={cog}></IonIcon>
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {profileInfoQuery.isFetching ? (
          <LoadSpinner message={'Fetching User Info...'} fullScreen={true} />
        ) : (
          profileInfoQuery.isSuccess && <p>Sucesso</p>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Profile;
