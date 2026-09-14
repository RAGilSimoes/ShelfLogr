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

import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '../services/api.service';
import useAuthStore from '../store/useAuthStore';

const BookPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation<{
    information: { book: bookInfo; category?: string; list?: string };
  }>();

  const userID = useAuthStore().userID;

  const queryClient = useQueryClient();

  const information: {
    book: bookInfo;
    category?: string;
    list?: string;
  } = location.state?.information;

  const addBookToList = useMutation({
    mutationFn: (content: { book: bookInfo; list: string }) => {
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

  if (information || addBookToList.isSuccess) {
    const bookInfo = information?.book || addBookToList.variables?.book;
    const addList = information?.list || addBookToList.variables?.list || '';
    const formattedListName = addList
      ? addList.charAt(0).toUpperCase() + addList.slice(1)
      : '';

    const handleBookAdd = (list: string) => {
      addBookToList.mutate({
        book: bookInfo,
        list: list,
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
              {information?.list || addBookToList.isSuccess ? (
                <StatusFeedback
                  successMessage={
                    information?.list
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
  } else if (!information) {
    return <>Erro</>;
  }
};

export default BookPage;
