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
      bookShelves: Array<string>;
      category?: string;
      shelf?: string;
    };
  }>();

  const userID = useAuthStore().userID;

  const queryClient = useQueryClient();

  const bookInformation = useRef(location.state?.information);

  const [formattedShelfNames, setFormattedShelfNames] = useState<string[]>([]);

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

  if (bookInformation.current || addBookToShelf.isSuccess) {
    const bookInfo =
      bookInformation.current?.book || addBookToShelf.variables?.book;

    const bookShelves = bookInformation.current?.bookShelves;

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
              message={`Adding Book To \n\n ${formattedShelfNames
                .map((item) => '• ' + item)
                .join('\n')} \n\n ...`}
              fullScreen={true}
            />
          ) : (
            <>
              <BookInfo bookInfo={bookInfo} detailed={true} />
              {bookInformation.current?.shelf || addBookToShelf.isSuccess ? (
                <StatusFeedback
                  successMessage={
                    bookInformation.current?.shelf
                      ? 'You Already Have This Book'
                      : 'Book Added Successfully'
                  }
                  shelf={
                    addBookToShelf.isSuccess
                      ? formattedShelfNames
                      : bookShelves && bookShelves.length > 0
                      ? bookShelves
                      : [bookInformation.current.shelf!]
                  }
                />
              ) : (
                <AddButtons onAddBook={handleBookAdd} />
              )}
            </>
          )}
        </IonContent>
      </IonPage>
    );
  }
};

export default BookPage;
