import axios from 'axios';
import type {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';

import { checkToken } from './auth.service';

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 5000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.headers.set('Authorization', `Bearer ${checkToken()}`);
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => Promise.reject(error),
);

export default api;
