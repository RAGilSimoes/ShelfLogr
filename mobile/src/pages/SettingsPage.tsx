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
  IonToast,
  IonModal,
  IonButton,
  IonFooter,
  IonText,
} from '@ionic/react';

import UserCard from '../components/UserCard';

import styles from './SettingsPage.module.css';

import useAuthStore from '../store/useAuthStore';

import { useQueryClient } from '@tanstack/react-query';

import { useHistory } from 'react-router';

import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import fetchUserProfileInfo from '../queryOptions/profilePageQueries';

import api from '../services/api.service';

import {
  closeCircleOutline,
  informationCircleOutline,
  libraryOutline,
  lockClosedOutline,
  logOutOutline,
  mailOutline,
  personOutline,
  trashBinOutline,
  alertCircleOutline,
  chatbubbleEllipsesOutline,
  constructOutline,
} from 'ionicons/icons';
import LoadSpinner from '../components/LoadSpinner';

import EditProfileForm from '../components/EditProfileForm';
import EditShelvesForm from '../components/EditShelvesForm';
import ChangePasswordForm from '../components/ChangePasswordForm';
import SupportPage from '../components/SupportPage';

const Settings: React.FC = () => {
  const queryClient = useQueryClient();
  const history = useHistory();

  const userID = useAuthStore((state) => state.userID);

  const [isLogOutAlertOpen, setIsLogOutAlertOpen] = useState<boolean>(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState<boolean>(false);

  const [toastMessage, setToastMessage] = useState<string>('');
  const [displayErrorToast, setDisplayErrorToast] = useState<boolean>(false);
  const [displaySuccessToast, setDisplaySuccessToast] =
    useState<boolean>(false);

  const [isSpinnerDeleteOpen, setIsSpinnerDeleteOpen] =
    useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const modalAvailableTypes = {
    default: 'default',
    profile: 'profile',
    password: 'password',
    shelves: 'shelves',
    support: 'support',
  };

  const modalAvailableTitles: Record<string, string> = {
    default: '',
    profile: 'Edit Profile Info',
    password: 'Change Password',
    shelves: 'Edit Shelves Info',
    support: 'Support & Feedback',
  };

  const [modalType, setModalType] = useState<string>(
    modalAvailableTypes.default,
  );

  const clearCache = () => {
    queryClient.clear();
    setToastMessage('Cache cleared successfully.');
    setDisplaySuccessToast(true);
  };

  const logOut = async () => {
    useAuthStore.getState().removeInformation();
    queryClient.clear();
    history.replace('/login', {
      message: 'Logged out of the app.',
    });
  };

  const deleteAccount = async () => {
    setIsSpinnerDeleteOpen(true);
    try {
      const response = await api.delete('/user/delete-account');

      if (response.status === 200) {
        useAuthStore.getState().removeInformation();
        queryClient.clear();
        history.replace('/login', {
          message: response.data.message,
        });
      }
    } catch (error) {
      setDisplayErrorToast(true);
      setToastMessage('Error deleting account');
    } finally {
      setIsSpinnerDeleteOpen(false);
    }
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
        <IonToast
          trigger="open-toast"
          message={toastMessage}
          duration={2500}
          isOpen={displayErrorToast || displaySuccessToast}
          onDidDismiss={() => {
            displayErrorToast
              ? setDisplayErrorToast(false)
              : setDisplaySuccessToast(false);
            setToastMessage('');
          }}
          className={`${styles.customToast} ${
            displayErrorToast ? styles.errorToast : styles.successToast
          }`}
          position="top"
        ></IonToast>

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

        {isSpinnerDeleteOpen ? (
          <LoadSpinner message={'Deleting your account...'} fullScreen={true} />
        ) : profileInfoQuery.isFetching ? (
          <LoadSpinner message={'Getting settings page...'} fullScreen={true} />
        ) : profileInfoQuery.isSuccess && profileInfoQuery.data ? (
          <IonGrid>
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
                  <IonItem
                    detail={true}
                    button={true}
                    onClick={() => {
                      setIsModalOpen(true);
                      setModalType(modalAvailableTypes.profile);
                    }}
                  >
                    <IonIcon icon={personOutline} slot="start"></IonIcon>
                    Edit Profile Info
                  </IonItem>
                  <IonItem
                    detail={true}
                    button={true}
                    onClick={() => {
                      setIsModalOpen(true);
                      setModalType(modalAvailableTypes.password);
                    }}
                  >
                    <IonIcon icon={lockClosedOutline} slot="start"></IonIcon>
                    Change Password
                  </IonItem>
                  <IonItem
                    detail={true}
                    button={true}
                    onClick={() => {
                      setIsModalOpen(true);
                      setModalType(modalAvailableTypes.shelves);
                    }}
                  >
                    <IonIcon icon={libraryOutline} slot="start"></IonIcon>
                    Edit Shelves Info
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
                  <IonItem
                    detail={true}
                    button={true}
                    onClick={() => clearCache()}
                  >
                    <IonIcon icon={trashBinOutline} slot="start"></IonIcon>
                    Clear Cache
                  </IonItem>
                  <IonItem
                    detail={true}
                    button={true}
                    onClick={() => {
                      setIsModalOpen(true);
                      setModalType(modalAvailableTypes.support);
                    }}
                  >
                    <IonIcon
                      icon={chatbubbleEllipsesOutline}
                      slot="start"
                    ></IonIcon>
                    Support & Feedback
                  </IonItem>
                  <IonItem
                    detail={true}
                    button={true}
                    onClick={() => {
                      history.push('/app/contribute-book');
                    }}
                  >
                    <IonIcon icon={constructOutline} slot="start"></IonIcon>
                    Contribute
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
                    <IonLabel className={styles.dangerLabel}>Log Out</IonLabel>
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

            <div className={`ion-text-center ${styles.footer}`}>
              <IonText color="medium">v0.0.1</IonText>
              {' - '}
              <IonText color="medium">
                Developed by{' '}
                <a
                  href="https://www.linkedin.com/in/ricardo-andré-simões-0716b4280"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Ricardo André Simões
                </a>
              </IonText>
            </div>
          </IonGrid>
        ) : (
          <div className={styles.emptyContainer}>
            <IonIcon icon={alertCircleOutline} className={styles.errorIcon} />
            <h3 className={styles.emptyTitle}>Couldn't Load Settings Page</h3>
            <p className={styles.emptySubtitle}>
              There was a problem connecting to the server. Please check your
              connection and try again.
            </p>
            <IonButton
              fill="outline"
              shape="round"
              className={styles.retryBtn}
              onClick={() => profileInfoQuery.refetch()}
            >
              Try Again
            </IonButton>
          </div>
        )}
      </IonContent>

      <IonModal
        isOpen={isModalOpen}
        onDidDismiss={() => {
          setIsModalOpen(false);
          setModalType(modalAvailableTypes.default);
        }}
        breakpoints={
          modalType === modalAvailableTypes.shelves ||
          modalType === modalAvailableTypes.password
            ? [0, 0.55, 0.85, 1]
            : modalType === modalAvailableTypes.profile
            ? [0, 0.68]
            : [0, 0.55, 1]
        }
        initialBreakpoint={
          modalType === modalAvailableTypes.shelves
            ? 0.85
            : modalType === modalAvailableTypes.password ||
              modalType === modalAvailableTypes.profile
            ? 0.68
            : modalType === modalAvailableTypes.support
            ? 1
            : 0.55
        }
        handle={true}
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle>{modalAvailableTitles[modalType]}</IonTitle>
            <IonButtons slot="start">
              <IonButton
                onClick={() => {
                  setIsModalOpen(false);
                  setModalType(modalAvailableTypes.default);
                }}
              >
                Close
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          {modalType === modalAvailableTypes.profile ? (
            <EditProfileForm
              onClose={() => setIsModalOpen(false)}
              profile={{
                name: profileInfoQuery.data?.name ?? '',
                email: profileInfoQuery.data?.email ?? '',
              }}
              onSuccess={(message: string) => {
                setDisplaySuccessToast(true);
                setToastMessage(message);
                setIsModalOpen(false);
              }}
            />
          ) : modalType === modalAvailableTypes.password ? (
            <ChangePasswordForm
              onClose={() => setIsModalOpen(false)}
              onSuccess={(message: string) => {
                setDisplaySuccessToast(true);
                setToastMessage(message);
                setIsModalOpen(false);
              }}
            />
          ) : modalType === modalAvailableTypes.shelves ? (
            <EditShelvesForm
              onClose={() => setIsModalOpen(false)}
              onSuccess={(message: string) => {
                setDisplaySuccessToast(true);
                setToastMessage(message);
                setIsModalOpen(false);
              }}
            />
          ) : modalType === modalAvailableTypes.support ? (
            <SupportPage
              onClose={() => setIsModalOpen(false)}
              onSuccess={(message: string) => {
                setDisplaySuccessToast(true);
                setToastMessage(message);
                setIsModalOpen(false);
              }}
            />
          ) : null}
        </IonContent>
      </IonModal>
    </IonPage>
  );
};

export default Settings;
