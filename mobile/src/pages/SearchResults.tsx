import {
  IonBackButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
} from '@ionic/react';

import useAuthStore from '../store/useAuthStore';

import LoadSpinner from '../components/LoadSpinner';

import BookCard from '../components/BookCard';
import ErrorDisplay from '../components/ErrorDisplay';

import { bookOutline, libraryOutline } from 'ionicons/icons';

import { useHistory, useParams, useLocation } from 'react-router';

import { useEffect, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { fetchSearchedBooks } from '../queryOptions/searchPageQueries';

const SearchResults: React.FC = () => {
  const userID = useAuthStore((state) => state.userID);

  const location = useLocation<{
    type: string;
    query: string;
  }>();

  const searchedBooksQuery = useQuery({
    queryKey: [
      'searchResults',
      userID,
      location.state?.type,
      location.state?.query,
    ],
    queryFn: () =>
      fetchSearchedBooks(location.state.type, location.state.query),
    enabled:
      location.state !== undefined &&
      location.state.type !== undefined &&
      location.state.query !== undefined,
  });

  if (searchedBooksQuery.isSuccess) console.log(searchedBooksQuery.data);

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
        <p>Resultados</p>
      </IonContent>
    </IonPage>
  );
};

export default SearchResults;
