import api from '../services/api.service';

export default async function fetchUserShelvesNames() {
  const response = await api.get('/user/shelves-names');

  return response.data;
}
