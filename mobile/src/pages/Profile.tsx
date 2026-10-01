import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

import './Profile.module.css';

import { useQuery } from '@tanstack/react-query';
import fetchUserProfileInfo from '../queryOptions/profilePageQueries';

import useAuthStore from '../store/useAuthStore';

import LoadSpinner from '../components/LoadSpinner';

const Profile: React.FC = () => {
  const userID = useAuthStore((state) => state.userID);

  const profileInfoQuery = useQuery({
    queryKey: ['userProfile', userID],
    queryFn: () => fetchUserProfileInfo(),
  });

  console.log(profileInfoQuery);

  if (profileInfoQuery.isSuccess) console.log(profileInfoQuery.data);

  return (
    <IonPage>
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
