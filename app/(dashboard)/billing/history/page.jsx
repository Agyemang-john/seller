// app/vendor/billing/history/page.jsx
'use client';

import { useState } from 'react';
import { Box, Typography, Stack, Chip, IconButton, Skeleton, Alert, Tooltip } from '@mui/material';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useBillingHistory } from '@/hooks/useBilling';

const ghs = (n) => `GHS ${parseFloat(n || 0).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;

const TXN_COLORS = {
  success:  { label: 'Paid',     color: '#22c55e', bg: 'rgba(34,197,94,0.1)'   },
  failed:   { label: 'Failed',   color: '#ef4444', bg: 'rgba(239,68,68,0.1)'   },
  pending:  { label: 'Pending',  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
  refunded: { label: 'Refunded', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)'  },
};

export default function BillingHistoryPage() {
  const [page, setPage] = useState(1);
  const { history, loading, error } = useBillingHistory(page);

  if (loading) return <HistorySkeleton />;
  if (error)   return <Alert severity="error" sx={{ borderRadius: '10px' }}>{error?.message || 'Failed to load history'}</Alert>;

  const txns       = history?.results || [];
  const totalPages = history?.total_pages || 1;
  const total      = history?.total || 0;

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px' }} color="text.primary">
            Billing History
          </Typography>
          <Typography variant="caption" color="text.disabled">{total} transaction{total !== 1 ? 's' : ''} total</Typography>
        </Box>
      </Stack>

      <Box sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', overflow: 'hidden' }}>
        {/* Header row */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '140px 1fr 130px 100px 40px', px: 3, py: 1.5, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}>
          {['Date', 'Description', 'Amount', 'Status', ''].map((h) => (
            <Typography key={h} variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.disabled', fontSize: 10 }}>{h}</Typography>
          ))}
        </Box>

        {txns.length === 0 ? (
          <Box sx={{ py: 10, textAlign: 'center' }}>
            <ReceiptLongOutlinedIcon sx={{ fontSize: 32, color: 'text.disabled', mb: 1.5 }} />
            <Typography variant="body2" color="text.disabled">No transactions yet</Typography>
          </Box>
        ) : (
          txns.map((txn, i) => {
            const sc   = TXN_COLORS[txn.status] ?? TXN_COLORS.pending;
            const date = new Date(txn.created_at).toLocaleDateString('en-GH', { month: 'short', day: 'numeric', year: 'numeric' });
            return (
              <Box key={txn.id} sx={{
                display: 'grid', gridTemplateColumns: '140px 1fr 130px 100px 40px', alignItems: 'center',
                px: 3, py: 1.75, borderBottom: i < txns.length - 1 ? '1px solid' : 'none', borderColor: 'divider',
                transition: 'background-color 0.15s', '&:hover': { bgcolor: 'action.hover' },
              }}>
                <Typography variant="body2" color="text.secondary">{date}</Typography>
                <Box>
                  <Typography variant="body2" fontWeight={600} color="text.primary">{txn.type_display}</Typography>
                  <Typography variant="caption" color="text.disabled">{txn.plan_name}{txn.card_last4 ? ` · ${txn.card_last4}` : ''}</Typography>
                </Box>
                <Typography variant="body2" fontWeight={700} color="text.primary">{txn.amount_formatted}</Typography>
                <Chip label={sc.label} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: sc.bg, color: sc.color, borderRadius: '5px', '& .MuiChip-label': { px: 1 }, width: 'fit-content' }} />
                <Tooltip title="Download receipt">
                  <IconButton size="small" sx={{ borderRadius: '6px', color: 'text.disabled', '&:hover': { bgcolor: 'action.selected', color: 'text.primary' } }}>
                    <DownloadOutlinedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            );
          })
        )}
      </Box>

      {/* Pagination */}
      {totalPages > 1 && (
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mt: 3 }}>
          <IconButton size="small" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
            sx={{ borderRadius: '8px', border: '1px solid', borderColor: 'divider' }}>
            <ChevronLeftIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <Typography variant="body2" color="text.secondary">Page {page} of {totalPages}</Typography>
          <IconButton size="small" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
            sx={{ borderRadius: '8px', border: '1px solid', borderColor: 'divider' }}>
            <ChevronRightIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
      )}
    </Box>
  );
}

function HistorySkeleton() {
  return (
    <Box>
      <Skeleton width={200} height={36} sx={{ mb: 0.5 }} />
      <Skeleton width={120} height={16} sx={{ mb: 3 }} />
      <Skeleton height={44} sx={{ borderRadius: '8px 8px 0 0' }} />
      {[...Array(8)].map((_, i) => <Skeleton key={i} height={56} />)}
    </Box>
  );
}