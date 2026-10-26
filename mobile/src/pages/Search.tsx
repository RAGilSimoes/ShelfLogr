import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonGrid,
  IonButton,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';

import styles from './Search.module.css';
import { useState } from 'react';

import LoadSpinner from '../components/LoadSpinner';
import BookSwiper from '../components/BookSwiper';

import { useQuery } from '@tanstack/react-query';
import fetchTrendingBooksRecommendation from '../queryOptions/homeQueries';

import useAuthStore from '../store/useAuthStore';

const Search: React.FC = () => {
  const userID = useAuthStore((state) => state.userID);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');
  const [selectedCategoryEncoded, setSelectedCategoryEncoded] =
    useState<string>('');

  const availableNYTLists: Array<{ name: string; encoded: string }> = [
    {
      name: 'Combined Print & E-Book Fiction',
      encoded: 'combined-print-and-e-book-fiction',
    },
    {
      name: 'Combined Print & E-Book Nonfiction',
      encoded: 'combined-print-and-e-book-nonfiction',
    },
    {
      name: 'Paperback Trade Fiction',
      encoded: 'trade-fiction-paperback',
    },
    {
      name: 'Advice, How-To & Miscellaneous',
      encoded: 'advice-how-to-and-miscellaneous',
    },
    {
      name: 'Children’s Middle Grade Hardcover',
      encoded: 'childrens-middle-grade-hardcover',
    },
    {
      name: 'Children’s Picture Books',
      encoded: 'picture-books',
    },
    {
      name: 'Children’s & Young Adult Series',
      encoded: 'series-books',
    },
    {
      name: 'Young Adult Hardcover',
      encoded: 'young-adult-hardcover',
    },
    {
      name: 'Business',
      encoded: 'business-books',
    },
    {
      name: 'Graphic Books and Manga',
      encoded: 'graphic-books-and-manga',
    },
  ];

  const trendingListBookQuery = useQuery({
    queryKey: ['trendingListBooks', userID, selectedCategoryName],
    queryFn: () =>
      fetchTrendingBooksRecommendation(undefined, selectedCategoryEncoded),
    enabled: selectedCategoryName !== '' && selectedCategoryEncoded !== '',
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonSearchbar
            animated={true}
            placeholder="Search"
            showClearButton="focus"
          ></IonSearchbar>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonGrid>
          <div>
            <h1>Because you liked...</h1>
          </div>
          <div>
            <h1>
              {selectedCategoryName === ''
                ? 'Search By...'
                : `Searching By -> ${selectedCategoryName}`}
            </h1>
            <IonSelect
              placeholder="List"
              interfaceOptions={{ header: 'Choose A List' }}
              onIonChange={(e) => {
                setSelectedCategoryEncoded(e.detail.value);
                //setSelectedCategoryName(e);
              }}
              label="List"
              multiple={false}
              value={selectedCategoryName}
            >
              {availableNYTLists.map(
                (list: { name: string; encoded: string }) => {
                  return (
                    <IonSelectOption value={list.encoded}>
                      {list.name}
                    </IonSelectOption>
                  );
                },
              )}
            </IonSelect>

            {trendingListBookQuery.isLoading ? (
              <LoadSpinner message="Fetching Books..." fullScreen={false} />
            ) : trendingListBookQuery.isSuccess &&
              trendingListBookQuery.data ? (
              <>
                <div>
                  {
                    <BookSwiper
                      books={trendingListBookQuery.data.trendingBooksInfo}
                    />
                  }
                </div>
              </>
            ) : (
              trendingListBookQuery.isStale && <p>Olá</p>
            )}
          </div>
          <div>Your most liked author...</div>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Search;
