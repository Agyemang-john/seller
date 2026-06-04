'use client';

import axios from 'axios';

/**
 * Dedicated axios client for the vendor *registration* request.
 *
 * At submit time the applicant is still an ordinary logged-in customer — their
 * role only becomes 'vendor' after an admin approves the application. The KYC
 * form (4 steps + document uploads) can easily outlive the 1-hour customer
 * access token, so on a 401 we must refresh the CUSTOMER token via
 * /api/jwt/refresh/. (utils/clientFetch.js refreshes the *vendor* token, which
 * does not exist yet for an applicant — using it here loses the whole form.)
 *
 * Auth travels via the HttpOnly `access` cookie (withCredentials). The backend
 * special-cases the /vendor/register/ path to read that customer cookie.
 */
export const createRegisterClient = () => {
  const HOST = process.env.NEXT_PUBLIC_HOST;

  const client = axios.create({
    baseURL: HOST,
    withCredentials: true,
    headers: { 'Cache-Control': 'no-store' },
  });

  client.interceptors.request.use((config) => {
    config.headers['X-User-Type'] = 'customer';
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          await axios.post(`${HOST}/api/jwt/refresh/`, {}, { withCredentials: true });
          return client(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
};
