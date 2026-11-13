import {
  IonButton,
  IonContent,
  IonPage,
  IonGrid,
  useIonViewWillLeave,
  IonIcon,
  IonAlert,
  IonFooter,
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

import { barcodeOutline, keypadOutline } from 'ionicons/icons';

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

  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [isScanAlertOpen, setIsScanAlertOpen] = useState<boolean>(false);
  const [isInsertAlertOpen, setIsInsertAlertOpen] = useState<boolean>(false);

  const ISBNPlaceholder: string = '000-000-0-00000-0';

  const [tempIsbn, setTempIsbn] = useState<string>('');
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
    setTempIsbn('');

    let cameraPermission = await checkPermissions();

    if (cameraPermission !== 'granted') {
      cameraPermission = await requestPermissions();
    }

    if (cameraPermission === 'granted') {
      try {
        const barcodes = await scan();

        if (barcodes.length > 0 && barcodes[0].valueType === 'ISBN') {
          const isbn = barcodes[0].displayValue;

          setTempIsbn(isbn);

          setIsScanAlertOpen(true);
        } else {
          setToastMessage("Barcode doesn't match a book");
          setToastType(availableToastTypes.error);

          setDisplayToast(true);
        }
      } catch (error) {
        if (error instanceof Error) {
          setToastMessage(
            error.message.charAt(0).toUpperCase() + error.message.slice(1),
          );
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
      requiredShelf: { name: string; id: string };
      reviewData: {
        rating: number;
        display: string;
        liked: boolean;
        review: string | null;
      } | null;
      optionalShelves: Array<{ name: string; id: string }> | null;
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
    requiredShelf: { name: string; id: string },
    formattedShelfNames: Array<string>,
    reviewData: {
      rating: number;
      display: string;
      liked: boolean;
      review: string | null;
    } | null,
    optionalShelves: Array<{ name: string; id: string }> | null,
  ) => {
    setFormattedShelfNames(formattedShelfNames);
    addBookToShelf.mutate({
      book: bookInfoQuery.data.book,
      requiredShelf,
      reviewData,
      optionalShelves,
    });
  };

  const handleCancel = () => {
    queryClient.removeQueries({
      queryKey: ['bookInfoISBN', userID, finalIsbn],
    });
    addBookToShelf.reset();
    setFinalIsbn('');
    setTempIsbn('');
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

  const hasBook = Boolean(bookInfoQuery.isSuccess && bookInfoQuery.data?.book);

  const handleEdit = async () => {
    setIsEditing((prev) => !prev);
  };

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
          isOpen={isScanAlertOpen || isInsertAlertOpen}
          header={
            isScanAlertOpen
              ? 'ISBN Detected'
              : isInsertAlertOpen
              ? 'Insert ISBN'
              : ''
          }
          message={
            isScanAlertOpen
              ? 'Confirm that the displayed ISBN matches your book'
              : isInsertAlertOpen
              ? 'Insert the ISBN near the barcode of your book'
              : ''
          }
          cssClass="custom-isbn-alert"
          inputs={
            isScanAlertOpen || isInsertAlertOpen
              ? [
                  {
                    type: 'text',
                    name: 'isbnField',
                    value: `${tempIsbn}`,
                    placeholder: `${ISBNPlaceholder}`,
                    cssClass: 'alert-isbn-input',
                    attributes: {
                      minLength: 13,
                      maxlength: 13,
                      pattern: '[0-9]*',
                      inputMode: 'numeric',
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
                  const isNumber = !isNaN(Number(selectedIsbn));
                  if (isNumber) {
                    setIsScanAlertOpen(false);
                    if (selectedIsbn === finalIsbn) bookInfoQuery.refetch();
                    else setFinalIsbn(selectedIsbn);
                  } else {
                    setDisplayToast(true);
                    setToastMessage('ISBN must contain only numbers');
                    setToastType(availableToastTypes.error);
                    return false;
                  }
                }
              },
            },
          ]}
          onDidDismiss={() => {
            setIsScanAlertOpen(false);
            setIsInsertAlertOpen(false);
          }}
          className={styles.alert}
        ></IonAlert>

        {bookInfoQuery.isLoading || addBookToShelf.isPending ? (
          <LoadSpinner
            message={
              bookInfoQuery.isLoading
                ? 'Getting Book Info...'
                : addBookToShelf.isPending
                ? `Adding Book To \n\n ${formattedShelfNames
                    .map((item) => '• ' + item)
                    .join('\n')} \n\n ...`
                : ''
            }
            fullScreen={true}
          />
        ) : !hasBook ? (
          <div className={styles.emptyState}>
            <IonButton
              expand="block"
              shape="round"
              size="large"
              fill="solid"
              color="primary"
              onClick={readBarcode}
            >
              <IonIcon slot="start" icon={barcodeOutline}></IonIcon>
              Scan Barcode
            </IonButton>
            <IonButton
              expand="block"
              shape="round"
              size="large"
              fill="solid"
              color="primary"
              onClick={() => setIsInsertAlertOpen(true)}
            >
              <IonIcon slot="start" icon={keypadOutline}></IonIcon>
              Insert ISBN
            </IonButton>
          </div>
        ) : (
          <div className={styles.bookContainer}>
            <BookInfo bookInfo={bookInfoQuery.data.book} detailed={false} />

            {!isEditing && (showAlreadyHasBook || addBookToShelf.isSuccess) ? (
              <StatusFeedback
                shelf={
                  addBookToShelf.isSuccess
                    ? formattedShelfNames
                    : bookInfoQuery.data.bookShelves &&
                      bookInfoQuery.data.bookShelves.length > 0
                    ? bookInfoQuery.data.bookShelves
                    : [bookInfoQuery.data.shelf]
                }
                onEditShelf={() => handleEdit()}
              />
            ) : (
              <AddButtons
                onAddBook={handleBookAdd}
                defaultValues={
                  bookInfoQuery.data.shelf
                    ? {
                        initialRequiredShelf: bookInfoQuery.data.shelf,
                        initialOptionalShelves:
                          bookInfoQuery.data.bookShelves || [],
                      }
                    : undefined
                }
                onCancel={isEditing ? () => setIsEditing(false) : handleCancel}
              />
            )}
          </div>
        )}
      </IonContent>

      {hasBook && (
        <IonFooter className={styles.footer}>
          <div className={styles.footerRow}>
            <IonButton
              expand="block"
              shape="round"
              size="default"
              fill="outline"
              color="medium"
              onClick={readBarcode}
              className={styles.footerButton}
            >
              <IonIcon slot="start" icon={barcodeOutline}></IonIcon>
              Scan Barcode
            </IonButton>
            <IonButton
              expand="block"
              shape="round"
              size="default"
              fill="outline"
              color="medium"
              onClick={() => setIsInsertAlertOpen(true)}
              className={styles.footerButton}
            >
              <IonIcon slot="start" icon={keypadOutline}></IonIcon>
              Insert ISBN
            </IonButton>
          </div>
        </IonFooter>
      )}
    </IonPage>
  );
};

export default Add;
