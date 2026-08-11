import { IonSpinner } from '@ionic/react';

const LoadSpinner: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: 'var(--ion-background-color)',
      }}
    >
      <IonSpinner name="lines" color="primary" />
    </div>
  );
};

export default LoadSpinner;
