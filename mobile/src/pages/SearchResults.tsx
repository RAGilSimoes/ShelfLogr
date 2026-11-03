import {
  IonBackButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonList,
  IonItem,
} from '@ionic/react';

import styles from '../pages/SearchResults.module.css';

import useAuthStore from '../store/useAuthStore';

import LoadSpinner from '../components/LoadSpinner';

import BookCard from '../components/BookCard';
import ErrorDisplay from '../components/ErrorDisplay';

import { useHistory, useLocation } from 'react-router';

import { useEffect, useState } from 'react';

import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchSearchedBooks } from '../queryOptions/searchPageQueries';
import { bookInfo } from '@shelflogr/shared';
import { libraryOutline } from 'ionicons/icons';

const SearchResults: React.FC = () => {
  const userID = useAuthStore((state) => state.userID);

  const location = useLocation<{
    type: string;
    query: string;
  }>();

  const [information, setInformation] = useState<{
    type: string;
    query: string;
  }>({ type: location.state?.type, query: location.state?.query });

  const history = useHistory();

  const searchedBooksQuery = useInfiniteQuery({
    queryKey: ['searchResults', userID, information.type, information.query],
    queryFn: ({ pageParam }) =>
      fetchSearchedBooks(information.type, information.query, pageParam),
    enabled:
      location.state !== undefined &&
      information.type !== undefined &&
      information.query !== undefined,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      return lastPage.hasMore ? lastPage.nextIndex : undefined;
    },
  });

  useEffect(() => {
    setInformation(location.state);
  }, [location.state]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/search"></IonBackButton>
          </IonButtons>
          <IonTitle>{information.query}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {searchedBooksQuery.isLoading ? (
          <LoadSpinner message="Loading Books..." fullScreen={true} />
        ) : searchedBooksQuery.data?.pages &&
          searchedBooksQuery.data?.pages[0]?.results.length > 0 ? (
          <div className={styles.resultsContainer}>
            {searchedBooksQuery.data.pages.map((page: any) =>
              page.results.map(
                (item: {
                  book: bookInfo;
                  bookShelves: Array<string>;
                  shelf: string | null;
                }) => {
                  return (
                    <div
                      key={item.book.isbn}
                      className={styles.cardContainer}
                      onClick={() => {
                        history.push(`/app/book/${item.book.isbn}`, {
                          information: {
                            book: item.book,
                            bookShelves: item.bookShelves,
                            category: '',
                            shelf: item.shelf,
                          },
                        });
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <BookCard bookInfo={item.book} detailed={false} />
                    </div>
                  );
                },
              ),
            )}
          </div>
        ) : searchedBooksQuery.data?.pages &&
          searchedBooksQuery.data?.pages[0]?.results.length === 0 ? (
          <ErrorDisplay
            title={`No Books found for that query`}
            subtitle="Change your query."
            icon={libraryOutline}
          />
        ) : (
          searchedBooksQuery.isError && (
            <ErrorDisplay title="Error Getting Results" />
          )
        )}

        <IonInfiniteScroll
          onIonInfinite={async (event) => {
            await searchedBooksQuery.fetchNextPage();
            event.target.complete();
          }}
          disabled={!searchedBooksQuery.hasNextPage}
        >
          <IonInfiniteScrollContent
            loadingText={'Loading more results...'}
            loadingSpinner={'bubbles'}
          ></IonInfiniteScrollContent>
        </IonInfiniteScroll>
      </IonContent>
    </IonPage>
  );
};

export default SearchResults;
