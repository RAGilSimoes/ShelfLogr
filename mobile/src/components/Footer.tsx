import { IonText, IonFooter, IonToolbar } from '@ionic/react';

import styles from './Footer.module.css';

import {
  APP_VERSION,
  FOOTER_LINK,
  DEVELOPER_NAME,
} from '../constants/app.constant';

const Footer: React.FC<{ realFooter: boolean }> = ({ realFooter }) => {
  const footerContent = (
    <div className={`ion-text-center ${styles.footer}`}>
      <IonText color="medium">{APP_VERSION}</IonText>
      {' - '}
      <IonText color="medium">
        Developed by{' '}
        <a href={FOOTER_LINK} rel="noopener noreferrer" target="_blank">
          {DEVELOPER_NAME}
        </a>
      </IonText>
    </div>
  );

  if (realFooter) {
    return (
      <IonFooter className="ion-no-border" translucent={true} collapse="fade">
        <IonToolbar>{footerContent}</IonToolbar>
      </IonFooter>
    );
  } else {
    return footerContent;
  }
};

export default Footer;
