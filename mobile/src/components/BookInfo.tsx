import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonCol,
  IonRow,
  IonGrid,
  IonChip,
} from '@ionic/react';

import { bookInfo, bookCover } from '@shelflogr/shared';

const BookInfo: React.FC<{ bookInfo: bookInfo }> = ({ bookInfo }) => {
  return (
    <IonCard>
      <IonGrid>
        <IonRow>
          <IonCol size="4">
            <img
              alt="Book Cover"
              src={bookInfo.imageLinks.thumbnail}
              style={{ width: '100%', borderRadius: '4px' }}
            />
          </IonCol>

          <IonCol size="8">
            <IonCardHeader className="ion-no-padding">
              <IonCardTitle style={{ fontSize: '1.2rem', lineHeight: '1.2' }}>
                {bookInfo.title}
              </IonCardTitle>
              <IonCardSubtitle style={{ marginTop: '4px' }}>
                {bookInfo.authors?.join(', ')}
              </IonCardSubtitle>
            </IonCardHeader>

            <div
              style={{
                marginTop: '8px',
                fontSize: '0.85rem',
                color: 'var(--ion-color-step-600)',
              }}
            >
              <p>
                <strong>Publisher:</strong> {bookInfo.publisher}
              </p>
              <p>
                <strong>Date:</strong> {bookInfo.publishedDate}
              </p>
            </div>
          </IonCol>
        </IonRow>

        <hr
          style={{
            borderTop: '1px solid black',
            margin: '12px 0px 0 0px',
          }}
        />

        <IonRow>
          <IonCol size="12">
            <IonCardContent
              className="ion-no-padding"
              style={{
                padding: '12px 16px',
                maxHeight: '35vh',
                overflowY: 'auto',
              }}
            >
              <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                Sinopse
              </h3>
              <p style={{ textAlign: 'justify', fontSize: '0.9rem' }}>
                {bookInfo.description}
              </p>

              <div style={{ marginTop: '16px' }}>
                <p style={{ marginBottom: '8px' }}>
                  <strong>Main Category:</strong>
                </p>
                <IonChip color="primary">{bookInfo.mainCategory}</IonChip>

                <p style={{ marginTop: '12px', marginBottom: '8px' }}>
                  <strong>Secondary Categories:</strong>
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {bookInfo.categories.map((category, index) => {
                    return (
                      <IonChip
                        key={index}
                        color="secondary"
                        style={{ margin: '0px' }}
                      >
                        {category}
                      </IonChip>
                    );
                  })}
                </div>
              </div>

              <div
                style={{
                  marginTop: 'auto',
                  fontSize: '0.8rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--ion-color-step-100)',
                  paddingTop: '8px',
                }}
              >
                <span>
                  <strong>Pages:</strong> {bookInfo.pageCount}
                </span>
                <span>
                  <strong>Language:</strong> {bookInfo.language?.toUpperCase()}
                </span>
              </div>
            </IonCardContent>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonCard>
  );
};

export default BookInfo;
