import api from '../services/api.service';

async function fetchUserShelves() {
  const response = await api.get('/user/active-shelves');

  return response.data;
}

async function fetchUserShelvesNames() {
  const response = await api.get('/user/shelves-names');

  return response.data;
}

export { fetchUserShelves, fetchUserShelvesNames };
