import axios from 'axios';
import {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';

import { checkToken, removeToken, setToken } from './auth.service';

import useNetworkStore from '../store/useNetworkStore';

import { Network } from '@capacitor/network';

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 15000,
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const status = await Network.getStatus();

  if (!status.connected) {
    useNetworkStore.getState().updateOnline(false);
    return Promise.reject(
      new AxiosError('No internet connection', 'ERR_NETWORK', config),
    );
  }

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
            headers: { Authorization: request.headers.get('Authorization') },
          },
        );

        if (result.status === 200) {
          const token = result.data.token;
          setToken(token);
          request.headers.set('Authorization', `Bearer ${token}`);

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
