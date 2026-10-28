import {
  IonButton,
  IonContent,
  IonPage,
  IonGrid,
  useIonViewWillLeave,
  IonIcon,
  IonAlert,
} from '@ionic/react';

import {
  BarcodeScanner,
  BarcodeFormat,
} from '@capacitor-mlkit/barcode-scanning';

import { useState } from 'react';

import styles from './Add.module.css';

import api from '../services/api.service';

import Toast from '../components/Toast';

import LoadSpinner from '../components/LoadSpinner';
import BookInfo from '../components/BookInfo';
import StatusFeedback from '../components/StatusFeedback';

import { barcodeOutline } from 'ionicons/icons';

import { bookInfo } from '@shelflogr/shared';

import DOMPurify from 'dompurify';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import fetchBookInfo from '../queryOptions/addQueries';
import useAuthStore from '../store/useAuthStore';
import AddButtons from '../components/AddButtons';

import getQueryKeys from '../queryOptions/queryKeys';

const Add: React.FC = () => {
  const [toastMessage, setToastMessage] = useState<string>('');
  const [displayToast, setDisplayToast] = useState<boolean>(false);
  const [toastType, setToastType] = useState<string>('');

  const availableToastTypes = {
    success: 'success',
    error: 'error',
  };

  const [isScanAlertOpen, setIsScanAlertOpen] = useState<boolean>(false);

  const [tempIsbn, setTempIsbn] = useState<number>(0);
  const [finalIsbn, setFinalIsbn] = useState<string>('');

  const queryClient = useQueryClient();

  const userID = useAuthStore((state) => state.userID);

  const [formattedShelfNames, setFormattedShelfNames] = useState<string[]>([]);

  useIonViewWillLeave(() => {
    setToastMessage('');
    setDisplayToast(false);
    setIsScanAlertOpen(false);

    queryClient.removeQueries({
      queryKey: ['bookInfoISBN', userID, finalIsbn],
    });
    addBookToShelf.reset();

    setFinalIsbn('');
  });

  const checkPermissions = async () => {
    const { camera } = await BarcodeScanner.checkPermissions();
    return camera;
  };

  const requestPermissions = async () => {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera;
  };

  const scan = async () => {
    const { barcodes } = await BarcodeScanner.scan({
      formats: [BarcodeFormat.Ean13],
      autoZoom: true,
    });
    return barcodes;
  };

  const readBarcode = async () => {
    setToastMessage('');
    setDisplayToast(false);
    setTempIsbn(0);

    let cameraPermission = await checkPermissions();

    if (cameraPermission !== 'granted') {
      cameraPermission = await requestPermissions();
    }

    if (cameraPermission === 'granted') {
      try {
        const barcodes = await scan();

        if (barcodes.length > 0 && barcodes[0].valueType === 'ISBN') {
          const isbn = barcodes[0].displayValue;

          setTempIsbn(Number(isbn));

          setIsScanAlertOpen(true);
        } else {
          setToastMessage("Barcode doesn't match a book");
          setToastType(availableToastTypes.error);

          setDisplayToast(true);
        }
      } catch (error) {
        if (error instanceof Error) {
          setToastMessage(error.message);
        } else {
          setToastMessage('Error scanning barcode');
        }
        setDisplayToast(true);
        setToastType(availableToastTypes.error);
      } finally {
        BarcodeScanner.stopScan();
      }
    } else {
      setToastMessage('Camera permission is required to scan barcodes.');
      setDisplayToast(true);
      setToastType(availableToastTypes.error);
    }
  };

  const bookInfoQuery = useQuery({
    queryKey: ['bookInfoISBN', userID, finalIsbn],
    queryFn: () => fetchBookInfo(finalIsbn),
    enabled: finalIsbn !== '',
    select(data) {
      if (
        data.result &&
        data.result.book.description &&
        data.result.book.description.length !== 0
      ) {
        data.result.book.description = DOMPurify.sanitize(
          data.result.book.description,
        );
      }

      return data.result;
    },
  });

  const addBookToShelf = useMutation({
    mutationFn: (content: {
      book: bookInfo;
      requiredShelf: string;
      reviewData: {
        rating: number;
        display: string;
        liked: boolean;
        review: string | null;
      } | null;
      optionalShelves: Array<string> | null;
    }) => {
      return api.post('/user/add-book', content);
    },
    onSuccess: () => {
      const queryKeys = getQueryKeys(userID);
      queryKeys.forEach((queryKey) => {
        queryClient.invalidateQueries({
          queryKey,
        });
      });

      useAuthStore.getState().removeActiveBookRecommendationID();
    },
  });

  const handleBookAdd = (
    requiredShelf: string,
    formattedShelfNames: Array<string>,
    reviewData: {
      rating: number;
      display: string;
      liked: boolean;
      review: string | null;
    } | null,
    optionalShelves: Array<string> | null,
  ) => {
    setFormattedShelfNames(formattedShelfNames);
    addBookToShelf.mutate({
      book: bookInfoQuery.data.book,
      requiredShelf,
      reviewData,
      optionalShelves,
    });
  };

  const showAddToShelvesButton =
    bookInfoQuery.isSuccess &&
    bookInfoQuery.data.book &&
    bookInfoQuery.data.shelf === null &&
    addBookToShelf.isIdle;

  const showAlreadyHasBook =
    bookInfoQuery.isSuccess &&
    bookInfoQuery.data.book &&
    bookInfoQuery.data.shelf !== null;

  const successMessage =
    bookInfoQuery.isSuccess && bookInfoQuery.data.shelf
      ? 'You already added this book!'
      : addBookToShelf.isSuccess
      ? addBookToShelf.data.data.message
      : '';

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <Toast
          message={
            addBookToShelf.isError
              ? addBookToShelf.error?.message
              : bookInfoQuery.isError
              ? bookInfoQuery.error.message
              : toastMessage
          }
          onDismiss={() => setDisplayToast(false)}
          type={toastType}
          open={addBookToShelf.isError || bookInfoQuery.isError || displayToast}
        />

        <IonAlert
          isOpen={isScanAlertOpen}
          header={'ISBN Detected'}
          message={'Confirm that the displayed ISBN matches your book'}
          cssClass="custom-isbn-alert"
          inputs={
            isScanAlertOpen
              ? [
                  {
                    type: 'number',
                    name: 'isbnField',
                    value: `${tempIsbn}`,
                    placeholder: `${tempIsbn}`,
                    cssClass: 'alert-isbn-input',
                    attributes: {
                      minLength: 13,
                      maxlength: 13,
                    },
                  },
                ]
              : []
          }
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'alert-cancel-button',
            },
            {
              text: 'Get Info',
              role: 'confirm',
              cssClass: 'alert-confirm-button',
              handler: (alertData) => {
                const selectedIsbn = String(
                  alertData.isbnField || tempIsbn,
                ).trim();
                if (selectedIsbn) {
                  setIsScanAlertOpen(false);
                  if (selectedIsbn === finalIsbn) bookInfoQuery.refetch();
                  else setFinalIsbn(selectedIsbn);
                }
              },
            },
          ]}
          onDidDismiss={() => {
            setIsScanAlertOpen(false);
          }}
          className={styles.alert}
        ></IonAlert>

        {bookInfoQuery.isFetching || addBookToShelf.isPending ? (
          <LoadSpinner
            message={
              bookInfoQuery.isFetching
                ? 'Getting Book Info...'
                : addBookToShelf.isPending
                ? `Adding Book To \n\n ${formattedShelfNames
                    .map((item) => '• ' + item)
                    .join('\n')} \n\n ...`
                : ''
            }
            fullScreen={true}
          />
        ) : (
          <>
            <IonGrid
              className={`${styles.grid} ${
                bookInfoQuery.isSuccess && bookInfoQuery.data.book === undefined
                  ? styles.centerContent
                  : ''
              }`}
            >
              {bookInfoQuery.isSuccess && bookInfoQuery.data.book && (
                <BookInfo bookInfo={bookInfoQuery.data.book} detailed={false} />
              )}
              {(showAddToShelvesButton && (
                <>
                  <AddButtons onAddBook={handleBookAdd} />
                </>
              )) ||
                ((showAlreadyHasBook || addBookToShelf.isSuccess) && (
                  <StatusFeedback
                    successMessage={successMessage}
                    shelf={
                      addBookToShelf.isSuccess
                        ? formattedShelfNames
                        : bookInfoQuery.data.bookShelves &&
                          bookInfoQuery.data.bookShelves.length > 0
                        ? bookInfoQuery.data.bookShelves
                        : [bookInfoQuery.data.shelf]
                    }
                  />
                ))}
              <IonButton
                expand="block"
                shape="round"
                size={showAddToShelvesButton === true ? 'default' : 'large'}
                fill={showAddToShelvesButton === true ? 'outline' : 'solid'}
                color={showAddToShelvesButton === true ? 'medium' : 'primary'}
                onClick={readBarcode}
                className="ion-margin-top"
              >
                <IonIcon slot="start" icon={barcodeOutline}></IonIcon>
                Scan Barcode
              </IonButton>
            </IonGrid>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Add;
