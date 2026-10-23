import { IonCard, IonCardContent, IonAvatar } from '@ionic/react';

import styles from './UserCard.module.css';

const UserCard: React.FC<{
  children?: React.ReactNode;
  userInfo: {
    name: string;
    email?: string;
    updated_at?: Date;
    created_at: string;
  };
  datePrefix?: string;
}> = ({ children, userInfo, datePrefix = 'Member Since: ' }) => {
  if (userInfo) {
    return (
      <IonCard className={styles.card}>
        <IonCardContent>
          <div className={styles.profileInfo}>
            <div className={styles.importantInfo}>
              <IonAvatar className={styles.avatar}>
                <span>{userInfo.name.split(' ').map((word) => word[0])}</span>
              </IonAvatar>
              <div className={styles.userText}>
                <h2 className={styles.username}>{userInfo.name}</h2>
                <span className={styles.memberSince}>
                  {datePrefix} {userInfo.created_at}
                </span>
              </div>
            </div>
            {children}
          </div>
        </IonCardContent>
      </IonCard>
    );
  }
};

export default UserCard;
