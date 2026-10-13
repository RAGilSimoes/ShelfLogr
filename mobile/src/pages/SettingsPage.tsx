import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonGrid,
  IonLabel,
  IonAlert,
  IonList,
  IonItem,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
} from '@ionic/react';

import UserCard from '../components/UserCard';

import styles from './SettingsPage.module.css';

import useAuthStore from '../store/useAuthStore';

import { useQueryClient } from '@tanstack/react-query';

import { useHistory } from 'react-router';

import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import fetchUserProfileInfo from '../queryOptions/profilePageQueries';

import {
  closeCircleOutline,
  informationCircleOutline,
  libraryOutline,
  lockClosedOutline,
  logOutOutline,
  mailOutline,
  personOutline,
  trashBinOutline,
} from 'ionicons/icons';

const Settings: React.FC = () => {
  const queryClient = useQueryClient();
  const history = useHistory();

  const userID = useAuthStore((state) => state.userID);

  const [isLogOutAlertOpen, setIsLogOutAlertOpen] = useState<boolean>(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState<boolean>(false);

  const logOut = async () => {
    useAuthStore.getState().removeInformation();
    queryClient.clear();
    history.replace('/login', {
      message: 'Logged out of the app.',
    });
  };

  const deleteAccount = async () => {
    useAuthStore.getState().removeInformation();
    queryClient.clear();
    history.replace('/login', {
      message: 'Account deleted.',
    });
  };

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
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/profile"></IonBackButton>
          </IonButtons>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonAlert
          isOpen={isLogOutAlertOpen || isDeleteAlertOpen}
          header={'Confirm Action'}
          message={
            isLogOutAlertOpen
              ? `Are you sure you want to Log Out?`
              : `Are you sure you want to DELETE your account?`
          }
          cssClass="custom-danger-alert"
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'alert-cancel-button',
            },
            {
              text: isLogOutAlertOpen ? 'Log Out' : 'DELETE',
              role: 'confirm',
              cssClass: 'alert-danger-confirm-button',
              handler: () => {
                isLogOutAlertOpen ? logOut() : deleteAccount();
              },
            },
          ]}
          onDidDismiss={() => {
            isLogOutAlertOpen
              ? setIsLogOutAlertOpen(false)
              : setIsDeleteAlertOpen(false);
          }}
          className={styles.alert}
        ></IonAlert>

        <IonGrid>
          {profileInfoQuery.isSuccess && profileInfoQuery.data ? (
            <>
              <UserCard userInfo={profileInfoQuery.data}>
                <span className={styles.emailContainer}>
                  <IonIcon icon={mailOutline}></IonIcon>
                  {profileInfoQuery.data.email}
                </span>
              </UserCard>

              <IonCard className={styles.card}>
                <IonCardHeader className={styles.accountHeader}>
                  <IonCardTitle className={styles.accountTitle}>
                    Account
                  </IonCardTitle>
                </IonCardHeader>

                <IonCardContent className={styles.accountContent}>
                  <IonList lines="full" className={styles.accountList}>
                    <IonItem detail={true} button={true}>
                      <IonIcon icon={personOutline} slot="start"></IonIcon>Edit
                      Profile Info
                    </IonItem>
                    <IonItem detail={true} button={true}>
                      <IonIcon icon={lockClosedOutline} slot="start"></IonIcon>
                      Change Password
                    </IonItem>
                    <IonItem detail={true} button={true}>
                      <IonIcon icon={libraryOutline} slot="start"></IonIcon>Edit
                      Shelves Info
                    </IonItem>
                  </IonList>
                </IonCardContent>
              </IonCard>

              <IonCard className={styles.card}>
                <IonCardHeader className={styles.generalHeader}>
                  <IonCardTitle className={styles.generalTitle}>
                    General
                  </IonCardTitle>
                </IonCardHeader>

                <IonCardContent className={styles.generalContent}>
                  <IonList lines="full" className={styles.generalList}>
                    <IonItem detail={true} button={true}>
                      <IonIcon icon={trashBinOutline} slot="start"></IonIcon>
                      Clear Cache
                    </IonItem>
                    <IonItem detail={true} button={true}>
                      <IonIcon
                        icon={informationCircleOutline}
                        slot="start"
                      ></IonIcon>
                      APP Info
                    </IonItem>
                  </IonList>
                </IonCardContent>
              </IonCard>

              <IonCard className={styles.cardDanger}>
                <IonCardHeader className={styles.dangerHeader}>
                  <IonCardTitle className={styles.dangerTitle}>
                    <strong>Danger Zone</strong>
                  </IonCardTitle>
                </IonCardHeader>

                <IonCardContent className={styles.dangerContent}>
                  <IonList lines="full" className={styles.dangerList}>
                    <IonItem
                      detail={true}
                      button={true}
                      className={styles.dangerItem}
                      onClick={() => setIsLogOutAlertOpen(true)}
                    >
                      <IonIcon
                        icon={logOutOutline}
                        slot="start"
                        className={styles.dangerIcon}
                      ></IonIcon>
                      <IonLabel className={styles.dangerLabel}>
                        Log Out
                      </IonLabel>
                    </IonItem>
                    <IonItem
                      detail={true}
                      button={true}
                      className={styles.dangerItem}
                      onClick={() => setIsDeleteAlertOpen(true)}
                    >
                      <IonIcon
                        icon={closeCircleOutline}
                        slot="start"
                        className={styles.dangerIcon}
                      ></IonIcon>
                      <IonLabel className={styles.dangerLabel}>
                        Delete Account
                      </IonLabel>
                    </IonItem>
                  </IonList>
                </IonCardContent>
              </IonCard>
            </>
          ) : (
            <p>Ola</p>
          )}
          <IonCard></IonCard>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
