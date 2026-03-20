'use client';

import { Box, Typography, Button, Stack } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function ProductListError({ message, onRetry }) {
  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', textAlign: 'center', py: 12, px: 3,
      borderRadius: '20px', border: '1px dashed', borderColor: 'error.light',
      bgcolor: 'background.paper',
    }}>
      <Box sx={{
        width: 56, height: 56, borderRadius: '14px',
        bgcolor: 'error.lighter', border: '1px solid', borderColor: 'error.light',
        display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5,
      }}>
        <ErrorOutlineIcon sx={{ fontSize: 26, color: 'error.main' }} />
      </Box>

      <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', mb: 1 }} color="text.primary">
        Failed to load products
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, lineHeight: 1.7, mb: 3.5 }}>
        {message}
      </Typography>

      <Stack direction="row" spacing={1.5}>
        <Button variant="contained" disableElevation startIcon={<RefreshIcon />} onClick={onRetry}
          sx={{ bgcolor: 'text.primary', color: 'background.paper', borderRadius: '10px', fontWeight: 600, '&:hover': { bgcolor: 'text.secondary' } }}>
          Try again
        </Button>
        <Button variant="outlined" href="/dashboard"
          sx={{ borderRadius: '10px', borderColor: 'divider', color: 'text.secondary', '&:hover': { borderColor: 'text.primary', color: 'text.primary' } }}>
          Go to dashboard
        </Button>
      </Stack>
    </Box>
  );
}