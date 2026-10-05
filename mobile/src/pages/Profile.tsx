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
} from '@ionic/react';
import { cog, book, bookmark, checkmarkCircle, star } from 'ionicons/icons';

import styles from './Profile.module.css';

import { useUserLists } from '../queryOptions/useUserLists';

import LoadSpinner from '../components/LoadSpinner';

import UserCard from '../components/UserCard';

import { useQuery } from '@tanstack/react-query';
import fetchUserProfileInfo from '../queryOptions/profilePageQueries';

import useAuthStore from '../store/useAuthStore';

import { useHistory } from 'react-router';

const Profile: React.FC = () => {
  const history = useHistory();
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

              <IonCard className={styles.card}>
                <IonCardHeader className={styles.shelvesHeader}>
                  <IonCardTitle className={styles.shelvesTitle}>
                    My Shelves
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent className={styles.shelvesContent}>
                  <IonList lines="full" className={styles.shelfList}>
                    {userLists
                      .filter((list) => list.is_system)
                      .map((list) => {
                        const icon =
                          list.name === 'reading'
                            ? book
                            : list.name === 'wish'
                            ? bookmark
                            : checkmarkCircle;
                        return (
                          <IonItem
                            button={true}
                            key={list.id}
                            detail={true}
                            className={styles.shelfItem}
                            onClick={() => {
                              history.push(`/app/list/${list.id}`, {
                                information: list,
                              });
                            }}
                          >
                            <IonIcon
                              icon={icon}
                              slot="start"
                              className={styles.shelfIcon}
                            ></IonIcon>
                            <IonLabel className={styles.shelfName}>
                              {list.name}
                            </IonLabel>
                            <IonBadge slot="end" className={styles.shelfBadge}>
                              {list.quantity}
                            </IonBadge>
                          </IonItem>
                        );
                      })}
                  </IonList>

                  {userLists.some((list) => !list.is_system) && (
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
                              Custom Lists
                            </IonLabel>
                          </IonItem>
                          <div
                            slot="content"
                            className={styles.accordionContent}
                          >
                            <IonList className={styles.shelfList}>
                              {userLists
                                .filter((list) => !list.is_system)
                                .map((list) => {
                                  return (
                                    <IonItem
                                      button={true}
                                      key={list.id}
                                      detail={true}
                                      className={styles.shelfItem}
                                      onClick={() => {
                                        history.push(`/app/list/${list.id}`, {
                                          information: list,
                                        });
                                      }}
                                    >
                                      <IonLabel className={styles.shelfName}>
                                        {list.name}
                                      </IonLabel>
                                      <IonBadge
                                        slot="end"
                                        className={styles.shelfBadge}
                                      >
                                        {list.quantity}
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
          <p>Erro</p>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Profile;
