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
    },
  });

  if (information || addBookToList.isSuccess) {
    const bookInfo = information?.book || addBookToList.variables?.book;

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
              message={`Adding book to ${
                addBookToList.variables.list.charAt(0).toUpperCase() +
                addBookToList.variables.list.slice(1)
              } List ...`}
              fullScreen={true}
            />
          ) : (
            <>
              <BookInfo bookInfo={bookInfo} detailed={true} />
              {information.list || addBookToList.isSuccess ? (
                <StatusFeedback
                  successMessage={'You already have this book!'}
                  list={
                    information.list
                      ? information.list.charAt(0).toUpperCase() +
                        information.list.slice(1)
                      : addBookToList.variables?.list.charAt(0).toUpperCase() +
                        addBookToList.variables?.list.slice(1)
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
  } else if (!information) {
    return <>Erro</>;
  }
};

export default BookPage;
