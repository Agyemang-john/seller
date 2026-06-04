"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { createAxiosClient } from '@/utils/clientFetch';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Box, Stack, Typography, Tabs, Tab, TextField, InputAdornment,
  Chip, Button, Skeleton, Tooltip, Avatar, Paper, IconButton,
  Select, MenuItem, FormControl, Pagination,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  useMediaQuery, useTheme,
} from '@mui/material';
import SearchIcon         from '@mui/icons-material/Search';
import RefreshIcon        from '@mui/icons-material/Refresh';
import ArrowForwardIcon   from '@mui/icons-material/ArrowForward';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ORDER_STATUS, getStatusEntry, CATEGORICAL_COLORS } from '@/theme/designTokens';

dayjs.extend(relativeTime);

// ── Status configs (sourced from the single design base) ────────────────────────

const STATUS_TABS = [
  { value: '',           label: 'All orders'  },
  { value: 'pending',    label: 'Pending'     },
  { value: 'processing', label: 'Processing'  },
  { value: 'shipped',    label: 'Shipped'     },
  { value: 'delivered',  label: 'Delivered'   },
  { value: 'canceled',   label: 'Canceled'    },
];

const PAGE_SIZES = [10, 25, 50];

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ value }) {
  const theme = useTheme();
  const entry = getStatusEntry(ORDER_STATUS, value);
  const cfg = theme.palette.status[entry.hue];
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.65,
      px: 1.25, py: 0.45, borderRadius: '6px', bgcolor: cfg.bg,
    }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: cfg.dot, flexShrink: 0 }} />
      <Typography sx={{ fontSize: 11, fontWeight: 700, color: cfg.text, letterSpacing: '0.05em', lineHeight: 1, whiteSpace: 'nowrap' }}>
        {entry.label.toUpperCase()}
      </Typography>
    </Box>
  );
}

function CustomerAvatar({ email }) {
  const initial = email ? email[0].toUpperCase() : '?';
  const bg = email ? CATEGORICAL_COLORS[email.charCodeAt(0) % CATEGORICAL_COLORS.length] : CATEGORICAL_COLORS[0];
  return (
    <Avatar sx={{ width: 28, height: 28, fontSize: 11, fontWeight: 700, bgcolor: bg, flexShrink: 0 }}>
      {initial}
    </Avatar>
  );
}

function SkeletonRows({ count = 6 }) {
  return Array.from({ length: count }).map((_, i) => (
    <TableRow key={i} sx={{ '&:last-child td': { border: 0 } }}>
      {[120, 200, 110, 90, 100, 90, 90, 60].map((w, j) => (
        <TableCell key={j} sx={{ py: 2.25 }}>
          <Skeleton variant="rounded" width={w} height={j === 5 || j === 6 ? 22 : 16} sx={{ borderRadius: j === 5 || j === 6 ? '6px' : '4px' }} />
        </TableCell>
      ))}
    </TableRow>
  ));
}

function EmptyState({ filtered, onClear }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 12, px: 3 }}>
      <Box sx={{ width: 64, height: 64, borderRadius: '18px', bgcolor: 'action.selected', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
        <ShoppingBagOutlinedIcon sx={{ fontSize: 28, color: 'text.secondary' }} />
      </Box>
      <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', mb: 1 }} color="text.primary">
        {filtered ? 'No orders match' : 'No orders yet'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, lineHeight: 1.75, mb: 3 }}>
        {filtered
          ? 'Try a different status filter or clear your search.'
          : 'When customers place orders for your products, they will appear here.'}
      </Typography>
      {filtered && (
        <Button size="small" variant="outlined" onClick={onClear}
          sx={{ borderRadius: '8px', fontWeight: 600, fontSize: 12, borderColor: 'divider', color: 'text.secondary', '&:hover': { borderColor: 'text.primary', color: 'text.primary' } }}>
          Clear filters
        </Button>
      )}
    </Box>
  );
}

function MobileOrderCard({ order, onView }) {
  const amount = parseFloat(order.grand_total || 0);
  return (
    <Paper
      variant="outlined"
      onClick={() => onView(order.id)}
      sx={{
        p: 2, borderRadius: '14px', cursor: 'pointer', mb: 1.5,
        transition: 'box-shadow 0.2s, border-color 0.2s',
        '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderColor: 'text.disabled' },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
        <Box>
          <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: 'text.primary', mb: 0.25 }}>
            {order.order_number || `#${order.id}`}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            {dayjs(order.date_created).fromNow()} · {dayjs(order.date_created).format('MMM D, YYYY')}
          </Typography>
        </Box>
        <StatusBadge value={order.status} />
      </Stack>

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
          <CustomerAvatar email={order.user_email} />
          <Typography variant="caption" color="text.secondary"
            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {order.user_email}
          </Typography>
        </Stack>
        <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, fontWeight: 700, flexShrink: 0, ml: 1 }} color="text.primary">
          GHS {amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Typography>
      </Stack>

      {order.vendor_delivery_status && (
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.25 }}>
          <Typography variant="caption" color="text.disabled">
            {(order.payment_method || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </Typography>
          <StatusBadge value={order.vendor_delivery_status} />
        </Stack>
      )}
    </Paper>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function OrderList() {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();
  const theme        = useTheme();
  const isMobile     = useMediaQuery(theme.breakpoints.down('sm'));

  // Derive state from URL params
  const page     = Math.max(1, parseInt(searchParams.get('page')      || '1',  10));
  const pageSize = parseInt(searchParams.get('page_size') || '10', 10);
  const status   = searchParams.get('status') || '';
  const search   = searchParams.get('search') || '';

  const [data,        setData]       = useState([]);
  const [totalCount,  setTotalCount] = useState(0);
  const [isLoading,   setIsLoading]  = useState(false);
  const [searchInput, setSearchInput] = useState(search);

  // Update search input when URL changes (e.g. browser back)
  useEffect(() => { setSearchInput(search); }, [search]);

  // Update URL params without full navigation
  const navigate = useCallback((overrides = {}) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(overrides).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') p.set(k, String(v));
      else p.delete(k);
    });
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  // Fetch orders from API
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const axiosClient = createAxiosClient();
      const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
      if (status) params.set('status', status);
      if (search) params.set('search', search);
      const res = await axiosClient.get('/api/v1/vendor/orders/', { params });
      setData(res.data.results || res.data.items || []);
      setTotalCount(res.data.count || 0);
    } catch (err) {
      console.error('Failed to load orders:', err?.response?.data?.detail || err.message);
      setData([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, status, search]);

  useEffect(() => { loadData(); }, [loadData]);

  // Debounced search
  const debounceRef = useRef(null);
  const handleSearchInput = useCallback((value) => {
    setSearchInput(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => navigate({ search: value, page: '' }), 450);
  }, [navigate]);

  const handleView = useCallback((id) => router.push(`/orders/${id}/detail`), [router]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const rangeStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd   = Math.min(page * pageSize, totalCount);
  const isFiltered = !!(status || search);

  const formatPayment = (method) =>
    (method || '—').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Box>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'flex-end' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography sx={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: { xs: 22, sm: 28, md: 36 }, fontWeight: 700,
            letterSpacing: '-1px', lineHeight: 1, mb: 0.5,
          }} color="text.primary">
            Orders
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isLoading
              ? 'Loading…'
              : totalCount === 0
              ? 'No orders yet'
              : `${totalCount.toLocaleString()} order${totalCount !== 1 ? 's' : ''}${status ? ` · ${STATUS_TABS.find(t => t.value === status)?.label}` : ''}`}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
          <TextField
            size="small"
            placeholder="Search by order # or email…"
            value={searchInput}
            onChange={(e) => handleSearchInput(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 17, color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: { xs: '100%', sm: 230 },
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                '& fieldset': { borderColor: 'divider' },
                '&:hover fieldset': { borderColor: 'text.disabled' },
              },
            }}
          />
          <Tooltip title={isLoading ? 'Loading…' : 'Refresh'} placement="top">
            <span>
              <IconButton
                onClick={loadData}
                disabled={isLoading}
                size="small"
                sx={{
                  border: '1px solid', borderColor: 'divider',
                  borderRadius: '10px', p: 0.875,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <RefreshIcon sx={{
                  fontSize: 18,
                  ...(isLoading && {
                    animation: 'spin 0.9s linear infinite',
                    '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
                  }),
                }} />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      {/* ── Status filter tabs ───────────────────────────────────────────── */}
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 2.5, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
        <Tabs
          value={status}
          onChange={(_, v) => navigate({ status: v, page: '' })}
          variant="scrollable"
          scrollButtons={false}
          TabIndicatorProps={{ style: { height: 2, borderRadius: '2px' } }}
          sx={{
            minHeight: 42,
            '& .MuiTab-root': {
              minHeight: 42, fontSize: 13, fontWeight: 600,
              px: 2, py: 0, textTransform: 'none', color: 'text.secondary',
            },
            '& .Mui-selected': { color: 'text.primary' },
          }}
        >
          {STATUS_TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} disableRipple />
          ))}
        </Tabs>
      </Box>

      {/* ── Mobile: card list ────────────────────────────────────────────── */}
      {isMobile && (
        <Box>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Paper key={i} variant="outlined" sx={{ p: 2, borderRadius: '14px', mb: 1.5 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
                  <Box>
                    <Skeleton variant="rounded" width={130} height={16} sx={{ mb: 0.75, borderRadius: '4px' }} />
                    <Skeleton variant="rounded" width={90} height={12} sx={{ borderRadius: '4px' }} />
                  </Box>
                  <Skeleton variant="rounded" width={72} height={24} sx={{ borderRadius: '6px' }} />
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Skeleton variant="circular" width={28} height={28} />
                    <Skeleton variant="rounded" width={140} height={14} sx={{ borderRadius: '4px' }} />
                  </Stack>
                  <Skeleton variant="rounded" width={70} height={20} sx={{ borderRadius: '4px' }} />
                </Stack>
              </Paper>
            ))
          ) : data.length === 0 ? (
            <EmptyState filtered={isFiltered} onClear={() => navigate({ status: '', search: '', page: '' })} />
          ) : (
            data.map((order) => (
              <MobileOrderCard key={order.id} order={order} onView={handleView} />
            ))
          )}

          {/* Mobile pagination */}
          {!isLoading && totalPages > 1 && data.length > 0 && (
            <Stack alignItems="center" sx={{ mt: 3, mb: 1 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, p) => navigate({ page: String(p) })}
                shape="rounded"
                size="small"
                sx={{
                  '& .MuiPaginationItem-root': { borderRadius: '8px', fontWeight: 600, fontSize: 12 },
                  '& .MuiPaginationItem-root.Mui-selected': {
                    bgcolor: 'text.primary', color: 'background.paper',
                    '&:hover': { bgcolor: 'text.secondary' },
                  },
                }}
              />
            </Stack>
          )}
        </Box>
      )}

      {/* ── Desktop: table ───────────────────────────────────────────────── */}
      {!isMobile && (
        <Paper variant="outlined" sx={{ borderRadius: '16px', overflow: 'hidden' }}>
          <TableContainer>
            <Table sx={{ minWidth: 860 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  {['Order', 'Customer', 'Date', 'Amount', 'Payment', 'Status', 'Delivery', ''].map((h, i) => (
                    <TableCell
                      key={i}
                      align={i === 7 ? 'right' : 'left'}
                      sx={{
                        fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em',
                        color: 'text.disabled', textTransform: 'uppercase',
                        py: 1.5, pr: i === 7 ? 2.5 : undefined,
                        borderBottom: '1px solid', borderColor: 'divider',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {isLoading ? (
                  <SkeletonRows count={Math.min(pageSize, 8)} />
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ p: 0, border: 0 }}>
                      <EmptyState
                        filtered={isFiltered}
                        onClear={() => navigate({ status: '', search: '', page: '' })}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((order) => {
                    const amount = parseFloat(order.grand_total || 0);
                    return (
                      <TableRow
                        key={order.id}
                        onClick={() => handleView(order.id)}
                        sx={{
                          cursor: 'pointer',
                          transition: 'background 0.15s',
                          '&:hover': { bgcolor: 'action.hover' },
                          '&:last-child td': { borderBottom: 0 },
                        }}
                      >
                        {/* Order # */}
                        <TableCell sx={{ py: 2.25 }}>
                          <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13 }} color="text.primary">
                            {order.order_number || `#${order.id}`}
                          </Typography>
                        </TableCell>

                        {/* Customer */}
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <CustomerAvatar email={order.user_email} />
                            <Typography sx={{ fontSize: 12, color: 'text.secondary', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {order.user_email || '—'}
                            </Typography>
                          </Stack>
                        </TableCell>

                        {/* Date */}
                        <TableCell>
                          <Typography sx={{ fontSize: 12, whiteSpace: 'nowrap' }} color="text.primary">
                            {dayjs(order.date_created).format('MMM D, YYYY')}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            {dayjs(order.date_created).fromNow()}
                          </Typography>
                        </TableCell>

                        {/* Amount */}
                        <TableCell>
                          <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, whiteSpace: 'nowrap' }} color="text.primary">
                            GHS {amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Typography>
                        </TableCell>

                        {/* Payment */}
                        <TableCell>
                          <Typography sx={{ fontSize: 12, whiteSpace: 'nowrap' }} color="text.secondary">
                            {formatPayment(order.payment_method)}
                          </Typography>
                        </TableCell>

                        {/* Order status */}
                        <TableCell>
                          <StatusBadge value={order.status} />
                        </TableCell>

                        {/* Delivery status */}
                        <TableCell>
                          {order.vendor_delivery_status
                            ? <StatusBadge value={order.vendor_delivery_status} />
                            : <Typography variant="caption" color="text.disabled">—</Typography>}
                        </TableCell>

                        {/* Action */}
                        <TableCell align="right" sx={{ pr: 2.5 }}>
                          <Button
                            size="small"
                            endIcon={<ArrowForwardIcon sx={{ fontSize: 13 }} />}
                            onClick={(e) => { e.stopPropagation(); handleView(order.id); }}
                            sx={{
                              fontSize: 12, fontWeight: 600, borderRadius: '8px',
                              color: 'text.primary', bgcolor: 'action.hover', px: 1.5,
                              '&:hover': { bgcolor: 'action.selected' },
                              whiteSpace: 'nowrap',
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Table footer */}
          {(totalCount > 0 || isLoading) && (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems="center"
              sx={{ px: 2.5, py: 2, borderTop: '1px solid', borderColor: 'divider', gap: 2 }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="caption" color="text.secondary">
                  {isLoading
                    ? 'Loading…'
                    : `Showing ${rangeStart}–${rangeEnd} of ${totalCount.toLocaleString()} order${totalCount !== 1 ? 's' : ''}`}
                </Typography>
                <FormControl size="small">
                  <Select
                    value={pageSize}
                    onChange={(e) => navigate({ page_size: String(e.target.value), page: '' })}
                    sx={{ fontSize: 12, borderRadius: '8px', '& fieldset': { borderColor: 'divider' } }}
                  >
                    {PAGE_SIZES.map((s) => (
                      <MenuItem key={s} value={s} sx={{ fontSize: 12 }}>{s} per page</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              {totalPages > 1 && (
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, p) => navigate({ page: String(p) })}
                  shape="rounded"
                  siblingCount={1}
                  size="small"
                  sx={{
                    '& .MuiPaginationItem-root': { borderRadius: '8px', fontWeight: 600, fontSize: 12 },
                    '& .MuiPaginationItem-root.Mui-selected': {
                      bgcolor: 'text.primary', color: 'background.paper',
                      '&:hover': { bgcolor: 'text.secondary' },
                    },
                  }}
                />
              )}
            </Stack>
          )}
        </Paper>
      )}
    </Box>
  );
}
