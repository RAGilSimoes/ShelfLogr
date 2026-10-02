import {
  IonContent,
  IonPage,
  IonButton,
  IonIcon,
  IonGrid,
  IonCard,
  IonCardContent,
  IonAvatar,
} from '@ionic/react';
import { cog } from 'ionicons/icons';

import styles from './Profile.module.css';

import { useQuery } from '@tanstack/react-query';
import fetchUserProfileInfo from '../queryOptions/profilePageQueries';

import { useUserLists } from '../queryOptions/useUserLists';

import useAuthStore from '../store/useAuthStore';

import LoadSpinner from '../components/LoadSpinner';

const Profile: React.FC = () => {
  const userID = useAuthStore((state) => state.userID);

  const userListsQuery = useUserLists();

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

  let userLists: Array<{
    id: string;
    name: string;
    is_system: boolean;
    quantity: number;
  }> = userListsQuery.isSuccess ? userListsQuery.data.lists : {};

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
              <IonCard className={styles.card}>
                <IonCardContent>
                  <div className={styles.profileInfo}>
                    <div className={styles.importantInfo}>
                      <IonAvatar className={styles.avatar}>
                        <span>
                          {profileInfoQuery.data.name
                            .split(' ')
                            .map((word) => word[0])}
                        </span>
                      </IonAvatar>
                      <div className={styles.userText}>
                        <h2 className={styles.username}>
                          {profileInfoQuery.data.name}
                        </h2>
                        <span className={styles.memberSince}>
                          Member Since: {profileInfoQuery.data.created_at}
                        </span>
                      </div>
                    </div>

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
                  </div>
                </IonCardContent>
              </IonCard>
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
