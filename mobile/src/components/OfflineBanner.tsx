import React from 'react';
import { IonIcon } from '@ionic/react';
import { cloudOfflineOutline } from 'ionicons/icons';
import useNetworkStore from '../store/useNetworkStore';
import styles from './OfflineBanner.module.css';

const OfflineBanner: React.FC = () => {
  const isOnline = useNetworkStore((state) => state.online);

  if (isOnline) return null;

  return (
    <div className={styles.banner}>
      <IonIcon icon={cloudOfflineOutline} className={styles.icon} />
      <span className={styles.text}>No internet connection</span>
    </div>
  );
};

export default OfflineBanner;
