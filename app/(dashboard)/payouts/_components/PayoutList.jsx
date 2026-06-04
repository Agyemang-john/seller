'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, Stack, Typography, Avatar, Chip, Button, Skeleton, Alert,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  Tooltip, IconButton, Divider,
} from '@mui/material';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { alpha } from '@mui/material/styles';
import { createAxiosClient } from '@/utils/clientFetch';

// status key → design-base hue token + icon
const STATUS_META = {
  success: { hue: 'green', Icon: CheckCircleRoundedIcon },
  failed: { hue: 'red', Icon: ErrorOutlineRoundedIcon },
  pending: { hue: 'amber', Icon: HourglassEmptyRoundedIcon },
};

const money = (amount, currency) =>
  `${currency || ''} ${Number(amount || 0).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`.trim();

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GH', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

function StatusChip({ status, label }) {
  const meta = STATUS_META[status] || { hue: 'slate', Icon: HourglassEmptyRoundedIcon };
  const { Icon } = meta;
  return (
    <Chip
      size="small"
      icon={<Icon sx={{ fontSize: '15px !important' }} />}
      label={label || status || '—'}
      sx={{
        fontWeight: 700, fontSize: 11, height: 24, borderRadius: '8px',
        bgcolor: `status.${meta.hue}.bg`,
        color: `status.${meta.hue}.text`,
        '& .MuiChip-icon': { color: `status.${meta.hue}.text`, ml: 0.5 },
        '& .MuiChip-label': { px: 1 },
      }}
    />
  );
}

function SummaryCard({ icon, label, value, hue = 'blue', accent = false }) {
  return (
    <Card
      variant="outlined"
      sx={{
        p: 2.5, borderRadius: '18px', borderColor: 'divider', height: '100%',
        display: 'flex', alignItems: 'center', gap: 2,
      }}
    >
      <Avatar
        variant="rounded"
        sx={{
          width: 44, height: 44, borderRadius: '12px',
          bgcolor: (t) => alpha(hue === 'blue' ? t.palette.brand.blue : t.palette.status[hue].dot, 0.14),
          color: hue === 'blue' ? 'brand.blue' : `status.${hue}.dot`,
        }}
      >
        {icon}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: 10 }}>
          {label}
        </Typography>
        <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 24, lineHeight: 1.1 }} color="text.primary">
          {value}
        </Typography>
      </Box>
    </Card>
  );
}

const PayoutList = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const axiosClient = createAxiosClient();

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/api/v1/vendor/payouts/');
      setPayouts(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      setError('Failed to load payouts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const currency = payouts[0]?.currency || 'GHS';
  const totalPaid = payouts.filter((p) => p.status === 'success').reduce((s, p) => s + Number(p.amount || 0), 0);
  const totalPending = payouts.filter((p) => p.status === 'pending').reduce((s, p) => s + Number(p.amount || 0), 0);

  if (loading) {
    return (
      <Stack spacing={2}>
        <Grid container spacing={2}>
          {[0, 1, 2].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 4 }}>
              <Skeleton variant="rounded" height={92} sx={{ borderRadius: '18px' }} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rounded" height={360} sx={{ borderRadius: '20px' }} />
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        sx={{ borderRadius: '14px' }}
        action={
          <Button color="inherit" size="small" startIcon={<RefreshRoundedIcon />} onClick={fetchPayouts}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  const orderNumbers = (payout) =>
    (payout.orders ?? payout.order ?? []).map((o) => o.order_number).filter(Boolean).join(', ') || '—';

  return (
    <Stack spacing={3}>
      {/* Summary */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <SummaryCard hue="green" icon={<PaidOutlinedIcon />} label="Total paid out" value={money(totalPaid, currency)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <SummaryCard hue="amber" icon={<HourglassEmptyRoundedIcon />} label="Pending" value={money(totalPending, currency)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <SummaryCard hue="blue" icon={<TrendingUpRoundedIcon />} label="Total payouts" value={payouts.length} />
        </Grid>
      </Grid>

      {/* Payouts */}
      <Card variant="outlined" sx={{ borderRadius: '20px', borderColor: 'divider', overflow: 'hidden' }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: { xs: 2.5, sm: 3 }, py: 2.5 }}>
          <AccountBalanceWalletOutlinedIcon sx={{ color: 'brand.blue' }} />
          <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', flex: 1 }} color="text.primary">
            Your Payouts
          </Typography>
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={fetchPayouts} sx={{ borderRadius: '8px' }}>
              <RefreshRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
        <Divider />

        {payouts.length === 0 ? (
          <Box sx={{ py: 10, px: 3, textAlign: 'center' }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '18px', bgcolor: 'action.selected', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <ReceiptLongOutlinedIcon sx={{ fontSize: 28, color: 'text.secondary' }} />
            </Box>
            <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, mb: 0.5 }} color="text.primary">
              No payouts yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320, mx: 'auto', lineHeight: 1.7 }}>
              Once your delivered orders are settled, your payouts will appear here.
            </Typography>
          </Box>
        ) : (
          <>
            {/* Desktop table */}
            <TableContainer sx={{ display: { xs: 'none', md: 'block' } }}>
              <Table sx={{ '& td, & th': { borderColor: 'divider' } }}>
                <TableHead>
                  <TableRow sx={{ '& th': { bgcolor: 'background.default', fontWeight: 700, fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'text.secondary', whiteSpace: 'nowrap' } }}>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Product Total</TableCell>
                    <TableCell>Delivery Fee</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Transaction ID</TableCell>
                    <TableCell>Orders</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payouts.map((payout) => (
                    <TableRow key={payout.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" color="text.secondary">{fmtDate(payout.created_at)}</Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" fontWeight={700} color="text.primary">{money(payout.amount, payout.currency)}</Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" color="text.secondary">{money(payout.product_total, payout.currency)}</Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" color="text.secondary">{money(payout.delivery_fee, payout.currency)}</Typography>
                      </TableCell>
                      <TableCell>
                        <StatusChip status={payout.status} label={payout.status_display} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace" color="text.secondary">{payout.transaction_id || 'N/A'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{orderNumbers(payout)}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Mobile cards */}
            <Stack spacing={1.5} sx={{ display: { xs: 'flex', md: 'none' }, p: 2 }}>
              {payouts.map((payout) => (
                <Card key={payout.id} variant="outlined" sx={{ p: 2, borderRadius: '14px', borderColor: 'divider' }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                    <Typography variant="body2" fontWeight={700} color="text.primary">{money(payout.amount, payout.currency)}</Typography>
                    <StatusChip status={payout.status} label={payout.status_display} />
                  </Stack>
                  <Stack spacing={0.75}>
                    <Row label="Date" value={fmtDate(payout.created_at)} />
                    <Row label="Product total" value={money(payout.product_total, payout.currency)} />
                    <Row label="Delivery fee" value={money(payout.delivery_fee, payout.currency)} />
                    <Row label="Transaction ID" value={payout.transaction_id || 'N/A'} mono />
                    <Row label="Orders" value={orderNumbers(payout)} />
                  </Stack>
                </Card>
              ))}
            </Stack>
          </>
        )}
      </Card>
    </Stack>
  );
};

function Row({ label, value, mono }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={2}>
      <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 600 }}>{label}</Typography>
      <Typography variant="caption" color="text.secondary" fontFamily={mono ? 'monospace' : undefined} sx={{ textAlign: 'right', wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </Stack>
  );
}

export default PayoutList;
