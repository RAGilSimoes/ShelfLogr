import api from '../services/api.service';

export default async function fetchUserListsNames() {
  const response = await api.get('/user/lists-names');

  return response.data;
}
