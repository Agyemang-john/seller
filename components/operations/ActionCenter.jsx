'use client';

/**
 * "Needs your attention" list at the top of the seller home page.
 * Items come from GET /api/v1/vendor/action-center/ (vendor/action_center.py),
 * already filtered to what this team member's role can act on.
 */

import Link from 'next/link';
import useSWR from 'swr';
import { Box, Card, Divider, Skeleton, Stack, Typography } from '@mui/material';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { fetcher, SWR_CONFIG } from '@/components/dashboard/DashboardUI';

const SEVERITY = {
  critical: { color: 'error.main', label: 'Urgent' },
  warning: { color: 'warning.main', label: 'To do' },
  info: { color: 'info.main', label: 'FYI' },
};

export default function ActionCenter() {
  const { data, error, isLoading } = useSWR('/api/v1/vendor/action-center/', fetcher, {
    ...SWR_CONFIG,
    refreshInterval: 120_000, // new orders arrive while the page is open
  });

  if (error) return null; // the rest of the dashboard still works

  const items = data?.items ?? [];

  return (
    <Card variant="outlined" sx={{ borderRadius: '12px', mb: 3.5 }}>
      <Box sx={{ px: 2.5, py: 1.75, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Needs your attention</Typography>
        {!isLoading && (
          <Typography variant="caption" color="text.secondary">
            {items.length ? `${items.length} item${items.length === 1 ? '' : 's'}` : 'All clear'}
          </Typography>
        )}
      </Box>
      <Divider />

      {isLoading ? (
        <Stack spacing={1} sx={{ p: 2.5 }}>
          {[0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={44} />)}
        </Stack>
      ) : items.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ px: 2.5, py: 2.5 }}>
          Nothing needs action right now. New orders, returns and stock alerts will appear here.
        </Typography>
      ) : (
        <Stack divider={<Divider />}>
          {items.map((item) => <ActionRow key={item.key} item={item} />)}
        </Stack>
      )}
    </Card>
  );
}

function ActionRow({ item }) {
  const severity = SEVERITY[item.severity] ?? SEVERITY.info;
  return (
    <Box
      component={Link}
      href={item.link}
      sx={{
        display: 'flex', alignItems: 'center', gap: 2, px: 2.5, py: 1.5,
        textDecoration: 'none', color: 'inherit',
        borderLeft: '3px solid', borderLeftColor: severity.color,
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{item.title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>{item.detail}</Typography>
      </Box>
      <Typography
        variant="caption"
        sx={{ color: severity.color, fontWeight: 600, display: { xs: 'none', sm: 'block' }, whiteSpace: 'nowrap' }}
      >
        {severity.label}
      </Typography>
      <ChevronRightRoundedIcon sx={{ color: 'text.disabled' }} />
    </Box>
  );
}

