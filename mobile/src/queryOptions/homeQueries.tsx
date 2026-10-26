import api from '../services/api.service';

export default async function fetchTrendingBooksRecommendation(
  category?: string | null,
  trending?: string | null,
) {
  const response = await api.get('/books/trending', {
    params: {
      category,
      trending,
    },
  });

  return response.data;
}
