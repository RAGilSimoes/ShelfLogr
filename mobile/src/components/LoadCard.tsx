import {
  IonCard,
  IonGrid,
  IonRow,
  IonCol,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonChip,
  IonSkeletonText,
} from '@ionic/react';

import styles from './LoadCard.module.css';

const LoadCard: React.FC = () => {
  return (
    <IonCard className={styles.card}>
      <IonGrid className={styles.grid}>
        <IonRow>
          <IonCol size="4">
            <IonSkeletonText
              animated={true}
              className={styles.bookCover}
            ></IonSkeletonText>
          </IonCol>

          <IonCol size="8">
            <IonCardHeader className="ion-no-padding">
              <IonCardTitle className={styles.title}>
                <IonSkeletonText animated={true}></IonSkeletonText>
              </IonCardTitle>
              <IonCardSubtitle className={styles.authors}>
                <IonSkeletonText animated={true}></IonSkeletonText>
              </IonCardSubtitle>
            </IonCardHeader>

            <div className={styles.metadataInfo}>
              <p>
                <strong>Publisher:</strong>{' '}
                <IonSkeletonText animated={true}></IonSkeletonText>
              </p>
            </div>
            <>
              <p className={styles.mainCategory}>
                <strong>Main Category:</strong>
              </p>
              <IonChip color="primary" className={styles.chip}>
                <IonSkeletonText animated={true}></IonSkeletonText>
              </IonChip>
            </>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonCard>
  );
};

export default LoadCard;
