import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonSearchbar,
  IonGrid,
} from '@ionic/react';

import styles from './Search.module.css';
import { useState } from 'react';

import LoadSpinner from '../components/LoadSpinner';
import BookSwiper from '../components/BookSwiper';

import { useQuery } from '@tanstack/react-query';
import fetchTrendingBooksRecommendation from '../queryOptions/homeQueries';
import fetchSuggestedBooks from '../queryOptions/searchPageQueries';

import useAuthStore from '../store/useAuthStore';

import ErrorDisplay from '../components/ErrorDisplay';

import api from '../services/api.service';
import axios from 'axios';

import Toast from '../components/Toast';

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

const availableSearchFilters: Array<string> = [
  'All',
  'Title',
  'Category',
  'Author',
];

const defaultTrendingListIndex = 0;
const defaultSearchIndex = 0;

const Search: React.FC = () => {
  const userID = useAuthStore((state) => state.userID);

  const [selectedList, setSelectedList] = useState(
    availableNYTLists[defaultTrendingListIndex],
  );

  const [selectedSearchFilter, setSelectedSearchFilter] = useState<string>(
    availableSearchFilters[defaultSearchIndex],
  );

  const [searchText, setSearchText] = useState<string>('');

  const [displayToast, setDisplayToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  const [toastType, setToastType] = useState<string>('');

  const availableToastTypes = {
    success: 'success',
    error: 'error',
  };

  const handleSearch = async (filter?: string) => {
    if (searchText.trim().length > 0) {
      try {
        const response = await api.get(
          `/book/search?type=${
            filter ? filter : selectedSearchFilter
          }&text=${searchText}`,
        );

        const status = response.status;

        if (status == 200) {
          console.log(response.data);
        }
      } catch (error) {
        setDisplayToast(true);

        if (axios.isAxiosError(error)) {
          const serverMessage =
            error.response?.data?.error || 'Server communication error.';
          setToastMessage(serverMessage);
        } else {
          setToastMessage('Unexpected error occurred.');
        }
        setToastType(availableToastTypes.error);
      }
    }
  };

  const trendingListBookQuery = useQuery({
    queryKey: ['trendingListBooks', userID, selectedList.name],
    queryFn: () =>
      fetchTrendingBooksRecommendation(undefined, selectedList.encoded),
    enabled: selectedList.name !== '' && selectedList.encoded !== '',
  });

  const suggestedBooksQuery = useQuery({
    queryKey: ['suggestedBooks', userID],
    queryFn: () => fetchSuggestedBooks(),
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonSearchbar
            animated={true}
            placeholder="Search"
            showCancelButton="focus"
            value={searchText}
            onIonInput={(e) => {
              setSearchText(e.detail.value!);
            }}
            onIonChange={() => handleSearch()}
          ></IonSearchbar>
          <div className={styles.chipsContainer}>
            <>
              {availableSearchFilters.map((filter: string) => {
                const isSelected = selectedSearchFilter === filter;
                return (
                  <button
                    key={filter}
                    className={`${styles.chip} ${
                      isSelected ? styles.chipActive : ''
                    }`}
                    onClick={() => {
                      setSelectedSearchFilter(filter);
                      if (searchText.trim().length > 0) handleSearch(filter);
                    }}
                  >
                    {filter}
                  </button>
                );
              })}
            </>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonGrid>
          <div>
            {suggestedBooksQuery.isLoading ? (
              <LoadSpinner
                message="Fetching Suggested Books..."
                fullScreen={false}
              />
            ) : suggestedBooksQuery.isSuccess &&
              suggestedBooksQuery.data &&
              Object.keys(suggestedBooksQuery.data).length > 0 &&
              suggestedBooksQuery.data.suggestedBooks.length > 0 ? (
              <>
                <h1>Because you liked '{suggestedBooksQuery.data.title}'</h1>
                <div>
                  {
                    <BookSwiper
                      books={suggestedBooksQuery.data.suggestedBooks}
                    />
                  }
                </div>
              </>
            ) : (
              suggestedBooksQuery.isError && (
                <ErrorDisplay
                  title={'Error loading suggested books'}
                  onRetry={() => suggestedBooksQuery.refetch()}
                  compact={true}
                />
              )
            )}
          </div>
          <div>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Bestsellers</h2>
            </div>

            <div className={styles.chipsContainer}>
              <>
                {availableNYTLists.map((list) => {
                  const isSelected = selectedList.encoded === list.encoded;
                  return (
                    <button
                      key={list.encoded}
                      className={`${styles.chip} ${
                        isSelected ? styles.chipActive : ''
                      }`}
                      onClick={() => setSelectedList(list)}
                    >
                      {list.name}
                    </button>
                  );
                })}
              </>
            </div>

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
              trendingListBookQuery.isError && (
                <ErrorDisplay
                  title={`Error loading trending books from ${selectedList.name}`}
                  onRetry={() => trendingListBookQuery.refetch()}
                  compact={true}
                />
              )
            )}
          </div>
        </IonGrid>
        <Toast
          message={toastMessage}
          onDismiss={() => setDisplayToast(false)}
          type={toastType}
          open={displayToast}
        />
      </IonContent>
    </IonPage>
  );
};

export default Search;
