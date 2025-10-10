import { apiSlice } from '../services/apiSlice';

const authApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    login: builder.mutation({
      query: ({ email, password }) => ({
        url: '/jwt/create/vendor/',
        method: 'POST',
        body: { email, password },
      }),
    }),
    otpVerify: builder.mutation({
      query: ({ email, otp }) => ({
        url: '/jwt/otp-verify/',
        method: 'POST',
        body: { email, otp },
      }),
    }),
	otpResend: builder.mutation({
	  query: (data) => ({
		url: '/jwt/otp-resend/',
		method: 'POST',
		body: data,
	  }),
	}),
    verify: builder.mutation({
      query: () => ({
        url: '/jwt/verify/',
        method: 'POST',
      }),
    }),
    refresh: builder.mutation({
      query: () => ({
        url: '/jwt/refresh/vendor/',
        method: 'POST',
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/logout/',
        method: 'POST',
      }),
    }),
    resetPassword: builder.mutation({
      query: email => ({
        url: '/users/reset_password/',
        method: 'POST',
        body: { email },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useOtpVerifyMutation,
  useOtpResendMutation,
  useVerifyMutation,
  useRefreshMutation,
  useLogoutMutation,
  useResetPasswordMutation,
} = authApiSlice;