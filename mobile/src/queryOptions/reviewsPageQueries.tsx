import api from '../services/api.service';

export default async function fetchUserReviews() {
  const response = await api.get('/user/reviews');

  return response.data;
}
