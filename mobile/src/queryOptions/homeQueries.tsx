import api from '../services/api.service';

export default async function fetchTrendingBooksRecommendation(
  category?: string,
) {
  const response = await api.get('/books/trending', {
    params: {
      category,
    },
  });

  return response.data;
}
