import api from '../services/api.service';

export default async function fetchShelfBooks(id: string) {
  const response = await api.get(`/user/shelf/${id}`);

  return response.data;
}
