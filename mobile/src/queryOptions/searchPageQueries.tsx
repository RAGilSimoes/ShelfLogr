import api from '../services/api.service';

async function fetchSuggestedBooks() {
  const response = await api.get('/user/last-liked');

  return response.data;
}

async function fetchSearchedBooks(filter: string, searchText: string) {
  const response = await api.get(
    `/book/search?type=${filter}&text=${searchText}`,
  );

  return response.data;
}

export { fetchSuggestedBooks, fetchSearchedBooks };
