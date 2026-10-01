import api from '../services/api.service';

export default async function fetchUserProfileInfo() {
  const response = await api.get('/user/profile');

  return response.data;
}
