import { apiSlice } from '../services/apiSlice';

const authApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    login: builder.mutation({
      query: ({ email, password, cf_turnstile_response }) => ({
        url: '/jwt/create/vendor/',
        method: 'POST',
        body: { email, password, cf_turnstile_response },
      }),
    }),
    otpVerify: builder.mutation({
      // identifier is in the HttpOnly cookie — only send the OTP value
      query: ({ otp }) => ({
        url: '/jwt/otp-verify/vendor/',
        method: 'POST',
        body: { otp },
      }),
    }),
    otpResend: builder.mutation({
      // identifier is in the HttpOnly cookie — no body needed
      query: () => ({
        url: '/jwt/otp-resend/vendor/',
        method: 'POST',
        body: {},
      }),
    }),
    verify: builder.mutation({
      query: () => ({
        url: '/jwt/verify/vendor/',
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
        url: '/vendor/logout/',
        method: 'POST',
        credentials: 'include',
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