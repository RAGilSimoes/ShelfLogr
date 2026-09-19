import api from '../services/api.service';

async function fetchUserLists() {
  const response = await api.get('/user/active-lists');

  return response.data;
}

async function fetchUserListsNames() {
  const response = await api.get('/user/lists-names');

  return response.data;
}

export { fetchUserLists, fetchUserListsNames };
