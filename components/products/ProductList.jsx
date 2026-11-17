'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Box, Grid, Typography, Stack, Button, Chip, IconButton,
  InputAdornment, TextField, MenuItem, Select, FormControl, Tooltip,
  Pagination, Popover, CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import SearchIcon from '@mui/icons-material/Search';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SortRoundedIcon from '@mui/icons-material/SortRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Swal from 'sweetalert2';
import { createAxiosClient } from '@/utils/clientFetch';
import DeleteConfirmDialog from './Deleteconfirmdialog';
import BulkUploadButton from './BulkUploadButton';
import ProductListSkeleton from './Productlistskeleton';
import ProductListError from './Productlisterror';

// Matches the backend default (vendor/views.py → VendorProductPagination).
const PAGE_SIZE = 50;

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
          <Typography sx={{ fontFamily: "var(--font-figtree), system-ui, sans-serif", fontSize: 18, fontWeight: 700, lineHeight: 1 }} color="text.primary">
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
            {(p.seller_sku || p.sku) && (
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>{p.seller_sku || p.sku}</Typography>
            )}
          </Stack>
        </Stack>
      </Box>

      {p.status === 'rejected' && p.review_note && (
        <Box sx={{ px: 1.75, py: 1.25, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'error.main', display: 'block' }}>Changes needed</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {p.review_note}
          </Typography>
        </Box>
      )}

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
function EmptyState({ onAdd, filtered, onClear }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', py: 14, px: 3, borderRadius: '20px', border: '1px dashed', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Box sx={{ width: 64, height: 64, borderRadius: '18px', bgcolor: 'action.selected', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
        <InventoryOutlinedIcon sx={{ fontSize: 28, color: 'text.secondary' }} />
      </Box>
      <Typography sx={{ fontFamily: "var(--font-figtree), system-ui, sans-serif", fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', mb: 1 }} color="text.primary">
        {filtered ? 'No results found' : 'No products yet'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320, lineHeight: 1.75, mb: 3.5 }}>
        {filtered ? 'Nothing matches these filters. Try a different word or remove a filter.' : 'Start building your catalog. Add your first product to get listed on Negromart.'}
      </Typography>
      {filtered && onClear && (
        <Button variant="outlined" onClick={onClear} sx={{ borderRadius: '10px', fontWeight: 600, textTransform: 'none' }}>
          Clear all filters
        </Button>
      )}
      {!filtered && (
        <Button variant="contained" disableElevation startIcon={<AddIcon />} onClick={onAdd}
          sx={{ bgcolor: 'text.primary', color: 'background.paper', borderRadius: '10px', fontWeight: 600, '&:hover': { bgcolor: 'text.secondary' } }}>
          Add first product
        </Button>
      )}
    </Box>
  );
}

// ── Filter bar pieces ─────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: 'newest',      label: 'Newest first' },
  { value: 'updated',     label: 'Recently updated' },
  { value: 'oldest',      label: 'Oldest first' },
  { value: 'title',       label: 'Title A–Z' },
  { value: 'price_low',   label: 'Price: low to high' },
  { value: 'price_high',  label: 'Price: high to low' },
  { value: 'stock_low',   label: 'Stock: lowest first' },
  { value: 'stock_high',  label: 'Stock: highest first' },
  { value: 'most_viewed', label: 'Most viewed' },
];
const FULFILMENT_OPTIONS = [
  { value: 'in_stock',      label: 'Ships from stock' },
  { value: 'imported',      label: 'Imported' },
  { value: 'made_to_order', label: 'Made to order' },
];
// Every filter the URL can carry; changing any of them returns to page 1.
const FILTER_KEYS = ['search', 'status', 'stock', 'category', 'fulfilment', 'min_price', 'max_price', 'sort'];

const selectSx = {
  borderRadius: '10px', fontSize: 13.5, bgcolor: 'background.paper',
  '& fieldset': { borderColor: 'divider' },
  '& .MuiSelect-select': { py: '8.5px' },
};

/** A compact dropdown whose label is part of the value ("Stock: Low"). */
function FilterSelect({ label, value, onChange, options, allLabel = 'All', minWidth = 150 }) {
  const active = value !== '';
  return (
    <FormControl size="small" sx={{ minWidth, flex: { xs: '1 1 calc(50% - 6px)', md: '0 0 auto' } }}>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        displayEmpty
        renderValue={(v) => {
          const opt = options.find((o) => String(o.value) === String(v));
          return (
            <Box component="span" sx={{ fontWeight: active ? 600 : 400, color: active ? 'text.primary' : 'text.secondary' }}>
              {label}: {opt ? opt.label : allLabel}
            </Box>
          );
        }}
        sx={{ ...selectSx, ...(active ? { '& fieldset': { borderColor: 'text.primary' } } : {}) }}
        MenuProps={{ slotProps: { paper: { sx: { maxHeight: 360, borderRadius: '10px' } } } }}
      >
        <MenuItem value="">{allLabel}</MenuItem>
        {options.map((o) => (
          <MenuItem key={o.value} value={String(o.value)} sx={{ fontSize: 14 }}>
            <Box component="span" sx={{ flex: 1 }}>{o.label}</Box>
            {o.count != null && <Typography component="span" variant="caption" color="text.disabled" sx={{ ml: 2 }}>{o.count}</Typography>}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

/** "Price" button that opens a small min/max form. */
function PriceFilter({ min, max, onApply }) {
  const [anchor, setAnchor] = useState(null);
  const [lo, setLo] = useState(min);
  const [hi, setHi] = useState(max);
  const active = !!(min || max);
  const label = active
    ? `Price: ${min ? `GHS ${min}` : 'Any'} – ${max ? `GHS ${max}` : 'Any'}`
    : 'Price: Any';
  const open = (e) => { setLo(min); setHi(max); setAnchor(e.currentTarget); };
  const apply = () => { onApply(lo.trim(), hi.trim()); setAnchor(null); };
  const invalid = lo && hi && Number(lo) > Number(hi);

  return (
    <>
      <Button
        onClick={open}
        endIcon={<ExpandMoreRoundedIcon />}
        sx={{
          flex: { xs: '1 1 calc(50% - 6px)', md: '0 0 auto' }, justifyContent: 'space-between',
          height: 40, px: 1.75, borderRadius: '10px', border: '1px solid', textTransform: 'none',
          borderColor: active ? 'text.primary' : 'divider', bgcolor: 'background.paper',
          color: active ? 'text.primary' : 'text.secondary', fontWeight: active ? 600 : 400, fontSize: 13.5,
          whiteSpace: 'nowrap', '& .MuiButton-endIcon': { color: 'text.secondary' },
        }}
      >
        {label}
      </Button>
      <Popover
        open={!!anchor}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { mt: 0.75, p: 2, width: 280, borderRadius: '12px' } } }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1.5 }}>Price (GHS)</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField size="small" label="Min" value={lo} onChange={(e) => setLo(e.target.value.replace(/[^\d.]/g, ''))}
            inputProps={{ inputMode: 'decimal' }} onKeyDown={(e) => e.key === 'Enter' && !invalid && apply()} />
          <Typography color="text.disabled">–</Typography>
          <TextField size="small" label="Max" value={hi} onChange={(e) => setHi(e.target.value.replace(/[^\d.]/g, ''))}
            inputProps={{ inputMode: 'decimal' }} onKeyDown={(e) => e.key === 'Enter' && !invalid && apply()} />
        </Stack>
        {invalid && <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>Min can&rsquo;t be more than max.</Typography>}
        <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
          <Button size="small" onClick={() => { onApply('', ''); setAnchor(null); }} sx={{ textTransform: 'none' }}>Clear</Button>
          <Button size="small" variant="contained" disableElevation disabled={!!invalid} onClick={apply} sx={{ textTransform: 'none', borderRadius: '8px' }}>Apply</Button>
        </Stack>
      </Popover>
    </>
  );
}

// ── Main ProductList ──────────────────────────────────────────────────────────
export default function ProductList({ canBulkUpload = false }) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const listTopRef   = useRef(null);

  // All filters live in the URL: refresh, back/forward and shared links keep
  // the seller's view, and the header search can deep-link with ?search=.
  const urlSearch   = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || 'all';
  const stockFilter  = searchParams.get('stock') || '';
  const category     = searchParams.get('category') || '';
  const fulfilment   = searchParams.get('fulfilment') || '';
  const minPrice     = searchParams.get('min_price') || '';
  const maxPrice     = searchParams.get('max_price') || '';
  const sort         = searchParams.get('sort') || 'newest';
  const currentPage  = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  // The search box is typed into locally and written to the URL after a pause.
  const [search, setSearch] = useState(urlSearch);
  // Follow the URL (header search, back button) without fighting the typist:
  // "red " mid-typing already matches ?search=red, so leave it alone.
  useEffect(() => { setSearch((s) => (s.trim() === urlSearch ? s : urlSearch)); }, [urlSearch]);

  const [deleting,      setDeleting]      = useState(null);
  const [dialogOpen,    setDialogOpen]    = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  // Server-driven data
  const [products,     setProducts]     = useState([]);
  const [count,        setCount]        = useState(0);   // items matching search/filter
  const [totalPages,   setTotalPages]   = useState(1);
  const [statusCounts, setStatusCounts] = useState({});
  const [catalogTotal, setCatalogTotal] = useState(0);   // whole catalog, ignores filters
  const [facets,       setFacets]       = useState({ categories: [], stock_counts: {}, low_stock_threshold: null });
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [hasLoaded,    setHasLoaded]    = useState(false);

  /** Write params to the URL. Filter changes go back to page 1. */
  const setParams = useCallback((updates, { keepPage = false } = {}) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === '' || v == null || (k === 'status' && v === 'all') || (k === 'sort' && v === 'newest')) params.delete(k);
      else params.set(k, String(v));
    });
    if (!keepPage) params.delete('page');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [router, pathname, searchParams]);

  const goToPage = useCallback((page) => {
    setParams({ page: page > 1 ? page : '' }, { keepPage: true });
    // With 50 per page the pager is far down; bring the seller back to the top of the list.
    listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [setParams]);

  // Debounce the search box into the URL.
  useEffect(() => {
    const term = search.trim();
    if (term === urlSearch) return undefined;
    const t = setTimeout(() => setParams({ search: term }), 350);
    return () => clearTimeout(t);
  }, [search, urlSearch, setParams]);

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
      if (urlSearch)              params.set('search', urlSearch);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (stockFilter)            params.set('stock', stockFilter);
      if (category)               params.set('category', category);
      if (fulfilment)             params.set('fulfilment', fulfilment);
      if (minPrice)               params.set('min_price', minPrice);
      if (maxPrice)               params.set('max_price', maxPrice);
      if (sort !== 'newest')      params.set('sort', sort);

      const { data } = await client.get(`/api/v1/vendor/products/?${params.toString()}`);
      if (seq !== reqSeq.current) return; // a newer request superseded this one

      setProducts(data.results || []);
      setCount(data.count ?? (data.results?.length || 0));
      setTotalPages(data.total_pages || 1);
      setStatusCounts(data.status_counts || {});
      setCatalogTotal(data.catalog_total ?? 0);
      setFacets({
        categories: data.categories || [],
        stock_counts: data.stock_counts || {},
        low_stock_threshold: data.low_stock_threshold ?? null,
      });

      // Backend clamps out-of-range pages — keep the URL in sync if it did.
      if (data.current_page && data.current_page !== currentPage) {
        setParams({ page: data.current_page > 1 ? data.current_page : '' }, { keepPage: true });
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
  }, [currentPage, urlSearch, statusFilter, stockFilter, category, fulfilment, minPrice, maxPrice, sort, setParams]);

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

  // Chips for every active filter (status has its own tabs), each removable.
  const categoryName = facets.categories.find((c) => String(c.id) === category)?.title;
  const activeFilters = [
    urlSearch   && { key: 'search',     label: `“${urlSearch}”`,               clear: { search: '' } },
    stockFilter && { key: 'stock',      label: { in: 'In stock', low: 'Low stock', out: 'Out of stock' }[stockFilter] || stockFilter, clear: { stock: '' } },
    category    && { key: 'category',   label: categoryName || 'Category',     clear: { category: '' } },
    fulfilment  && { key: 'fulfilment', label: FULFILMENT_OPTIONS.find((o) => o.value === fulfilment)?.label || fulfilment, clear: { fulfilment: '' } },
    (minPrice || maxPrice) && { key: 'price', label: `GHS ${minPrice || '0'} – ${maxPrice || 'any'}`, clear: { min_price: '', max_price: '' } },
  ].filter(Boolean);
  const isFiltered = activeFilters.length > 0 || statusFilter !== 'all';
  const clearAll = () => { setSearch(''); setParams(Object.fromEntries(FILTER_KEYS.filter((k) => k !== 'sort').map((k) => [k, '']))); };

  // Range label for current page (server-paginated)
  const rangeStart = count === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd   = Math.min(currentPage * PAGE_SIZE, count);

  const sc = facets.stock_counts || {};
  const stockOptions = [
    { value: 'in',  label: 'In stock',     count: sc.in },
    { value: 'low', label: facets.low_stock_threshold != null ? `Low stock (≤ ${facets.low_stock_threshold})` : 'Low stock', count: sc.low },
    { value: 'out', label: 'Out of stock', count: sc.out },
  ];

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
        sx={{ mb: 3 }}
        spacing={2}
      >
        <Box>
          <Typography sx={{
            fontFamily: "var(--font-figtree), system-ui, sans-serif",
            fontSize: { xs: 30, md: 36 }, fontWeight: 700,
            letterSpacing: '-1px', lineHeight: 1, mb: 0.5,
          }} color="text.primary">
            My Products
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {catalogTotal === 0
              ? 'Your catalog is empty'
              : `${catalogTotal.toLocaleString()} product${catalogTotal !== 1 ? 's' : ''} in your catalog`}
          </Typography>
        </Box>

        {/* ── Action buttons ────────────────────────────────────────────── */}
        <Stack direction="row" spacing={1} flexShrink={0} alignItems="center" flexWrap="wrap" useFlexGap>
          <BulkUploadButton canBulkUpload={canBulkUpload} />
          <Button
            variant="outlined"
            onClick={() => router.push('/products/sell-existing')}
            sx={{ borderRadius: '10px', fontWeight: 600, fontSize: 13, px: 2, py: 1.15, textTransform: 'none' }}
          >
            Sell an existing item
          </Button>
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

      {(catalogTotal > 0 || isFiltered) && (
        <Box ref={listTopRef} sx={{ scrollMarginTop: 16 }}>
          {/* ── Status tabs (catalog-wide counts) ─────────────────────────── */}
          <Stack direction="row" spacing={0.75} sx={{ mb: 2, overflowX: 'auto', pb: 0.5, '&::-webkit-scrollbar': { display: 'none' } }}>
            {[['all', `All (${catalogTotal})`], ...Object.keys(STATUS_CONFIG).filter((s) => statusCounts[s]).map((s) => [s, `${STATUS_CONFIG[s].label} (${statusCounts[s]})`])].map(([s, label]) => {
              const on = statusFilter === s;
              const color = s === 'all' ? null : STATUS_CONFIG[s].color;
              return (
                <Chip
                  key={s}
                  label={label}
                  onClick={() => setParams({ status: s === statusFilter && s !== 'all' ? 'all' : s })}
                  sx={{
                    borderRadius: '8px', fontWeight: 600, fontSize: 12.5, height: 32, flexShrink: 0,
                    bgcolor: on ? (color || 'text.primary') : 'action.hover',
                    color: on ? (color ? '#ffffff' : 'background.paper') : 'text.secondary',
                    '&:hover': { bgcolor: on ? (color || 'text.primary') : 'action.selected' },
                  }}
                />
              );
            })}
          </Stack>

          {/* ── Search + sort ─────────────────────────────────────────────── */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 1.5 }}>
            <TextField
              placeholder="Search by title, SKU, brand or barcode"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') setParams({ search: search.trim() }); }}
              size="small"
              inputProps={{ 'aria-label': 'Search products' }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} /></InputAdornment>,
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" aria-label="Clear search" onClick={() => { setSearch(''); setParams({ search: '' }); }}>
                      <CloseRoundedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
              sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: '10px', height: 42, bgcolor: 'background.paper', '& fieldset': { borderColor: 'divider' }, '&:hover fieldset': { borderColor: 'text.disabled' } } }}
            />
            <FormControl size="small" sx={{ minWidth: { sm: 210 } }}>
              <Select
                value={sort}
                onChange={(e) => setParams({ sort: e.target.value })}
                startAdornment={<SortRoundedIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />}
                sx={{ ...selectSx, height: 42 }}
                inputProps={{ 'aria-label': 'Sort products' }}
              >
                {SORT_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value} sx={{ fontSize: 14 }}>{o.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>

          {/* ── Filters ───────────────────────────────────────────────────── */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
            <FilterSelect label="Stock" value={stockFilter} onChange={(v) => setParams({ stock: v })} options={stockOptions} />
            {facets.categories.length > 0 && (
              <FilterSelect
                label="Category"
                value={category}
                onChange={(v) => setParams({ category: v })}
                options={facets.categories.map((c) => ({ value: c.id, label: c.title, count: c.count }))}
                minWidth={180}
              />
            )}
            <FilterSelect label="Fulfilment" value={fulfilment} onChange={(v) => setParams({ fulfilment: v })} options={FULFILMENT_OPTIONS} minWidth={170} />
            <PriceFilter
              key={`${minPrice}-${maxPrice}`}
              min={minPrice}
              max={maxPrice}
              onApply={(lo, hi) => setParams({ min_price: lo, max_price: hi })}
            />
          </Box>

          {/* ── Active filters + result count ─────────────────────────────── */}
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2, minHeight: 28 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
              {count === 0
                ? 'No products'
                : `Showing ${rangeStart.toLocaleString()}–${rangeEnd.toLocaleString()} of ${count.toLocaleString()}${isFiltered ? ' matching' : ''}`}
              {loading && <CircularProgress size={12} thickness={5} sx={{ ml: 1, verticalAlign: 'middle' }} />}
            </Typography>
            {activeFilters.map((f) => (
              <Chip
                key={f.key}
                size="small"
                label={f.label}
                onDelete={() => { if (f.key === 'search') setSearch(''); setParams(f.clear); }}
                sx={{ borderRadius: '8px', fontWeight: 600, fontSize: 12 }}
              />
            ))}
            {isFiltered && (
              <Button size="small" onClick={clearAll} sx={{ textTransform: 'none', fontWeight: 600, fontSize: 13 }}>
                Clear all
              </Button>
            )}
          </Stack>
        </Box>
      )}

      {/* Grid */}
      {products.length === 0 ? (
        <EmptyState onAdd={() => router.push('/products/product')} filtered={isFiltered} onClear={clearAll} />
      ) : (
        <>
          <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s', pointerEvents: loading ? 'none' : 'auto' }}>
            {products.map((item, i) => {
              const p = item.product ?? item;
              return (
                <Grid key={p.id} size={{ xs: 6, sm: 4, md: 3, xl: 2.4 }}>
                  <Box sx={{ opacity: deleting === p.id ? 0.3 : 1, transform: deleting === p.id ? 'scale(0.96)' : 'none', transition: 'opacity 0.3s, transform 0.3s', pointerEvents: deleting === p.id ? 'none' : 'auto' }}>
                    <ProductCard product={item} onEdit={handleEdit} onDelete={handleDeleteIntent} onView={handleView} index={i} />
                  </Box>
                </Grid>
              );
            })}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Stack alignItems="center" spacing={1} sx={{ mt: 4 }}>
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
              <Typography variant="caption" color="text.secondary">
                {PAGE_SIZE} products per page
              </Typography>
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
            href={canBulkUpload ? '/products/bulk-upload' : '/subscribe'}
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
