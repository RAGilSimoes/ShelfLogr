import {
  IonBackButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonSearchbar,
} from '@ionic/react';

import { useLocation } from 'react-router';

import { useQuery } from '@tanstack/react-query';
import fetchListBooks from '../queryOptions/listPageQueries';

import useAuthStore from '../store/useAuthStore';

import LoadSpinner from '../components/LoadSpinner';

import BookCard from '../components/BookCard';
import ErrorDisplay from '../components/ErrorDisplay';

import { bookOutline, libraryOutline } from 'ionicons/icons';

import { useHistory, useParams } from 'react-router';

import { useEffect, useState } from 'react';
import BookInfo from '../components/BookInfo';

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
                <ErrorDisplay
                  title={`No Books with that Title`}
                  subtitle="Change your filters."
                  icon={bookOutline}
                />
              )}
            </>
          ) : (
            listBooksQuery.data.length === 0 && (
              <ErrorDisplay
                title={`No Books Yet`}
                subtitle="When you add a book to this list, it will appear here."
                icon={libraryOutline}
              />
            )
          )
        ) : (
          <ErrorDisplay
            title={`Couldn't Load Books`}
            subtitle="There was a problem loading the books from this shelf"
            onRetry={() => {
              listBooksQuery.refetch();
            }}
          />
        )}
      </IonContent>
    </IonPage>
  );
};

export default ListPage;
