import api from '../services/api.service';

async function fetchUserBookRecommendation() {
  const response = await api.get('/user/active-book-recommendation');

  return response.data;
}

async function fetchTrendingBooksRecommendation(category?: string) {
  const response = await api.get('/books/trending', {
    params: {
      category,
    },
  });

  return response.data;
}

export { fetchUserBookRecommendation, fetchTrendingBooksRecommendation };
