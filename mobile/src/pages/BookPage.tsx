import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
} from '@ionic/react';

import LoadSpinner from '../components/LoadSpinner';
import AddButtons from '../components/AddButtons';
import StatusFeedback from '../components/StatusFeedback';
import BookInfo from '../components/BookInfo';
import { bookInfo } from '@shelflogr/shared';

import { useLocation } from 'react-router';

import { useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '../services/api.service';
import useAuthStore from '../store/useAuthStore';
import { useRef } from 'react';

import getQueryKeys from '../queryOptions/queryKeys';

const BookPage: React.FC = () => {
  const location = useLocation<{
    information: {
      book: bookInfo;
      bookShelves: Array<{ name: string; id: string }>;
      category?: string;
      shelf?: { name: string; id: string };
    };
  }>();

  const userID = useAuthStore().userID;

  const queryClient = useQueryClient();

  const bookInformation = useRef(location.state?.information);

  const [formattedShelfNames, setFormattedShelfNames] = useState<string[]>([]);

  const [isEditing, setIsEditing] = useState<boolean>(false);

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

      setIsEditing(false);

      useAuthStore.getState().removeActiveBookRecommendationID();
    },
  });

  const handleEdit = async () => {
    setIsEditing((prev) => !prev);
  };

  if (bookInformation.current || addBookToShelf.isSuccess) {
    const bookInfo =
      bookInformation.current?.book || addBookToShelf.variables?.book;

    const bookShelves = bookInformation.current?.bookShelves;

    const handleBookAdd = (
      requiredShelf: { name: string; id: string },
      formattedShelfNames: Array<string>,
      reviewData: {
        rating: number;
        display: string;
        liked: boolean;
        review: string | null;
      } | null,
      optionalShelves: Array<{ name: string; id: string }>,
    ) => {
      setFormattedShelfNames(formattedShelfNames);

      if (bookInformation.current) {
        bookInformation.current.shelf = requiredShelf;
        bookInformation.current.bookShelves = [
          requiredShelf,
          ...optionalShelves,
        ];
      }

      addBookToShelf.mutate({
        book: bookInfo,
        requiredShelf,
        reviewData,
        optionalShelves,
      });
    };

    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton></IonBackButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          {addBookToShelf.isPending ? (
            <LoadSpinner
              message={`Adding Book To \n\n ${formattedShelfNames.join(
                '  •  ',
              )}`}
              fullScreen={true}
            />
          ) : (
            <>
              <BookInfo bookInfo={bookInfo} detailed={true} />
              {!isEditing &&
              (bookInformation.current?.shelf || addBookToShelf.isSuccess) ? (
                <StatusFeedback
                  shelf={
                    addBookToShelf.isSuccess
                      ? formattedShelfNames
                      : bookShelves && bookShelves.length > 0
                      ? bookShelves
                      : [bookInformation.current.shelf!]
                  }
                  onEditShelf={() => handleEdit()}
                />
              ) : (
                <AddButtons
                  onAddBook={handleBookAdd}
                  defaultValues={
                    bookInformation.current
                      ? {
                          initialRequiredShelf: bookInformation.current.shelf!,
                          initialOptionalShelves:
                            bookInformation.current.bookShelves!,
                        }
                      : undefined
                  }
                  onCancel={() => handleEdit()}
                />
              )}
            </>
          )}
        </IonContent>
      </IonPage>
    );
  }
};

export default BookPage;
