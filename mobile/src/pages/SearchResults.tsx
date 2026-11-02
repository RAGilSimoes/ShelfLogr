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

import { bookOutline, libraryOutline } from 'ionicons/icons';

import { useHistory, useParams, useLocation } from 'react-router';

import { useEffect, useState } from 'react';

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { fetchSearchedBooks } from '../queryOptions/searchPageQueries';

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
      if (!lastPage || lastPage.length < 10) {
        return undefined;
      }
      return allPages.length * 10;
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
        ) : searchedBooksQuery.isSuccess &&
          searchedBooksQuery.data?.pages &&
          searchedBooksQuery.data.pages.length > 0 ? (
          <IonList>
            {searchedBooksQuery.data.pages.map((page: Array<any>) =>
              page.map((item) => {
                return (
                  <IonItem>
                    <div
                      className={styles.cardContainer}
                      onClick={() => {
                        history.push(`/app/book/${item}`, {
                          information: item,
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
        ) : searchedBooksQuery.isSuccess &&
          searchedBooksQuery.data?.pages &&
          searchedBooksQuery.data.pages.length === 0 ? (
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
