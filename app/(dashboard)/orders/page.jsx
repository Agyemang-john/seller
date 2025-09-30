'use client';

import { Box } from '@mui/material';
import OrderList from './_components/OrderList';

export default function Page() {

  return (
    <Box className='container' mt={4}>
      <OrderList />
    </Box>
  );
}