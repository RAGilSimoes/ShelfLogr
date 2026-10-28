import api from '../services/api.service';

export default async function fetchBookInfo(isbn: string) {
  const response = await api.get(`/book/info/${isbn}`);

  return response.data;
}
