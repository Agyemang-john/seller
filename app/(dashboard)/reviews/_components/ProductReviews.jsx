'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Stack, Avatar, Chip, Divider, IconButton,
  TextField, InputAdornment, LinearProgress, Tooltip, Skeleton,
  Alert, Pagination, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { createAxiosClient } from '@/utils/clientFetch';
import toast from 'react-hot-toast';
import { brand } from '@/theme/designTokens';

const GOLD = brand.gold;
const PAGE_SIZE = 10;

// ── Star row ──────────────────────────────────────────────────────────────────
function StarRow({ rating, size = 16 }) {
  return (
    <Stack direction="row" spacing={0.25} alignItems="center">
      {[1, 2, 3, 4, 5].map(i => {
        const diff = rating - i + 1;
        const Icon = diff >= 1 ? StarIcon : diff >= 0.5 ? StarHalfIcon : StarBorderIcon;
        return <Icon key={i} sx={{ fontSize: size, color: diff > 0 ? GOLD : 'divider' }} />;
      })}
    </Stack>
  );
}

// ── Rating summary panel ──────────────────────────────────────────────────────
function RatingSummary({ reviews }) {
  const count = reviews.length;
  const avg = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  const dist = [5, 4, 3, 2, 1].map(star => ({
    star,
    n: reviews.filter(r => r.rating === star).length,
  }));

  return (
    <Box
      sx={{
        p: { xs: '18px 20px', sm: '24px 32px' },
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { sm: 'center' },
        gap: { xs: 2.5, sm: 5 },
        mb: 3,
      }}
    >
      {/* Big average score */}
      <Box sx={{ textAlign: 'center', flexShrink: 0 }}>
        <Typography
          sx={{
            fontSize: { xs: 56, sm: 72 },
            fontWeight: 800,
            lineHeight: 1,
            color: 'text.primary',
            letterSpacing: '-2px',
          }}
        >
          {avg.toFixed(1)}
        </Typography>
        <Box sx={{ mt: 0.75, display: 'flex', justifyContent: 'center' }}>
          <StarRow rating={avg} size={20} />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
          {count.toLocaleString()} {count === 1 ? 'review' : 'reviews'}
        </Typography>
      </Box>

      <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
      <Divider sx={{ display: { xs: 'block', sm: 'none' } }} />

      {/* Distribution bars */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {dist.map(({ star, n }) => (
          <Stack key={star} direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.85 }}>
            <Stack direction="row" alignItems="center" spacing={0.4} sx={{ width: 40, flexShrink: 0 }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ lineHeight: 1 }}>
                {star}
              </Typography>
              <StarIcon sx={{ fontSize: 12, color: GOLD }} />
            </Stack>
            <LinearProgress
              variant="determinate"
              value={count ? (n / count) * 100 : 0}
              sx={{
                flex: 1,
                height: 9,
                borderRadius: 5,
                bgcolor: 'action.hover',
                '& .MuiLinearProgress-bar': { bgcolor: GOLD, borderRadius: 5 },
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ width: 26, textAlign: 'right', flexShrink: 0, fontWeight: 600 }}
            >
              {n}
            </Typography>
          </Stack>
        ))}
      </Box>

      {/* Quick stat badges */}
      <Stack spacing={1} sx={{ flexShrink: 0, display: { xs: 'none', md: 'flex' } }}>
        {[
          { label: 'Published', val: reviews.filter(r => r.status).length, color: 'success' },
          { label: 'Hidden', val: reviews.filter(r => !r.status).length, color: 'warning' },
          { label: '5-star', val: reviews.filter(r => r.rating === 5).length, color: 'primary' },
        ].map(({ label, val, color }) => (
          <Box
            key={label}
            sx={{
              px: 2, py: 1, borderRadius: 2,
              border: '1px solid', borderColor: 'divider',
              minWidth: 90, textAlign: 'center',
            }}
          >
            <Typography variant="h6" fontWeight={800} color={`${color}.main`} sx={{ lineHeight: 1 }}>
              {val}
            </Typography>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

// ── Single review card ────────────────────────────────────────────────────────
function ReviewCard({ review, onToggle }) {
  const { id, product, product_image, user_email, review: text, rating, status, created_at } = review;

  const initials = user_email ? user_email[0].toUpperCase() : '?';
  const dateStr = created_at
    ? new Date(created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <Box
      sx={{
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        borderLeft: '3.5px solid',
        borderLeftColor: status ? 'success.main' : 'warning.main',
        bgcolor: 'background.paper',
        overflow: 'hidden',
        transition: 'box-shadow 0.18s',
        '&:hover': { boxShadow: 3 },
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }}>
        {/* Product panel */}
        <Box
          sx={{
            p: { xs: '12px 16px 0', sm: '16px' },
            width: { sm: 170 },
            flexShrink: 0,
            borderRight: { sm: '1px solid' },
            borderBottom: { xs: '1px solid', sm: 'none' },
            borderColor: 'divider',
            display: 'flex',
            flexDirection: { xs: 'row', sm: 'column' },
            alignItems: { xs: 'center', sm: 'flex-start' },
            gap: { xs: 1.5, sm: 1 },
            pb: { xs: '12px', sm: '16px' },
          }}
        >
          <Avatar
            src={product_image || '/default-product.jpg'}
            alt={product}
            variant="rounded"
            sx={{
              width: { xs: 44, sm: 60 },
              height: { xs: 44, sm: 60 },
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              flexShrink: 0,
            }}
          />
          <Typography
            variant="caption"
            fontWeight={600}
            color="text.primary"
            sx={{
              fontSize: { xs: 12, sm: 11.5 },
              lineHeight: 1.45,
              display: '-webkit-box',
              WebkitLineClamp: { xs: 2, sm: 3 },
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product || 'Deleted Product'}
          </Typography>
        </Box>

        {/* Review body */}
        <Box sx={{ flex: 1, minWidth: 0, p: { xs: '12px 16px', sm: '16px 20px' } }}>
          {/* Header row */}
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1.25}>
              <Avatar
                sx={{
                  width: 30, height: 30, fontSize: 13, fontWeight: 700,
                  bgcolor: 'primary.main', flexShrink: 0,
                }}
              >
                {initials}
              </Avatar>
              <Box>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="text.primary"
                  sx={{ display: 'block', lineHeight: 1.3, fontSize: 12.5 }}
                >
                  {user_email || 'Anonymous'}
                </Typography>
                {dateStr && (
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
                    {dateStr}
                  </Typography>
                )}
              </Box>
            </Stack>

            {/* Status + toggle */}
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flexShrink: 0 }}>
              <Chip
                label={status ? 'Published' : 'Hidden'}
                size="small"
                color={status ? 'success' : 'warning'}
                variant="outlined"
                sx={{ fontSize: 10, height: 20, fontWeight: 700 }}
              />
              <Tooltip title={status ? 'Hide review' : 'Publish review'}>
                <IconButton
                  size="small"
                  onClick={() => onToggle(id, status)}
                  sx={{
                    color: status ? 'success.main' : 'text.disabled',
                    '&:hover': { bgcolor: status ? 'success.50' : 'action.hover' },
                  }}
                >
                  {status
                    ? <VisibilityOffIcon sx={{ fontSize: 17 }} />
                    : <VisibilityIcon sx={{ fontSize: 17 }} />}
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          {/* Stars */}
          <Box sx={{ mb: 1 }}>
            <StarRow rating={rating} size={15} />
          </Box>

          {/* Review text */}
          {text ? (
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, fontSize: 13 }}>
              {text}
            </Typography>
          ) : (
            <Typography variant="caption" color="text.disabled" fontStyle="italic">
              No written review
            </Typography>
          )}
        </Box>
      </Stack>
    </Box>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function ReviewsSkeleton() {
  return (
    <Box>
      <Skeleton variant="rounded" height={148} sx={{ mb: 3, borderRadius: 3 }} />
      <Skeleton variant="rounded" height={110} sx={{ mb: 2.5, borderRadius: 2.5 }} />
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} variant="rounded" height={104} sx={{ mb: 1.5, borderRadius: 2.5 }} />
      ))}
    </Box>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ProductReviews() {
  const axiosClient = createAxiosClient();
  const [reviews, setReviews]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [starFilter, setStarFilter]     = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch]             = useState('');
  const [sortBy, setSortBy]             = useState('newest');
  const [page, setPage]                 = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosClient.get('/api/v1/vendor/reviews/');
        setReviews(res.data);
      } catch (err) {
        const msg = err.response?.data?.detail || 'Failed to load reviews.';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleToggle = async (reviewId, currentStatus) => {
    try {
      const res = await axiosClient.patch(`/api/v1/vendor/reviews/${reviewId}/`, {
        status: !currentStatus,
      });
      setReviews(prev =>
        prev.map(r => r.id === reviewId ? { ...r, status: res.data.status } : r)
      );
      toast.success(`Review ${!currentStatus ? 'published' : 'hidden'}.`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update review.');
    }
  };

  const normalized = useMemo(() =>
    reviews.map(r => ({
      id: r.id,
      product: r.product_title,
      product_image: r.product_image,
      user_email: r.user_email,
      review: r.review,
      rating: r.rating ?? 0,
      status: r.status,
      created_at: r.created_at,
    })),
  [reviews]);

  const filtered = useMemo(() => {
    let list = normalized;
    if (starFilter)              list = list.filter(r => r.rating === starFilter);
    if (statusFilter === 'published') list = list.filter(r => r.status);
    if (statusFilter === 'hidden')    list = list.filter(r => !r.status);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        (r.product    || '').toLowerCase().includes(q) ||
        (r.review     || '').toLowerCase().includes(q) ||
        (r.user_email || '').toLowerCase().includes(q)
      );
    }
    const sorted = [...list];
    if (sortBy === 'newest')  sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (sortBy === 'oldest')  sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    if (sortBy === 'highest') sorted.sort((a, b) => b.rating - a.rating);
    if (sortBy === 'lowest')  sorted.sort((a, b) => a.rating - b.rating);
    return sorted;
  }, [normalized, starFilter, statusFilter, search, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetPage = () => setPage(1);

  if (loading) return <ReviewsSkeleton />;
  if (error)   return <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>;

  return (
    <Box sx={{ minWidth: 0 }}>

      {/* ── Rating summary ────────────────────────────────────────────── */}
      {normalized.length > 0 && <RatingSummary reviews={normalized} />}

      {/* ── Filter / search toolbar ───────────────────────────────────── */}
      <Box
        sx={{
          p: { xs: '14px 16px', sm: '16px 20px' },
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          mb: 2.5,
        }}
      >
        <Stack spacing={1.5}>
          {/* Search + Sort */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
            <TextField
              placeholder="Search by product, reviewer, or review text…"
              size="small"
              value={search}
              onChange={e => { setSearch(e.target.value); resetPage(); }}
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 155, flexShrink: 0 }}>
              <InputLabel>Sort by</InputLabel>
              <Select
                value={sortBy}
                label="Sort by"
                onChange={e => { setSortBy(e.target.value); resetPage(); }}
              >
                <MenuItem value="newest">Newest first</MenuItem>
                <MenuItem value="oldest">Oldest first</MenuItem>
                <MenuItem value="highest">Highest rating</MenuItem>
                <MenuItem value="lowest">Lowest rating</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {/* Star + Status chips */}
          <Stack direction="row" alignItems="center" flexWrap="wrap" gap={0.75}>
            <FilterListIcon sx={{ fontSize: 15, color: 'text.disabled', mr: 0.25 }} />

            {[0, 5, 4, 3, 2, 1].map(s => (
              <Chip
                key={s}
                label={s === 0 ? 'All stars' : `${s} ★`}
                size="small"
                onClick={() => { setStarFilter(s); resetPage(); }}
                color={starFilter === s ? 'primary' : 'default'}
                variant={starFilter === s ? 'filled' : 'outlined'}
                sx={{ fontSize: 11, height: 24, fontWeight: 600 }}
              />
            ))}

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 18, alignSelf: 'center' }} />

            {['all', 'published', 'hidden'].map(s => (
              <Chip
                key={s}
                label={s === 'all' ? 'All status' : s.charAt(0).toUpperCase() + s.slice(1)}
                size="small"
                onClick={() => { setStatusFilter(s); resetPage(); }}
                color={statusFilter === s ? 'primary' : 'default'}
                variant={statusFilter === s ? 'filled' : 'outlined'}
                sx={{ fontSize: 11, height: 24, fontWeight: 600 }}
              />
            ))}
          </Stack>
        </Stack>
      </Box>

      {/* ── Results count ─────────────────────────────────────────────── */}
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block', px: 0.5 }}>
        Showing {filtered.length.toLocaleString()} {filtered.length === 1 ? 'review' : 'reviews'}
        {(starFilter || statusFilter !== 'all' || search) ? ' (filtered)' : ''}
      </Typography>

      {/* ── Review cards ──────────────────────────────────────────────── */}
      {paginated.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 9 }}>
          <StarBorderIcon sx={{ fontSize: 50, color: 'text.disabled', mb: 1.5 }} />
          <Typography color="text.secondary" fontWeight={500}>No reviews match your filters.</Typography>
          <Typography variant="caption" color="text.disabled">Try adjusting the search or filters above.</Typography>
        </Box>
      ) : (
        <Stack spacing={1.5} sx={{ mb: 3 }}>
          {paginated.map(r => (
            <ReviewCard key={r.id} review={r} onToggle={handleToggle} />
          ))}
        </Stack>
      )}

      {/* ── Pagination ────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, pb: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            color="primary"
            shape="rounded"
            siblingCount={1}
          />
        </Box>
      )}

    </Box>
  );
}
