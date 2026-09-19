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

import { useHistory, useLocation } from 'react-router';

import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';

import fetchUserListsNames from '../queryOptions/bookPageQueries';

import api from '../services/api.service';
import useAuthStore from '../store/useAuthStore';
import { useRef } from 'react';

const BookPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation<{
    information: { book: bookInfo; category?: string; list?: string };
  }>();

  const userID = useAuthStore().userID;

  const queryClient = useQueryClient();

  const bookInformation = useRef(location.state?.information);

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
    const addList =
      bookInformation.current?.list ||
      addBookToList.variables?.requiredList ||
      '';
    const formattedListName = addList
      ? addList.charAt(0).toUpperCase() + addList.slice(1)
      : '';

    const handleBookAdd = (
      requiredList: string,
      optionalLists?: Array<string>,
    ) => {
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
              message={`Adding book to ${formattedListName} List ...`}
              fullScreen={true}
            />
          ) : (
            <>
              <BookInfo bookInfo={bookInfo} detailed={true} />
              {bookInformation.current.list || addBookToList.isSuccess ? (
                <StatusFeedback
                  successMessage={
                    bookInformation.current?.list
                      ? 'You already have this book'
                      : 'Book added successfully'
                  }
                  list={formattedListName}
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
