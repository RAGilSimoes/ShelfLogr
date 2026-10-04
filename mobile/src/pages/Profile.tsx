import { IonContent, IonPage, IonButton, IonIcon, IonGrid } from '@ionic/react';
import { cog } from 'ionicons/icons';

import styles from './Profile.module.css';

import { useUserLists } from '../queryOptions/useUserLists';

import LoadSpinner from '../components/LoadSpinner';

import UserCard from '../components/UserCard';

import { useQuery } from '@tanstack/react-query';
import fetchUserProfileInfo from '../queryOptions/profilePageQueries';

import useAuthStore from '../store/useAuthStore';

const Profile: React.FC = () => {
  const userListsQuery = useUserLists();

  let userLists: Array<{
    id: string;
    name: string;
    is_system: boolean;
    quantity: number;
  }> = userListsQuery.isSuccess ? userListsQuery.data.lists : {};

  const userID = useAuthStore((state) => state.userID);

  const profileInfoQuery = useQuery({
    queryKey: ['userProfile', userID],
    queryFn: () => fetchUserProfileInfo(),
    select(data: {
      info: {
        name: string;
        email: string;
        updated_at: string;
        created_at: string;
      };
    }) {
      const createdAt = new Date(data.info.created_at);
      const createdAtString = createdAt.toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      });

      const formattedCreatedAtString =
        createdAtString.charAt(0).toUpperCase() + createdAtString.slice(1);

      return {
        name: data.info.name,
        email: data.info.email,
        updated_at: new Date(data.info.updated_at),
        created_at: formattedCreatedAtString,
      };
    },
  });

  return (
    <IonPage>
      <IonContent fullscreen>
        {profileInfoQuery.isFetching ? (
          <LoadSpinner message={'Fetching User Info...'} fullScreen={true} />
        ) : profileInfoQuery.isSuccess ? (
          <>
            <div className={styles.topBar}>
              <h1>Profile</h1>
              <IonButton
                fill="clear"
                slot="end"
                routerLink="/app/settings"
                routerDirection="forward"
                className={styles.settings}
              >
                <IonIcon slot="icon-only" icon={cog}></IonIcon>
              </IonButton>
            </div>

            <IonGrid>
              <UserCard userInfo={profileInfoQuery.data}>
                <hr></hr>

                {userLists.length > 0 && (
                  <div className={styles.systemListsDiv}>
                    {userLists
                      .filter((item) => item.is_system === true)
                      .map((item) => {
                        return (
                          <div className={styles.systemListInfo}>
                            <strong className={styles.systemListQuantity}>
                              {item.quantity}
                            </strong>
                            <span className={styles.systemListName}>
                              {item.name}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </UserCard>
            </IonGrid>
          </>
        ) : (
          <p>Erro</p>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Profile;
