import api from '../services/api.service';

export default async function fetchSuggestedBooks() {
  const response = await api.get('/user/last-liked');

  return response.data;
}
