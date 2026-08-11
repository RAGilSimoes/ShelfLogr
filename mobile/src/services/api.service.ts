import axios from 'axios';
import type {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';

import { checkToken, removeToken, setToken } from './auth.service';

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 5000,
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await checkToken();

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    if (
      error.response?.status === 401 &&
      error.response?.data?.error === 'Invalid Token' &&
      !error.config._retry
    ) {
      const request = error.config;
      error.config._retry = true;

      try {
        const result = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/refresh-token`,
          {
            headers: { Authorization: request.headers['Authorization'] },
          },
        );

        if (result.status === 200) {
          const token = result.data.token;
          setToken(token);
          request.headers['Authorization'] = `Bearer ${token}`;

          return api(request);
        }
      } catch (error) {
        removeToken();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
