import api from '../services/api.service';

export default async function fetchListBooks(id: string) {
  const response = await api.get(`/user/list/${id}`);

  return response.data;
}
