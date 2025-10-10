"use client";

import React from 'react';
import { Typography, Button, Box } from '@mui/material';
import { useAppDispatch } from '@/redux/hooks';
import { useLogoutMutation } from '@/redux/features/authApiSlice';
import { logout as setLogout } from '@/redux/features/authSlice';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';


function Logout() {
    const router = useRouter();

    const dispatch = useAppDispatch();
    
    const [logout] = useLogoutMutation();

    const handleLogout = () => {
        logout(undefined)
          .unwrap()
          .then(() => {
            dispatch(setLogout());
            toast.success('Logged out successfully!');
            router.push('/');
          });
      };
    

  return (
    <div
  style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    color: '#666',
    marginBottom: '1.5rem',
  }}
>
  <Typography
    variant="h4"
    gutterBottom
    sx={{ fontWeight: 'bold', color: '#333' }}
  >
    Are you sure you want to logout?
  </Typography>

  <Typography
    variant="body1"
    sx={{ color: '#666', marginBottom: 3, textAlign: 'center' }}
  >
    Logging out will end your current session, and you'll need to log in
    again to continue.
  </Typography>

  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
    <Button
      variant="contained"
      color="error"
      size="large"
      onClick={handleLogout}
      sx={{ textTransform: 'none' }}
    >
      Yes, Logout
    </Button>

    <Button
      variant="outlined"
      color="primary"
      size="large"
      onClick={() => router.back()}
      sx={{ textTransform: 'none' }}
    >
      Cancel
    </Button>
  </Box>
</div>

  )
}

export default Logout
