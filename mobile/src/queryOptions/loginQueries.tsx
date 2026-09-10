import api from '../services/api.service';

export default async function fetchUserLists() {
  const response = await api.get('/user/active-lists');

  return response.data;
}
