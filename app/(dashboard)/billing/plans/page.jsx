// app/vendor/billing/plans/page.jsx
// Embeds the full subscription plans page within the billing layout
'use client';
import { Box, Typography, Button } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useRouter } from 'next/navigation';

export default function BillingPlansPage() {
  const router = useRouter();
  return (
    <Box>
      <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', mb: 1 }} color="text.primary">
        Subscription Plans
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Compare plans and upgrade or downgrade at any time.
      </Typography>
      {/* Full subscription page is at /vendor/subscription */}
      <Button variant="contained" disableElevation endIcon={<ArrowForwardIcon />}
        onClick={() => router.push('/subscribe')}
        sx={{ bgcolor: 'text.primary', color: 'background.paper', borderRadius: '10px', fontWeight: 600, '&:hover': { bgcolor: 'text.secondary' } }}>
        View all plans
      </Button>
    </Box>
  );
}