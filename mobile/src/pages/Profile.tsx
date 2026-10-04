import {
  IonContent,
  IonPage,
  IonButton,
  IonIcon,
  IonGrid,
  IonList,
  IonItem,
} from '@ionic/react';
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
        number_reviews: number;
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
        number_reviews: data.info.number_reviews,
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
                  <div className={styles.userInfo}>
                    <div className={styles.userListsInfo}>
                      <strong className={styles.userListsQuantity}>
                        {userLists
                          .filter((item) => item.is_system)
                          .reduce((sum, item) => {
                            return sum + item.quantity;
                          }, 0)}
                      </strong>
                      <span className={styles.userListsText}>Nº Books</span>
                    </div>

                    <div className={styles.userReviewsInfo}>
                      <strong className={styles.userReviewsQuantity}>
                        {profileInfoQuery.data.number_reviews}
                      </strong>
                      <span className={styles.userReviewsText}>Nº Reviews</span>
                    </div>
                  </div>
                )}
              </UserCard>
              <div className={styles.systemListsDiv}>
                <h1>Default Lists</h1>
                <IonList inset={true}>
                  {userLists
                    .filter((list) => list.is_system)
                    .map((list, index) => {
                      return (
                        <IonItem button={true} key={index}>
                          {list.name}
                        </IonItem>
                      );
                    })}
                </IonList>
              </div>
              <div className={styles.customListsDiv}>
                <h1>Custom Lists</h1>
                <IonList inset={true}>
                  {userLists
                    .filter((list) => !list.is_system)
                    .map((list, index) => {
                      return (
                        <IonItem button={true} key={index}>
                          {list.name}
                        </IonItem>
                      );
                    })}
                </IonList>
              </div>
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
