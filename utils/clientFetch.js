'use client';

import axios from 'axios';
import Cookies from 'js-cookie';
import { store } from '@/redux/store';
import { setAuth } from '@/redux/features/authSlice';

export const createAxiosClient = () => {
  const axiosClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_HOST,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });

  // Request Interceptor
  axiosClient.interceptors.request.use(
    (config) => {
      const accessToken = Cookies.get('vendor_access');
      const guestCart = Cookies.get('guest_cart');
      const currency = Cookies.get('currency');
      const recentlyViewed = Cookies.get('recently_viewed');

      if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
      }
      if (guestCart) {
        config.headers['X-Guest-Cart'] = guestCart;
      }
      if (currency) {
        config.headers['X-Currency'] = currency;
      }
      if (recentlyViewed) {
        config.headers['X-Recently-Viewed'] = recentlyViewed;
      }
      config.headers["X-User-Type"] = "vendor";
      config.headers['X-SSR-Refresh'] = 'true';
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor
  axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          await axios.post(
            `${process.env.NEXT_PUBLIC_HOST}/api/jwt/refresh/vendor/`,
            {},
            { withCredentials: true }
          );
          store.dispatch(setAuth());
          return axiosClient(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return axiosClient;
};
