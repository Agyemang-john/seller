'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Box, Grid, Typography, Stack, Button, Chip, IconButton,
  InputAdornment, TextField, MenuItem, Select, FormControl, Tooltip,
  Pagination,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Swal from 'sweetalert2';
import { createAxiosClient } from '@/utils/clientFetch';
import DeleteConfirmDialog from './Deleteconfirmdialog';
import BulkUploadButton from './BulkUploadButton';
import ProductListSkeleton from './Productlistskeleton';
import ProductListError from './Productlisterror';

const PAGE_SIZE = 20;

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  published: { label: 'Live',       color: '#22c55e', bg: 'rgba(34,197,94,0.1)'   },
  in_review: { label: 'In Review',  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
  draft:     { label: 'Draft',      color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
  disabled:  { label: 'Disabled',   color: '#ef4444', bg: 'rgba(239,68,68,0.1)'   },
  rejected:  { label: 'Rejected',   color: '#dc2626', bg: 'rgba(220,38,38,0.1)'   },
};
function getStatus(s) {
  return STATUS_CONFIG[s] ?? { label: s, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' };
}

// ── Product card ──────────────────────────────────────────────────────────────
function ProductCard({ product, onEdit, onDelete, onView, index }) {
  const p          = product.product ?? product;
  const st         = getStatus(p.status);
  const inStock    = (p.total_quantity ?? 0) > 0;
  const price      = typeof p.price === 'string' ? parseFloat(p.price) : (p.price ?? 0);
  const oldPrice   = typeof p.old_price === 'string' ? parseFloat(p.old_price) : p.old_price;
  const hasDiscount = oldPrice && oldPrice > price;
  const views      = p.views ?? 0;

  return (
    <Box sx={{
      borderRadius: '16px', border: '1px solid', borderColor: 'divider',
      overflow: 'hidden', bgcolor: 'background.paper',
      display: 'flex', flexDirection: 'column',
      transition: 'box-shadow 0.2s, transform 0.2s, border-color 0.2s',
      '&:hover': { boxShadow: '0 8px 32px rgba(0,0,0,0.09)', transform: 'translateY(-2px)', borderColor: 'text.disabled' },
      animation: 'fadeUp 0.4s ease both',
      animationDelay: `${index * 40}ms`,
      '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
    }}>
      {/* Image */}
      <Box sx={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', bgcolor: 'action.hover' }}>
        <Box component="img" src={p.image || '/logo-1.png'} alt={p.title}
          onError={(e) => { e.target.src = '/logo-1.png'; }}
          sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.35s ease', '&:hover': { transform: 'scale(1.04)' } }} />
        <Box sx={{ position: 'absolute', top: 8, left: 8, px: 1.25, py: 0.35, borderRadius: '6px', bgcolor: st.bg, backdropFilter: 'blur(4px)', border: `1px solid ${st.color}22` }}>
          <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: st.color, lineHeight: 1.4 }}>{st.label.toUpperCase()}</Typography>
        </Box>
        {!inStock && (
          <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ color: '#ffffff', fontWeight: 700, fontSize: 12, letterSpacing: '0.1em' }}>OUT OF STOCK</Typography>
          </Box>
        )}
        {hasDiscount && (
          <Box sx={{ position: 'absolute', top: 8, right: 8, px: 1, py: 0.3, borderRadius: '6px', bgcolor: '#ef4444' }}>
            <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>
              -{Math.round(((oldPrice - price) / oldPrice) * 100)}%
            </Typography>
          </Box>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ p: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 1, minHeight: '2.8em' }} color="text.primary">
          {p.title}
        </Typography>
        <Stack direction="row" alignItems="baseline" spacing={0.75} sx={{ mb: 1 }}>
          <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, lineHeight: 1 }} color="text.primary">
            GHS {price.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
          {hasDiscount && (
            <Typography sx={{ fontSize: 11, textDecoration: 'line-through' }} color="text.disabled">
              {oldPrice.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
            </Typography>
          )}
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 'auto' }}>
          <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: '0.04em', color: inStock ? '#22c55e' : '#ef4444' }}>
            {inStock ? `${p.total_quantity} in stock` : 'Out of stock'}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Tooltip title={`${views.toLocaleString()} view${views !== 1 ? 's' : ''}`} placement="top">
              <Stack direction="row" alignItems="center" spacing={0.3}>
                <VisibilityOutlinedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, fontWeight: 600 }}>
                  {views.toLocaleString()}
                </Typography>
              </Stack>
            </Tooltip>
            {p.sku && <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>{p.sku}</Typography>}
          </Stack>
        </Stack>
      </Box>

      {/* Actions */}
      <Stack direction="row" sx={{ px: 1.5, py: 1.25, borderTop: '1px solid', borderColor: 'divider', gap: 0.75 }}>
        <Button size="small" startIcon={<EditOutlinedIcon sx={{ fontSize: 14 }} />} onClick={() => onEdit(p.id)}
          sx={{ flex: 1, fontSize: 12, fontWeight: 600, borderRadius: '8px', color: 'text.primary', bgcolor: 'action.hover', '&:hover': { bgcolor: 'action.selected' } }}>
          Edit
        </Button>
        <Tooltip title="View analytics" placement="top">
          <IconButton size="small" onClick={() => onView(p.id)}
            sx={{ borderRadius: '8px', color: 'text.disabled', '&:hover': { bgcolor: 'action.selected', color: 'text.primary' } }}>
            <BarChartOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete product" placement="top">
          <IconButton size="small" onClick={() => onDelete(p.id, p.title)}
            sx={{ borderRadius: '8px', color: 'text.disabled', '&:hover': { bgcolor: 'error.lighter', color: 'error.main' } }}>
            <DeleteOutlineIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ onAdd, filtered }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', py: 14, px: 3, borderRadius: '20px', border: '1px dashed', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Box sx={{ width: 64, height: 64, borderRadius: '18px', bgcolor: 'action.selected', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
        <InventoryOutlinedIcon sx={{ fontSize: 28, color: 'text.secondary' }} />
      </Box>
      <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', mb: 1 }} color="text.primary">
        {filtered ? 'No results found' : 'No products yet'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320, lineHeight: 1.75, mb: 3.5 }}>
        {filtered ? "Try adjusting your search or filter." : 'Start building your catalog. Add your first product to get listed on Negromart.'}
      </Typography>
      {!filtered && (
        <Button variant="contained" disableElevation startIcon={<AddIcon />} onClick={onAdd}
          sx={{ bgcolor: 'text.primary', color: 'background.paper', borderRadius: '10px', fontWeight: 600, '&:hover': { bgcolor: 'text.secondary' } }}>
          Add first product
        </Button>
      )}
    </Box>
  );
}

// ── Main ProductList ──────────────────────────────────────────────────────────
export default function ProductList({ canBulkUpload = false }) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const [search,        setSearch]        = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter,  setFilter]        = useState('all');
  const [deleting,      setDeleting]      = useState(null);
  const [dialogOpen,    setDialogOpen]    = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  // Server-driven data
  const [products,     setProducts]     = useState([]);
  const [count,        setCount]        = useState(0);   // items matching search/filter
  const [totalPages,   setTotalPages]   = useState(1);
  const [statusCounts, setStatusCounts] = useState({});
  const [catalogTotal, setCatalogTotal] = useState(0);   // whole catalog, ignores filters
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [hasLoaded,    setHasLoaded]    = useState(false);

  // Current page from URL — survives refresh
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  // Navigate to a specific page (persisted in the URL) without scrolling to top
  const goToPage = useCallback((page) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  // Debounce the search box so we don't hit the API on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 when the search term or status filter changes (skip mount)
  const isMount = useRef(true);
  useEffect(() => {
    if (isMount.current) { isMount.current = false; return; }
    if (currentPage !== 1) goToPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, statusFilter]);

  // ── Fetch the current page from the server ─────────────────────────────────
  const reqSeq = useRef(0);
  const fetchProducts = useCallback(async () => {
    const seq = ++reqSeq.current;
    setLoading(true);
    setError(null);
    try {
      const client = createAxiosClient();
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('page_size', String(PAGE_SIZE));
      if (debouncedSearch)           params.set('search', debouncedSearch);
      if (statusFilter !== 'all')    params.set('status', statusFilter);

      const { data } = await client.get(`/api/v1/vendor/products/?${params.toString()}`);
      if (seq !== reqSeq.current) return; // a newer request superseded this one

      setProducts(data.results || []);
      setCount(data.count ?? (data.results?.length || 0));
      setTotalPages(data.total_pages || 1);
      setStatusCounts(data.status_counts || {});
      setCatalogTotal(data.catalog_total ?? 0);

      // Backend clamps out-of-range pages — keep the URL in sync if it did.
      if (data.current_page && data.current_page !== currentPage) {
        goToPage(data.current_page);
      }
    } catch (err) {
      if (seq !== reqSeq.current) return;
      const msg = err?.response?.data?.detail
        || err?.response?.data?.error
        || err?.message
        || 'Could not load your products. Please try again.';
      setError(msg);
    } finally {
      if (seq === reqSeq.current) {
        setLoading(false);
        setHasLoaded(true);
      }
    }
  }, [currentPage, debouncedSearch, statusFilter, goToPage]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleEdit = useCallback((id) => router.push(`/products/product/${id}`), [router]);
  const handleView = useCallback((id) => router.push(`/products/product/${id}/view`), [router]);

  const handleDeleteIntent = useCallback((id, title) => {
    setPendingDelete({ id, title });
    setDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!pendingDelete) return;
    const { id } = pendingDelete;
    setDeleting(id);
    setDialogOpen(false);
    try {
      const client = createAxiosClient();
      await client.delete(`/api/v1/vendor/products/${id}/`);
      Swal.fire({ title: 'Deleted', text: 'Product removed from your catalog.', icon: 'success', timer: 2000, showConfirmButton: false });
      // If that was the last item on the page, step back a page; else refetch.
      if (products.length === 1 && currentPage > 1) {
        goToPage(currentPage - 1);
      } else {
        fetchProducts();
      }
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.response?.data?.error || 'Failed to delete product.';
      Swal.fire({ title: 'Error', text: msg, icon: 'error' });
    } finally {
      setDeleting(null);
      setPendingDelete(null);
    }
  }, [pendingDelete, products.length, currentPage, goToPage, fetchProducts]);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setPendingDelete(null);
  }, []);

  const isFiltered = !!debouncedSearch || statusFilter !== 'all';

  // Range label for current page (server-paginated)
  const rangeStart = count === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd   = Math.min(currentPage * PAGE_SIZE, count);

  // First load — full skeleton. Subsequent fetches keep the UI mounted so the
  // search box doesn't lose focus and the page doesn't jump.
  if (loading && !hasLoaded) return <ProductListSkeleton />;
  if (error && !hasLoaded)   return <ProductListError message={error} onRetry={fetchProducts} />;

  return (
    <Box>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'flex-end' }}
        sx={{ mb: 3.5 }}
        spacing={2}
      >
        <Box>
          <Typography sx={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: { xs: 30, md: 36 }, fontWeight: 700,
            letterSpacing: '-1px', lineHeight: 1, mb: 0.5,
          }} color="text.primary">
            My Products
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {catalogTotal === 0
              ? 'Your catalog is empty'
              : `${catalogTotal} product${catalogTotal !== 1 ? 's' : ''} in your catalog`}
          </Typography>
        </Box>

        {/* ── Action buttons ────────────────────────────────────────────── */}
        <Stack direction="row" spacing={1} flexShrink={0} alignItems="center">
          <BulkUploadButton canBulkUpload={canBulkUpload} />
          <Button
            variant="contained"
            disableElevation
            startIcon={<AddIcon />}
            onClick={() => router.push('/products/product')}
            sx={{
              bgcolor: 'text.primary', color: 'background.paper',
              borderRadius: '10px', fontWeight: 600, fontSize: 13, px: 2.5, py: 1.25,
              '&:hover': { bgcolor: 'text.secondary' },
            }}
          >
            Add product
          </Button>
        </Stack>
      </Stack>

      {/* Search + filter */}
      {(catalogTotal > 0 || isFiltered) && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 3 }}>
          <TextField
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment> }}
            sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: '10px', '& fieldset': { borderColor: 'divider' }, '&:hover fieldset': { borderColor: 'text.disabled' } } }}
          />
          <FormControl size="small" sx={{ minWidth: 148 }}>
            <Select
              value={statusFilter}
              onChange={(e) => setFilter(e.target.value)}
              startAdornment={<FilterListIcon sx={{ fontSize: 16, mr: 0.75, color: 'text.disabled' }} />}
              sx={{ borderRadius: '10px', '& fieldset': { borderColor: 'divider' } }}
            >
              <MenuItem value="all">All status</MenuItem>
              {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                <MenuItem key={val} value={val}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: cfg.color, flexShrink: 0 }} />
                    <span>{cfg.label}</span>
                    {statusCounts[val] && <Typography component="span" variant="caption" color="text.disabled" sx={{ ml: 0.5 }}>({statusCounts[val]})</Typography>}
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      )}

      {/* Status chip quick-filters */}
      {catalogTotal > 3 && (
        <Stack direction="row" spacing={0.75} sx={{ mb: 2.5, overflowX: 'auto', pb: 0.5, '&::-webkit-scrollbar': { display: 'none' } }}>
          <Chip
            label={`All (${catalogTotal})`}
            size="small"
            onClick={() => setFilter('all')}
            sx={{ borderRadius: '8px', fontWeight: 600, fontSize: 11, flexShrink: 0, bgcolor: statusFilter === 'all' ? 'text.primary' : 'action.hover', color: statusFilter === 'all' ? 'background.paper' : 'text.secondary' }}
          />
          {Object.entries(statusCounts).map(([s, c]) => {
            const cfg = getStatus(s);
            return (
              <Chip
                key={s}
                label={`${cfg.label} (${c})`}
                size="small"
                onClick={() => setFilter(s === statusFilter ? 'all' : s)}
                sx={{ borderRadius: '8px', fontWeight: 600, fontSize: 11, flexShrink: 0, bgcolor: statusFilter === s ? cfg.color : 'action.hover', color: statusFilter === s ? '#ffffff' : 'text.secondary' }}
              />
            );
          })}
        </Stack>
      )}

      {/* Grid */}
      {products.length === 0 ? (
        <EmptyState onAdd={() => router.push('/products/product')} filtered={isFiltered} />
      ) : (
        <>
          {/* Range counter */}
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 1.5 }}>
            {isFiltered
              ? `Showing ${rangeStart}–${rangeEnd} of ${count} matching products`
              : `Showing ${rangeStart}–${rangeEnd} of ${count} products`}
          </Typography>

          <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s', pointerEvents: loading ? 'none' : 'auto' }}>
            {products.map((item, i) => {
              const p = item.product ?? item;
              return (
                <Grid key={p.id} size={{ xs: 6, sm: 4, md: 3, lg: 3 }}>
                  <Box sx={{ opacity: deleting === p.id ? 0.3 : 1, transform: deleting === p.id ? 'scale(0.96)' : 'none', transition: 'opacity 0.3s, transform 0.3s', pointerEvents: deleting === p.id ? 'none' : 'auto' }}>
                    <ProductCard product={item} onEdit={handleEdit} onDelete={handleDeleteIntent} onView={handleView} index={i} />
                  </Box>
                </Grid>
              );
            })}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Stack alignItems="center" sx={{ mt: 4 }}>
              <Pagination
                count={totalPages}
                page={Math.min(currentPage, totalPages)}
                onChange={(_, page) => goToPage(page)}
                shape="rounded"
                siblingCount={1}
                boundaryCount={1}
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: 13,
                  },
                  '& .MuiPaginationItem-root.Mui-selected': {
                    bgcolor: 'text.primary',
                    color: 'background.paper',
                    '&:hover': { bgcolor: 'text.secondary' },
                  },
                }}
              />
            </Stack>
          )}
        </>
      )}

      {/* Footer upsell */}
      {catalogTotal > 0 && (
        <Box sx={{ mt: 4, p: '16px 22px', borderRadius: '12px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
          <Typography variant="caption" color="text.secondary">
            {canBulkUpload
              ? 'You have Bulk Upload access — add up to 500 products at once.'
              : <>Need to add many products at once? <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>Bulk upload</Box> is available on the Pro plan.</>}
          </Typography>
          <Button
            href={canBulkUpload ? '/products/bulk-upload' : '/vendor/subscription'}
            size="small"
            variant="outlined"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 12 }} />}
            sx={{ fontSize: 11, fontWeight: 600, borderRadius: '8px', borderColor: 'divider', color: 'text.secondary', flexShrink: 0, '&:hover': { borderColor: 'text.primary', color: 'text.primary' } }}
          >
            {canBulkUpload ? 'Bulk upload' : 'Upgrade'}
          </Button>
        </Box>
      )}

      {/* Delete dialog */}
      <DeleteConfirmDialog
        open={dialogOpen}
        productTitle={pendingDelete?.title ?? ''}
        onConfirm={handleDeleteConfirm}
        onClose={handleDialogClose}
      />
    </Box>
  );
}
