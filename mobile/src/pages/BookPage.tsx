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

const BookPage: React.FC = () => {
  const location = useLocation<{
    information: {
      book: bookInfo;
      bookLists: Array<string>;
      category?: string;
      list?: string;
    };
  }>();

  const userID = useAuthStore().userID;

  const queryClient = useQueryClient();

  const bookInformation = useRef(location.state?.information);

  const [formattedListNames, setFormattedListNames] = useState<string[]>([]);

  const addBookToList = useMutation({
    mutationFn: (content: {
      book: bookInfo;
      requiredList: string;
      optionalLists?: Array<string>;
    }) => {
      return api.post('/add-book-to-list', content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['userBook'],
      });
      queryClient.invalidateQueries({
        queryKey: ['userLists', userID],
      });
      queryClient.invalidateQueries({
        queryKey: ['trendingCategoryBooks', userID],
      });
      queryClient.invalidateQueries({
        queryKey: ['trendingBooks', userID],
      });
      queryClient.invalidateQueries({
        queryKey: ['bookInfoISBN', userID],
      });
      useAuthStore.getState().removeActiveBookRecommendationID();
    },
  });

  if (bookInformation.current || addBookToList.isSuccess) {
    const bookInfo =
      bookInformation.current?.book || addBookToList.variables?.book;

    const bookLists = bookInformation.current?.bookLists;

    const handleBookAdd = (
      requiredList: string,
      formattedListNames: Array<string>,
      optionalLists?: Array<string>,
    ) => {
      setFormattedListNames(formattedListNames);
      addBookToList.mutate({
        book: bookInfo,
        requiredList,
        optionalLists,
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
          {addBookToList.isPending ? (
            <LoadSpinner
              message={`Adding Book To \n\n ${formattedListNames
                .map((item) => '• ' + item)
                .join('\n')} \n\n ...`}
              fullScreen={true}
            />
          ) : (
            <>
              <BookInfo bookInfo={bookInfo} detailed={true} />
              {bookInformation.current?.list || addBookToList.isSuccess ? (
                <StatusFeedback
                  successMessage={
                    bookInformation.current?.list
                      ? 'You Already Have This Book'
                      : 'Book Added Successfully'
                  }
                  list={
                    bookLists ||
                    (bookInformation.current?.list
                      ? [bookInformation.current.list]
                      : formattedListNames)
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
