import Cookies from 'js-cookie';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
	BaseQueryFn,
	FetchArgs,
	FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { setAuth, logout } from '../features/authSlice';
import { Mutex } from 'async-mutex';

const mutex = new Mutex();
const baseQuery = fetchBaseQuery({
	baseUrl: `${process.env.NEXT_PUBLIC_HOST}/api`,
	credentials: 'include',
	prepareHeaders: (headers) => {
		const accessToken = Cookies.get('access');
		const guestCart = Cookies.get('guest_cart');
		const currency = Cookies.get('currency');
		if (accessToken) {
			headers.set('Authorization', `Bearer ${accessToken}`)
		}
		if (guestCart) {
			headers.set('X-Guest-Cart', guestCart)
		}
		if (currency) {
		headers.set('X-Currency', currency);  // Attach currency as a custom header
		}

		return headers;
	},
});
const baseQueryWithReauth: BaseQueryFn<
	string | FetchArgs,
	unknown,
	FetchBaseQueryError
> = async (args, api, extraOptions) => {
	await mutex.waitForUnlock();
	let result = await baseQuery(args, api, extraOptions);

	if (result.error && result.error.status === 401) {

		if (!mutex.isLocked()) {
			const release = await mutex.acquire();
			try {
				const refreshResult = await baseQuery(
					{
						url: '/jwt/refresh/vendor/',
						method: 'POST',
					},
					api,
					extraOptions
				);
				if (refreshResult.data) {
					api.dispatch(setAuth());

					result = await baseQuery(args, api, extraOptions);
				} else {
					api.dispatch(logout());
				}
			} finally {
				release();
			}
		} else {
			await mutex.waitForUnlock();
			result = await baseQuery(args, api, extraOptions);
		}
	}
	return result;
};

export const apiSlice = createApi({
	reducerPath: 'api',
	baseQuery: baseQueryWithReauth,
	tagTypes: ['Cart'],
	endpoints: builder => ({}),
});
