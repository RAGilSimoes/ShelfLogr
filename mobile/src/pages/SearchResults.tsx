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

import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchSearchedBooks } from '../queryOptions/searchPageQueries';
import { bookInfo } from '@shelflogr/shared';

const SearchResults: React.FC = () => {
  const userID = useAuthStore((state) => state.userID);

  const location = useLocation<{
    type: string;
    query: string;
  }>();

  const history = useHistory();

  const searchedBooksQuery = useInfiniteQuery({
    queryKey: [
      'searchResults',
      userID,
      location.state?.type,
      location.state?.query,
    ],
    queryFn: ({ pageParam }) =>
      fetchSearchedBooks(location.state.type, location.state.query, pageParam),
    enabled:
      location.state !== undefined &&
      location.state.type !== undefined &&
      location.state.query !== undefined,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      return lastPage.hasMore ? lastPage.nextIndex : undefined;
    },
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/search"></IonBackButton>
          </IonButtons>
          <IonTitle>{location.state?.query}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {searchedBooksQuery.isLoading ? (
          <LoadSpinner message="Loading Books..." fullScreen={true} />
        ) : searchedBooksQuery.data?.pages &&
          searchedBooksQuery.data.pages.length > 0 ? (
          <IonList>
            {searchedBooksQuery.data.pages.map((page: any) =>
              page.results.map((item: bookInfo) => {
                return (
                  <IonItem key={item.isbn}>
                    <div
                      className={styles.cardContainer}
                      onClick={() => {
                        history.push(`/app/book/${item.isbn}`, {
                          information: {
                            book: item,
                            bookShelves: [],
                            category: '',
                            shelf: '',
                          },
                        });
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <BookCard bookInfo={item} detailed={false} />
                    </div>
                  </IonItem>
                );
              }),
            )}
          </IonList>
        ) : searchedBooksQuery.data?.pages &&
          searchedBooksQuery.data?.pages[0]?.results.length === 0 ? (
          <p>Sem Resultados</p>
        ) : (
          searchedBooksQuery.isError && <p>Erro</p>
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
