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
import fetchShelfBooks from '../queryOptions/shelfPageQueries';

import useAuthStore from '../store/useAuthStore';

import LoadSpinner from '../components/LoadSpinner';

import BookCard from '../components/BookCard';
import ErrorDisplay from '../components/ErrorDisplay';

import { bookOutline, libraryOutline } from 'ionicons/icons';

import { useHistory, useParams } from 'react-router';

import { useEffect, useState } from 'react';

const ShelfPage: React.FC = () => {
  const userID = useAuthStore((state) => state.userID);
  const location: any = useLocation().state;

  const [searchedBook, setSearchedBook] = useState<string>('');

  const [shelfName, setShelfName] = useState<string>('');

  const history = useHistory();

  const { id: shelfID } = useParams<{ id: string }>();

  const information: {
    id: string;
    is_system: boolean;
    name: string;
    quantity: number;
  } = location?.information;

  useEffect(() => {
    if (information) setShelfName(information.name);
  }, []);

  const shelfBooksQuery = useQuery({
    queryKey: ['userShelf', userID, shelfID],
    queryFn: () => fetchShelfBooks(shelfID),
    select(data) {
      return data.books;
    },
  });

  const filteredBooks =
    shelfBooksQuery.isSuccess && shelfBooksQuery.data.length > 0
      ? shelfBooksQuery.data.filter(
          (item: {
            added_at: string;
            authors: Array<string>;
            bookShelves: Array<string>;
            categories: Array<string>;
            cover: string;
            description: string;
            id: string;
            isbn: string;
            language: string;
            shelf: string;
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
            {shelfName.charAt(0).toUpperCase() + shelfName.slice(1) || ''} Shelf
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {shelfBooksQuery.isFetching ? (
          <LoadSpinner
            message={'Fetching the books from this shelf'}
            fullScreen={true}
          />
        ) : shelfBooksQuery.isSuccess ? (
          shelfBooksQuery.data && shelfBooksQuery.data.length > 0 ? (
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
                    bookShelves: Array<string>;
                    categories: Array<string>;
                    cover: string;
                    description: string;
                    id: string;
                    isbn: string;
                    language: string;
                    shelf: string;
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
                              shelf: item.shelf,
                              bookShelves: item.bookShelves,
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
                  subtitle="Try searching with a different title."
                  icon={bookOutline}
                  compact={true}
                />
              )}
            </>
          ) : (
            shelfBooksQuery.data.length === 0 && (
              <ErrorDisplay
                title={`No Books Yet`}
                subtitle="When you add a book to this shelf, it will appear here."
                icon={libraryOutline}
                compact={true}
              />
            )
          )
        ) : (
          <ErrorDisplay
            title={`Couldn't Load Books`}
            subtitle="There was a problem loading the books from this shelf"
            onRetry={() => {
              shelfBooksQuery.refetch();
            }}
            compact={true}
          />
        )}
      </IonContent>
    </IonPage>
  );
};

export default ShelfPage;
