import api from '../services/api.service';

async function fetchSuggestedBooks() {
  const response = await api.get('/user/last-liked');

  return response.data;
}

async function fetchSearchedBooks(
  filter: string,
  searchText: string,
  index: number,
) {
  const response = await api.get(
    `/book/search?type=${filter}&text=${searchText}&index=${index}`,
  );

  return response.data;
}

export { fetchSuggestedBooks, fetchSearchedBooks };
