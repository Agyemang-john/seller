'use client';

/**
 * Earnings & payouts (backend: payments/ledger.py via vendor/operations_views.py).
 *
 * Every amount that changes what Negromart owes the store is a statement line:
 * sales, commission, refunds, delivery earnings, payouts. Earnings are held for
 * the plan's payout delay after delivery (the return window), then become
 * available and are paid out on the next payout run.
 */

import { useState } from 'react';
import useSWR from 'swr';
import {
  Alert, Box, Button, Card, Chip, Divider, Grid, MenuItem, Pagination, Skeleton, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { fetcher, SWR_CONFIG } from '@/components/dashboard/DashboardUI';
import { downloadCsv, formatDate, formatMoney } from '@/libs/seller-ops';

const ENTRY_TYPES = [
  { value: '', label: 'All activity' },
  { value: 'sale', label: 'Sales' },
  { value: 'commission', label: 'Commission' },
  { value: 'refund', label: 'Refunds' },
  { value: 'payout', label: 'Payouts' },
  { value: 'adjustment', label: 'Adjustments' },
];

const LINE_STATUS = {
  pending: { label: 'On hold', color: 'warning' },
  available: { label: 'Available', color: 'success' },
  paid: { label: 'Paid out', color: 'default' },
};

export default function Earnings() {
  const { data: balance, error: balanceError } = useSWR('/api/v1/vendor/finance/balance/', fetcher, SWR_CONFIG);
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const ledgerUrl = `/api/v1/vendor/finance/ledger/?page=${page}${type ? `&type=${type}` : ''}`;
  const { data: ledger, isLoading: ledgerLoading } = useSWR(ledgerUrl, fetcher, SWR_CONFIG);
  const [exporting, setExporting] = useState(false);

  if (balanceError) {
    return <Alert severity="error">{balanceError.message || 'Could not load your earnings.'}</Alert>;
  }

  const plan = balance?.plan;
  const exportStatement = async () => {
    setExporting(true);
    try {
      await downloadCsv('/api/v1/vendor/finance/statement.csv', type ? { type } : {}, 'statement.csv');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: 1200 }}>
      {/* ── Balances ─────────────────────────────────────────────── */}
      <Grid container spacing={2}>
        <BalanceCard
          label="Available"
          value={balance?.available}
          hint={balance && `Paid on the next payout run (minimum ${formatMoney(balance.minimum_payout)})`}
          emphasis
        />
        <BalanceCard
          label="On hold"
          value={balance?.pending}
          hint={balance?.next_release_at ? `Next release ${formatDate(balance.next_release_at)}` : 'Nothing on hold'}
        />
        <BalanceCard label="Payout in progress" value={balance?.processing} hint="Being transferred to your account" />
        <BalanceCard label="Paid to date" value={balance?.paid_total} hint="All completed payouts" />
      </Grid>

      {plan && (
        <Typography variant="body2" color="text.secondary">
          On the {plan.name} plan, Negromart's commission is {Number(plan.commission_rate)}% of each sale.
          Earnings are held for {plan.payout_delay_days} day{plan.payout_delay_days === 1 ? '' : 's'} after
          delivery to cover returns.{' '}
          <Link href="/payment">Payout account</Link> · <Link href="/subscribe">Compare plans</Link>
        </Typography>
      )}

      {/* ── Statement ────────────────────────────────────────────── */}
      <Card variant="outlined" sx={{ borderRadius: '12px' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}
               justifyContent="space-between" sx={{ px: 2.5, py: 2 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Statement</Typography>
          <Stack direction="row" spacing={1}>
            <TextField select size="small" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}
                       sx={{ minWidth: 170 }}>
              {ENTRY_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
            </TextField>
            <Tooltip title={plan && !plan.can_export_reports ? 'Statement downloads are included in paid plans.' : ''}>
              <span>
                <Button variant="outlined" size="small" startIcon={<FileDownloadOutlinedIcon />}
                        disabled={exporting || (plan && !plan.can_export_reports)} onClick={exportStatement}
                        sx={{ height: 40, textTransform: 'none' }}>
                  Download CSV
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
        <Divider />

        <TableContainer>
          <Table size="small" sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow>
                {['Date', 'Description', 'Order', 'Status', 'Amount'].map((h, i) => (
                  <TableCell key={h} align={i === 4 ? 'right' : 'left'}
                             sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {ledgerLoading && !ledger ? (
                [0, 1, 2, 3].map((i) => (
                  <TableRow key={i}><TableCell colSpan={5}><Skeleton height={28} /></TableCell></TableRow>
                ))
              ) : !ledger?.results?.length ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ py: 4, color: 'text.secondary' }}>
                    No activity yet. Sales appear here once an order is delivered.
                  </TableCell>
                </TableRow>
              ) : (
                ledger.results.map((line) => {
                  const st = LINE_STATUS[line.status] ?? LINE_STATUS.pending;
                  const amount = Number(line.amount);
                  return (
                    <TableRow key={line.id} hover>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(line.created_at)}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{line.description}</Typography>
                        <Typography variant="caption" color="text.secondary">{line.type_label}</Typography>
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'var(--font-mono-stack), monospace', fontSize: 12 }}>
                        {line.order_number || '—'}
                      </TableCell>
                      <TableCell>
                        <Chip size="small" variant="outlined" label={st.label} color={st.color} />
                        {line.status === 'pending' && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            until {formatDate(line.available_at)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap', fontWeight: 600,
                                                     color: amount < 0 ? 'text.secondary' : 'text.primary' }}>
                        {amount < 0 ? '−' : ''}{formatMoney(Math.abs(amount), line.currency)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {ledger && ledger.count > 25 && (
          <Stack alignItems="center" sx={{ py: 1.5 }}>
            <Pagination count={Math.ceil(ledger.count / 25)} page={page} onChange={(_, p) => setPage(p)} shape="rounded" size="small" />
          </Stack>
        )}
      </Card>

      {/* ── Recent payouts ───────────────────────────────────────── */}
      <Card variant="outlined" sx={{ borderRadius: '12px' }}>
        <Typography sx={{ fontWeight: 700, fontSize: 16, px: 2.5, py: 2 }}>Recent payouts</Typography>
        <Divider />
        {!balance ? (
          <Skeleton variant="rounded" height={80} sx={{ m: 2 }} />
        ) : balance.recent_payouts.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ px: 2.5, py: 2.5 }}>
            No payouts yet.
          </Typography>
        ) : (
          <Stack divider={<Divider />}>
            {balance.recent_payouts.map((p) => (
              <Stack key={p.id} direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2.5, py: 1.5 }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatMoney(p.amount)}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(p.created_at, true)}{p.transaction_id ? ` · Ref ${p.transaction_id}` : ''}
                  </Typography>
                </Box>
                <Chip size="small" variant="outlined" label={p.status_display}
                      color={p.status === 'success' ? 'success' : p.status === 'failed' ? 'error' : 'default'} />
              </Stack>
            ))}
          </Stack>
        )}
      </Card>
    </Stack>
  );
}

function BalanceCard({ label, value, hint, emphasis = false }) {
  return (
    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
      <Card variant="outlined" sx={{ p: 2.25, borderRadius: '12px', height: '100%',
                                     borderColor: emphasis ? 'primary.main' : 'divider' }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{label}</Typography>
        {value === undefined ? (
          <Skeleton width={120} height={36} />
        ) : (
          <Typography sx={{ fontSize: 24, fontWeight: 700, mt: 0.5 }}>{formatMoney(value)}</Typography>
        )}
        {hint && <Typography variant="caption" color="text.secondary">{hint}</Typography>}
      </Card>
    </Grid>
  );
}
