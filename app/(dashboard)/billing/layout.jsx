// app/vendor/billing/layout.jsx — updated with Settings tab
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Box, Typography, Button, Stack } from '@mui/material';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import PageContainer from '@/components/PageContainer';


const TABS = [
  { label: 'Overview',  path: '/billing'           },
  { label: 'History',   path: '/billing/history'   },
  { label: 'Cards & MoMo', path: '/billing/cards'  },
  { label: 'Plans',     path: '/billing/plans'     },
  { label: 'Settings',  path: '/billing/settings'  },
];
const PAGE_TITLE = 'Billing';

export default function BillingLayout({ children }) {
  const pathname = usePathname();
  const router   = useRouter();

  const active = (path) => {
    if (path === '/billing') return pathname === '/billing' || pathname === '/billing/';
    return pathname.startsWith(path);
  };

  return (

    <PageContainer
          title={''}
          breadcrumbs={[{ title: 'Home', path: '/dashboard' }, { title: PAGE_TITLE }]}
        >

        <Box sx={{ pb: 10 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'flex-end' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
            <Box>
            <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: { xs: 32, md: 40 }, fontWeight: 700, letterSpacing: '-1.5px', lineHeight: 1, mb: 0.5 }} color="text.primary">
                Billing
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Manage your subscription, payment methods, and invoices
            </Typography>
            </Box>
            <Button variant="contained" disableElevation startIcon={<CreditCardOutlinedIcon />}
            onClick={() => router.push('/billing/cards')}
            sx={{ bgcolor: 'text.primary', color: 'background.paper', borderRadius: '10px', fontWeight: 600, fontSize: 13, px: 2.5, py: 1.25, flexShrink: 0, '&:hover': { bgcolor: 'text.secondary' } }}>
            Payment methods
            </Button>
        </Stack>

        {/* Tab bar */}
        <Box sx={{ display: 'flex', borderBottom: '1px solid', borderColor: 'divider', mb: 4, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
            {TABS.map((tab) => {
            const isActive = active(tab.path);
            return (
                <Box key={tab.path} onClick={() => router.push(tab.path)}
                sx={{ px: 2, pb: 1.5, pt: 0.5, cursor: 'pointer', borderBottom: '2px solid', borderColor: isActive ? 'text.primary' : 'transparent', mr: 0.5, flexShrink: 0, transition: 'border-color 0.18s', '&:hover': { borderColor: isActive ? 'text.primary' : 'divider' } }}>
                <Typography variant="body2" sx={{ fontWeight: isActive ? 700 : 500, color: isActive ? 'text.primary' : 'text.secondary', transition: 'color 0.18s' }}>
                    {tab.label}
                </Typography>
                </Box>
            );
            })}
        </Box>

        {children}
        </Box>
    </PageContainer>

  );
}