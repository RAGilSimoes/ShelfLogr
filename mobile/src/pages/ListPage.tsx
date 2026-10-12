import {
  IonBackButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
} from '@ionic/react';

import './ListPage.module.css';

import { useLocation } from 'react-router';

import { useQuery } from '@tanstack/react-query';
import fetchListBooks from '../queryOptions/listPageQueries';

import useAuthStore from '../store/useAuthStore';

import LoadSpinner from '../components/LoadSpinner';

import BookCard from '../components/BookCard';

import { useHistory, useParams } from 'react-router';

const ListPage: React.FC = () => {
  const userID = useAuthStore((state) => state.userID);
  const location: any = useLocation().state;

  const history = useHistory();

  const { id } = useParams<{ id: string }>();

  const information: {
    id: string;
    is_system: boolean;
    name: string;
    quantity: number;
  } = location?.information;

  const listBooksQuery = useQuery({
    queryKey: ['userList', userID, id],
    queryFn: () => fetchListBooks(id),
    select(data) {
      console.log(data.books);
      return data.books;
    },
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/profile"></IonBackButton>
          </IonButtons>
          <IonTitle>
            {information?.name?.charAt(0).toUpperCase() +
              information?.name?.slice(1) || ''}{' '}
            List
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {listBooksQuery.isFetching ? (
          <LoadSpinner
            message={'Fetching the books from this list'}
            fullScreen={true}
          />
        ) : listBooksQuery.isSuccess ? (
          listBooksQuery.data && listBooksQuery.data.length > 0 ? (
            listBooksQuery.data.map(
              (item: {
                added_at: string;
                authors: Array<string>;
                bookLists: Array<string>;
                categories: Array<string>;
                cover: string;
                description: string;
                id: string;
                isbn: string;
                language: string;
                list: string;
                mainCategory: string;
                pageCount: number;
                publishedDate: string;
                publisher: string;
                title: string;
              }) => {
                return (
                  <div
                    onClick={() => {
                      history.push(`/app/book/${item.id}`, {
                        information: {
                          book: item,
                          list: item.list,
                          bookLists: item.bookLists,
                        },
                      });
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <BookCard bookInfo={item} detailed={false} />
                  </div>
                );
              },
            )
          ) : (
            <p>Nada</p>
          )
        ) : (
          <p>Erro</p>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ListPage;
