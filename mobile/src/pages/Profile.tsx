import {
  IonContent,
  IonPage,
  IonButton,
  IonIcon,
  IonGrid,
  IonList,
  IonItem,
  IonAccordionGroup,
  IonAccordion,
  IonLabel,
  IonBadge,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/react';

import { cog, book, bookmark, checkmarkCircle, star } from 'ionicons/icons';

import styles from './Profile.module.css';

import { useUserShelves } from '../queryOptions/useUserShelves';

import LoadSpinner from '../components/LoadSpinner';

import UserCard from '../components/UserCard';

import { useQuery } from '@tanstack/react-query';
import fetchUserProfileInfo from '../queryOptions/profilePageQueries';

import useAuthStore from '../store/useAuthStore';

import { useHistory } from 'react-router';

import ErrorDisplay from '../components/ErrorDisplay';

const Profile: React.FC = () => {
  const history = useHistory();
  const userShelvesQuery = useUserShelves();

  const userShelves: Array<{
    id: string;
    name: string;
    is_system: boolean;
    quantity: number;
  }> = userShelvesQuery.isSuccess ? userShelvesQuery.data.shelves : [];

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
        <IonRefresher
          slot="fixed"
          onIonRefresh={async (event) => {
            try {
              await Promise.all([
                profileInfoQuery.refetch(),
                userShelvesQuery.refetch(),
              ]);
            } catch (error) {
            } finally {
              event.detail.complete();
            }
          }}
        >
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {profileInfoQuery.isLoading || userShelvesQuery.isLoading ? (
          <LoadSpinner
            message={'Getting User Information...'}
            fullScreen={true}
          />
        ) : profileInfoQuery.isSuccess && userShelvesQuery.isSuccess ? (
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
                <hr className={styles.divider}></hr>

                {userShelves.length > 0 && (
                  <div className={styles.userInfo}>
                    <div className={styles.userShelvesInfo}>
                      <strong className={styles.userShelvesQuantity}>
                        {userShelves
                          .filter((item) => item.is_system)
                          .reduce((sum, item) => {
                            return sum + item.quantity;
                          }, 0)}
                      </strong>
                      <span className={styles.userShelvesText}>Books</span>
                    </div>

                    <div className={styles.userReviewsInfo}>
                      <strong className={styles.userReviewsQuantity}>
                        {profileInfoQuery.data.number_reviews}
                      </strong>
                      <span className={styles.userReviewsText}>Reviews</span>
                    </div>
                  </div>
                )}
              </UserCard>

              <IonCard className={styles.card}>
                <IonCardHeader className={styles.shelvesHeader}>
                  <IonCardTitle className={styles.shelvesTitle}>
                    My Shelves
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent className={styles.shelvesContent}>
                  <IonList lines="full" className={styles.shelfList}>
                    {userShelves
                      .filter((shelf) => shelf.is_system)
                      .map((shelf) => {
                        const icon =
                          shelf.name === 'reading'
                            ? book
                            : shelf.name === 'wish'
                            ? bookmark
                            : checkmarkCircle;
                        return (
                          <IonItem
                            button={true}
                            key={shelf.id}
                            detail={true}
                            className={styles.shelfItem}
                            onClick={() => {
                              history.push(`/app/shelf/${shelf.id}`, {
                                information: shelf,
                              });
                            }}
                          >
                            <IonIcon
                              icon={icon}
                              slot="start"
                              className={styles.shelfIcon}
                            ></IonIcon>
                            <IonLabel className={styles.shelfName}>
                              {shelf.name}
                            </IonLabel>
                            <IonBadge slot="end" className={styles.shelfBadge}>
                              {shelf.quantity}
                            </IonBadge>
                          </IonItem>
                        );
                      })}
                  </IonList>

                  {userShelves.some((shelf) => !shelf.is_system) && (
                    <>
                      <hr className={styles.divider}></hr>

                      <IonAccordionGroup className={styles.accordionGroup}>
                        <IonAccordion
                          value="first"
                          className={styles.accordion}
                        >
                          <IonItem
                            slot="header"
                            className={styles.accordionHeader}
                          >
                            <IonLabel className={styles.accordionHeaderLabel}>
                              Custom Shelves
                            </IonLabel>
                          </IonItem>
                          <div
                            slot="content"
                            className={styles.accordionContent}
                          >
                            <IonList className={styles.shelfList}>
                              {userShelves
                                .filter((shelf) => !shelf.is_system)
                                .map((shelf) => {
                                  return (
                                    <IonItem
                                      button={true}
                                      key={shelf.id}
                                      detail={true}
                                      className={styles.shelfItem}
                                      onClick={() => {
                                        history.push(`/app/shelf/${shelf.id}`, {
                                          information: shelf,
                                        });
                                      }}
                                    >
                                      <IonLabel className={styles.shelfName}>
                                        {shelf.name}
                                      </IonLabel>
                                      <IonBadge
                                        slot="end"
                                        className={styles.shelfBadge}
                                      >
                                        {shelf.quantity}
                                      </IonBadge>
                                    </IonItem>
                                  );
                                })}
                            </IonList>
                          </div>
                        </IonAccordion>
                      </IonAccordionGroup>
                    </>
                  )}
                </IonCardContent>
              </IonCard>

              <IonCard className={styles.card}>
                <IonCardContent>
                  <IonItem
                    button={true}
                    detail={true}
                    className={styles.shelfItem}
                    lines="none"
                    onClick={() => {
                      history.push(`/app/reviews`);
                    }}
                  >
                    <IonIcon
                      icon={star}
                      slot="start"
                      className={styles.reviewIcon}
                    ></IonIcon>
                    <IonLabel className={styles.shelfName}>My Reviews</IonLabel>
                    <IonBadge slot="end" className={styles.shelfBadge}>
                      {profileInfoQuery.data.number_reviews}
                    </IonBadge>
                  </IonItem>
                </IonCardContent>
              </IonCard>
            </IonGrid>
          </>
        ) : (
          <ErrorDisplay
            title={`Couldn't Load Profile Information`}
            subtitle="There was a problem loading your profile."
            onRetry={() => {
              profileInfoQuery.refetch();
              userShelvesQuery.refetch();
            }}
          />
        )}
      </IonContent>
    </IonPage>
  );
};

export default Profile;
