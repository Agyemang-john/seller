'use client';

import { Box } from '@mui/material';
import { useParams } from 'next/navigation';
import PaymentForm from './_components/PaymentForm';

export default function Page() {

  return (
   
    <Box className='container'  mx="auto" mt={4}>
      <PaymentForm />
    </Box>
  );
}
