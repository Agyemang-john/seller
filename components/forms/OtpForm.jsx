'use client';

import React, { useState, useEffect } from 'react';
import { useOtpVerifyMutation, useOtpResendMutation } from '@/redux/features/authApiSlice';
import { useAppDispatch } from '@/redux/hooks';
import { setAuth } from '@/redux/features/authSlice';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import BlackButton from '@/components/BlackButton';
import { Box, TextField, Typography, CircularProgress, Alert } from '@mui/material';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

export default function OtpForm() {
  const dispatch = useAppDispatch();
  const [otpVerify, { isLoading: isOtpLoading }] = useOtpVerifyMutation();
  const [otpResend, { isLoading: isResendLoading }] = useOtpResendMutation();
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState({ type: null, text: '' });

  const router = useRouter();
  const searchParams = useSearchParams();
  let redirect = searchParams.get('redirect');
  if (redirect) {
    try {
      // Decode twice safely if needed
      redirect = decodeURIComponent(decodeURIComponent(redirect));
    } catch {
      redirect = decodeURIComponent(redirect);
    }
  }

  const redirectPath = redirect || '/dashboard';

  // Guard: Redirect to login if no identifier cookie
  useEffect(() => {
    if (!Cookies.get('otp_identifier')) {
      router.push('/auth/login');
    }
  }, [router]);


  const resetForm = () => {
    setOtp('');
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: null, text: '' });

    const identifier = Cookies.get('otp_identifier');
    if (!identifier) {
      setMessage({ type: 'error', text: 'Session expired. Please log in again.' });
      router.push('/auth/login');
      return;
    }
    try {
      await otpVerify({ email: identifier, otp }).unwrap();
      dispatch(setAuth({}));
      // Clear cookie on success
      Cookies.remove('otp_identifier');
      setMessage({ type: 'success', text: 'Logged in successfully!' });
      toast.success('Logged in successfully!');
      window.location.href = redirectPath || '/dashboard';
    } catch (err) {
      const status = err?.status;
      const data = err?.data || {};
      let errorMsg = 'Invalid or expired OTP.';

      if (status === 400 || status === 401) {
        if (data.detail) {
          errorMsg = data.detail;
        }
      }

      setMessage({ type: 'error', text: errorMsg });
      toast.error(errorMsg);
    } finally {
      resetForm();
    }
  };

  const handleResendOtp = async () => {
    const identifier = Cookies.get('otp_identifier');
    if (!identifier) {
      setMessage({ type: 'error', text: 'Session expired. Please log in again.' });
      router.push('/auth/login');
      return;
    }
    setMessage({ type: null, text: '' });

    try {
      const response = await otpResend({ email: identifier }).unwrap();
      if (response.detail?.includes('OTP sent')) {
        setMessage({ type: 'success', text: 'New OTP sent to your email or phone.' });
        toast.success('New OTP sent to your email or phone.');
      }
    } catch (err) {
      const status = err?.status;
      const data = err?.data || {};
      let errorMsg = 'Failed to resend OTP. Please try again.';

      if (status === 400 || status === 401) {
        if (Array.isArray(data?.non_field_errors) && data.non_field_errors.length > 0) {
          errorMsg = data.non_field_errors[0];
        } else if (typeof data === 'string') {
          errorMsg = data;
        } else if (data.detail) {
          errorMsg = data.detail;
        }
      }

      setMessage({ type: 'error', text: errorMsg });
      toast.error(errorMsg);
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
            Verify OTP
          </Typography>
        </div>

        <form
          className="w-full mx-auto mb-0 mt-4 max-w-xl space-y-4"
          onSubmit={handleOtpSubmit}
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
              label="Enter OTP"
              type="text"
              variant="outlined"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 5);
                setOtp(value);
              }}
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

          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
            <Typography variant="body1">
              <Link href="/auth/login" style={{ textDecoration: 'none' }}>
                Back to login
              </Link>
            </Typography>
            <BlackButton
              type="submit"
              variant="contained"
              disabled={isOtpLoading}
              sx={{
                backgroundColor: 'black',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#333',
                },
              }}
            >
              {isOtpLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Verify OTP'}
            </BlackButton>
          </Box>
        </form>
      </div>

      <div className="relative h-64 w-full sm:h-96 lg:h-full lg:w-1/2">
        <img alt="" src="/glad.jpeg" className="absolute inset-0 h-full w-full object-cover" />
      </div>
    </section>
  );
}