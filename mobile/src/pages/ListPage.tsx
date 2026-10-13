import {
  IonBackButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonSearchbar,
  IonIcon,
  IonButton,
} from '@ionic/react';

import styles from './ListPage.module.css';

import {
  alertCircleOutline,
  bookOutline,
  libraryOutline,
} from 'ionicons/icons';

import { useLocation } from 'react-router';

import { useQuery } from '@tanstack/react-query';
import fetchListBooks from '../queryOptions/listPageQueries';

import useAuthStore from '../store/useAuthStore';

import LoadSpinner from '../components/LoadSpinner';

import BookCard from '../components/BookCard';

import { useHistory, useParams } from 'react-router';

import { useEffect, useState } from 'react';

const ListPage: React.FC = () => {
  const userID = useAuthStore((state) => state.userID);
  const location: any = useLocation().state;

  const [searchedBook, setSearchedBook] = useState<string>('');

  const [listName, setListName] = useState<string>('');

  const history = useHistory();

  const { id: listID } = useParams<{ id: string }>();

  const information: {
    id: string;
    is_system: boolean;
    name: string;
    quantity: number;
  } = location?.information;

  useEffect(() => {
    if (information) setListName(information.name);
  }, []);

  const listBooksQuery = useQuery({
    queryKey: ['userList', userID, listID],
    queryFn: () => fetchListBooks(listID),
    select(data) {
      return data.books;
    },
  });

  const filteredBooks =
    listBooksQuery.isSuccess && listBooksQuery.data.length > 0
      ? listBooksQuery.data.filter(
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
          }) => item.title.toLowerCase().includes(searchedBook.toLowerCase()),
        )
      : [];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/profile"></IonBackButton>
          </IonButtons>
          <IonTitle>
            {listName.charAt(0).toUpperCase() + listName.slice(1) || ''} List
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
            <>
              <IonSearchbar
                debounce={100}
                value={searchedBook}
                onIonInput={(event) => {
                  setSearchedBook(event.target.value!);
                }}
                showClearButton="focus"
              ></IonSearchbar>
              {filteredBooks && filteredBooks.length > 0 ? (
                filteredBooks.map(
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
                <div className={styles.emptyContainer}>
                  <IonIcon icon={bookOutline} className={styles.emptyIcon} />
                  <h3 className={styles.emptyTitle}>
                    No Books with that Title
                  </h3>
                </div>
              )}
            </>
          ) : (
            listBooksQuery.data.length === 0 && (
              <div className={styles.emptyContainer}>
                <IonIcon icon={libraryOutline} className={styles.emptyIcon} />
                <h3 className={styles.emptyTitle}>No Books Yet</h3>
                <p className={styles.emptySubtitle}>
                  When you add a book to this list, it will appear here.
                </p>
              </div>
            )
          )
        ) : (
          <div className={styles.emptyContainer}>
            <IonIcon icon={alertCircleOutline} className={styles.errorIcon} />
            <h3 className={styles.emptyTitle}>Couldn't Load Books</h3>
            <p className={styles.emptySubtitle}>
              There was a problem connecting to the server. Please check your
              connection and try again.
            </p>
            <IonButton
              fill="outline"
              shape="round"
              className={styles.retryBtn}
              onClick={() => listBooksQuery.refetch()}
            >
              Try Again
            </IonButton>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ListPage;
