'use client';

import React, { useState } from 'react';
import { useLoginMutation } from '@/redux/features/authApiSlice';
import { useAppDispatch } from '@/redux/hooks';
import { setAuth } from '@/redux/features/authSlice';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import BlackButton from '@/components/BlackButton';
import { Box, TextField, Typography, CircularProgress, IconButton, InputAdornment, Alert } from '@mui/material';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

export default function LoginForm() {
  const dispatch = useAppDispatch();
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [message, setMessage] = useState({ type: null, text: '' });

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const redirectPath = redirect ? decodeURIComponent(redirect) : '/dashboard';

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const resetForm = () => {
    setPassword('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: null, text: '' });

    try {
      const response = await login({ email: emailOrPhone, password }).unwrap();
      if (response.detail?.includes('OTP sent')) {
        // Set cookie for identifier (10-minute expiry)
        Cookies.set('otp_identifier', emailOrPhone);
        router.push(`/auth/verify?redirect=${encodeURIComponent(redirectPath)}`);
      } else {
        dispatch(setAuth({}));
        setMessage({ type: 'success', text: 'Logged in successfully!' });
        toast.success('Logged in successfully!');
        router.push(redirectPath);
      }
    } catch (err) {
      const status = err?.status;
      const data = err?.data || {};
      let errorMsg = 'Something went wrong. Please try again later.';

      if (status === 400 || status === 401) {
        if (Array.isArray(data?.non_field_errors) && data.non_field_errors.length > 0) {
          errorMsg = data.non_field_errors[0];
        } else if (typeof data === 'string') {
          errorMsg = data;
        } else if (data.detail) {
          errorMsg = data.detail;
        }

        if (errorMsg === 'Your account is not activated yet.') {
          router.push('/auth/resend-activation');
        } else if (errorMsg === 'OTP verification not required for this user.') {
          errorMsg = 'This portal is for vendors only. Please use the customer portal at www.negromart.com.';
        }
      }

      setMessage({ type: 'error', text: errorMsg });
      toast.error(errorMsg);
    } finally {
      resetForm();
    }
  };

  return (
    <section className="relative flex flex-wrap lg:h-screen lg:items-center bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen">
      <div className="relative w-full px-4 py-12 sm:px-6 sm:py-16 lg:w-1/2 lg:px-8 lg:py-24 bg-white/80 backdrop-blur-sm">
        <Box
          className="absolute top-0 left-0 w-full h-full -z-10 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle, #000 3px, transparent 3px)',
            backgroundSize: '30px 30px',
          }}
        />
        <div className="mx-auto max-w-lg text-center">
          <Link href="/" className="inline-block mb-4">
            <img
              src="/favicon.png"
              alt="Negromart Vendor Logo"
              className="mx-auto h-25 w-25 cursor-pointer"
              height="400"
            />
          </Link>
          <Typography variant="h5" className="font-bold">
            Seller Login
          </Typography>
        </div>

        <form
          className="w-full mx-auto mb-0 mt-4 max-w-xl space-y-4"
          onSubmit={handleLoginSubmit}
        >
          {message.type && (
            <Alert
              severity={message.type}
              className={`${
                message.type === 'error' ? 'bg-red-100 text-red-800 border-red-300' : 'bg-green-100 text-green-800 border-green-300'
              } rounded-md border`}
              sx={{ mb: 2 }}
            >
              {message.text}
            </Alert>
          )}

          <div>
            <TextField
              fullWidth
              label="Email or Phone"
              type="text"
              variant="outlined"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: 'black',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: 'black',
                },
              }}
            />
          </div>
          <div>
            <TextField
              fullWidth
              variant="outlined"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: 'black',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: 'black',
                },
              }}
            />
          </div>

          <Box display="flex" justifyContent="flex-end" alignItems="center" mt={2}>
            <BlackButton
              type="submit"
              variant="contained"
              disabled={isLoginLoading}
              sx={{
                backgroundColor: 'black',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#333',
                },
              }}
            >
              {isLoginLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Continue'}
            </BlackButton>
          </Box>
{/* 
          <Typography variant="body1" textAlign="center" mt={2}>
            <Link href="/auth/password-reset" style={{ textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </Typography> */}
        </form>
      </div>

      <div className="relative h-64 w-full sm:h-96 lg:h-full lg:w-1/2">
        <img alt="" src="/glad.jpeg" className="absolute inset-0 h-full w-full object-cover" />
      </div>
    </section>
  );
}