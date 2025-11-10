"use server";

import axios from 'axios';
import { cookies } from 'next/headers';


// Server-side instance creator
export async function createServerAxios() {
  const cookieStore = cookies();
  const accessToken = (await cookieStore).get('vendor_access')?.value;
  const guestCart = (await cookieStore).get('guest_cart')?.value;
  const currency = (await cookieStore).get('currency')?.value;

  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_HOST,
    headers: {
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...(guestCart && { 'X-Guest-Cart': guestCart }),
      ...(currency && { 'X-Currency': currency }),
      'X-SSR-Refresh': 'true',
      'Cache-Control': 'no-store, no-cache',
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });

  instance.interceptors.request.use((config) => {
    // Add guest cart to request body if it exists
    if (guestCart && config.data) {
      config.data = {
        ...config.data,
        guest_cart: guestCart,
      };
    }
    if (currency && config.data) {
      config.data = {
        ...config.data,
        currency: currency,
      };
    }
    config.headers["X-User-Type"] = "vendor";
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const refreshToken = (await cookieStore).get('vendor_refresh')?.value;          
          const refreshRes = await axios.post(
            `${process.env.NEXT_PUBLIC_HOST}/api/jwt/refresh/vendor/`,
            { refresh: refreshToken },
            {
              headers: {
                'X-SSR-Refresh': 'true',
                ...(guestCart && { 'X-Guest-Cart': guestCart }),
              },
              withCredentials: true,
            }
          );
          const newAccessToken = refreshRes.data.access;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          instance.defaults.headers.Authorization = `Bearer ${newAccessToken}`;

          return instance(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          throw refreshError;
        }
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
}
