'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Box, Typography, Grid, Card, CardContent, Stack, Chip, Avatar,
  CircularProgress, Alert, Divider, Button, LinearProgress, Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';
import RepeatIcon from '@mui/icons-material/Repeat';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import TodayIcon from '@mui/icons-material/Today';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { createAxiosClient } from '@/utils/clientFetch';
import { useTheme } from '@mui/material/styles';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ViewPeriod {
  total: number;
  unique: number;
  returning: number;
  bots: number;
}

interface TrendPoint {
  date: string;
  total: number;
  unique: number;
  returning: number;
  bots: number;
}

interface ViewAnalytics {
  today: ViewPeriod;
  week: ViewPeriod;
  month: ViewPeriod;
  all_time: { total: number };
  trend: TrendPoint[];
}

interface RatingDist { rating: number; count: number; }

interface ProductAnalytics {
  id: number;
  title: string;
  image: string | null;
  sku: string;
  status: string;
  price: string;
  views: number;
  trending_score: number;
  wishlist_count: number;
  saved_count: number;
  review_count: number;
  avg_rating: number;
  rating_distribution: RatingDist[];
  total_revenue: number;
  total_units_sold: number;
  total_orders: number;
  avg_order_value: number;
  cancellation_rate: number;
  refund_rate: number;
  total_stock: number;
  order_status_breakdown: { status: string; count: number }[];
  sales_trend: { date: string; revenue: number; units: number }[];
  view_analytics: ViewAnalytics;
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, icon, color = 'primary.main',
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; color?: string;
}) {
  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
              {label}
            </Typography>
            <Typography variant="h4" fontWeight={800} mt={0.5} color="text.primary">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
            {sub && (
              <Typography variant="caption" color="text.disabled" mt={0.25} display="block">
                {sub}
              </Typography>
            )}
          </Box>
          <Box sx={{ p: 1.25, bgcolor: `${color}15`, borderRadius: 2, color }}>
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ── View breakdown sub-card ───────────────────────────────────────────────────

function ViewBreakdown({ period, label }: { period: ViewPeriod; label: string }) {
  const nonBot = period.total;
  const bot    = period.bots;
  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
      <CardContent>
        <Typography variant="subtitle2" fontWeight={700} color="text.secondary" gutterBottom>
          {label}
        </Typography>
        <Stack spacing={0.75}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Total (non-bot)</Typography>
            <Typography variant="body2" fontWeight={700}>{nonBot.toLocaleString()}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Unique visitors</Typography>
            <Typography variant="body2" fontWeight={700} color="success.main">{period.unique.toLocaleString()}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Returning visitors</Typography>
            <Typography variant="body2" fontWeight={700} color="info.main">{period.returning.toLocaleString()}</Typography>
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.disabled">Bot traffic (filtered)</Typography>
            <Typography variant="body2" color="text.disabled">{bot.toLocaleString()}</Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ── Format date label for chart ───────────────────────────────────────────────
function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ProductAnalyticsPage() {
  const theme = useTheme();
  // Chart colours sourced from the theme so they track light/dark mode.
  const chart = {
    grid: theme.palette.divider,
    tooltipBg: theme.palette.background.paper,
    tooltipText: theme.palette.text.primary,
    views: theme.palette.info.main,
    unique: theme.palette.success.main,
    returning: theme.palette.warning.main,
    bots: theme.palette.text.disabled,
    revenue: theme.palette.info.main,
    units: theme.palette.success.main,
  };
  const { id } = useParams<{ id: string }>();
  const [data, setData]     = useState<ProductAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const client = createAxiosClient();
    client.get(`/api/v1/vendor/products/${id}/analytics/`)
      .then(res => setData(res.data))
      .catch(err => setError(err?.response?.data?.detail ?? 'Failed to load product analytics.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Box p={4}>
        <LinearProgress />
        <Typography mt={2} color="text.secondary">Loading analytics…</Typography>
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box p={4}>
        <Alert severity="error">{error ?? 'Product not found.'}</Alert>
        <Button component={Link} href="/products" startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
          Back to products
        </Button>
      </Box>
    );
  }

  const va = data.view_analytics;

  // Prepare chart data — merge trend into recharts-friendly format
  const trendData = (va?.trend ?? []).map(p => ({
    date:      fmtDate(p.date),
    Views:     p.total,
    Unique:    p.unique,
    Returning: p.returning,
    Bots:      p.bots,
  }));

  const salesTrendData = (data.sales_trend ?? []).map(p => ({
    date:    fmtDate(p.date),
    Revenue: Number(p.revenue.toFixed(2)),
    Units:   p.units,
  }));

  return (
    <Box p={{ xs: 2, md: 4 }}>
      {/* Back + header */}
      <Stack direction="row" alignItems="center" gap={1} mb={1}>
        <Button component={Link} href="/products" startIcon={<ArrowBackIcon />} size="small" sx={{ textTransform: 'none' }}>
          Products
        </Button>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="flex-start" gap={2} mb={4}>
        <Avatar
          src={data.image ?? undefined}
          variant="rounded"
          sx={{ width: 64, height: 64, bgcolor: 'grey.100', fontSize: 28 }}
        >
          {data.title[0]}
        </Avatar>
        <Box flex={1}>
          <Typography variant="h5" fontWeight={800}>{data.title}</Typography>
          <Stack direction="row" gap={1} mt={0.5} flexWrap="wrap">
            <Chip label={data.status.replace('_', ' ')} size="small" color="success" sx={{ textTransform: 'capitalize', fontWeight: 600 }} />
            <Chip label={`SKU: ${data.sku}`} size="small" variant="outlined" />
            <Chip label={`₵${Number(data.price).toFixed(2)}`} size="small" variant="outlined" />
            <Chip label={`Trending: ${data.trending_score?.toFixed(1) ?? 0}`} size="small" variant="outlined" />
          </Stack>
        </Box>
      </Stack>

      {/* View KPIs */}
      <Typography variant="h6" fontWeight={700} mb={2}>Traffic & Views</Typography>
      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Today"
            value={va?.today?.total ?? 0}
            sub={`${va?.today?.unique ?? 0} unique · ${va?.today?.returning ?? 0} returning`}
            icon={<TodayIcon />}
            color="primary.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="This Week"
            value={va?.week?.total ?? 0}
            sub={`${va?.week?.unique ?? 0} unique · ${va?.week?.returning ?? 0} returning`}
            icon={<DateRangeIcon />}
            color="secondary.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="This Month"
            value={va?.month?.total ?? 0}
            sub={`${va?.month?.unique ?? 0} unique · ${va?.month?.returning ?? 0} returning`}
            icon={<CalendarMonthIcon />}
            color="warning.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="All Time"
            value={va?.all_time?.total ?? data.views}
            sub="Bot traffic excluded"
            icon={<AllInclusiveIcon />}
            color="success.main"
          />
        </Grid>
      </Grid>

      {/* Visitor breakdown */}
      <Grid container spacing={2} mb={4}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <ViewBreakdown period={va?.today ?? { total: 0, unique: 0, returning: 0, bots: 0 }} label="Today" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <ViewBreakdown period={va?.week ?? { total: 0, unique: 0, returning: 0, bots: 0 }} label="This Week" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <ViewBreakdown period={va?.month ?? { total: 0, unique: 0, returning: 0, bots: 0 }} label="This Month" />
        </Grid>
      </Grid>

      {/* 30-day view trend chart */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={0.5}>30-Day View Trend</Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Daily views broken down by visitor type. Bots are tracked but not counted in totals.
          </Typography>
          {trendData.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography color="text.disabled">No view data yet for this period.</Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <RechartsTooltip
                  contentStyle={{ borderRadius: 8, border: `1px solid ${chart.grid}`, background: chart.tooltipBg, color: chart.tooltipText, fontSize: 13 }}
                />
                <Legend />
                <Line type="monotone" dataKey="Views"     stroke={chart.views}     strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Unique"    stroke={chart.unique}    strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Returning" stroke={chart.returning} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Bots"      stroke={chart.bots}      strokeWidth={1} dot={false} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Sales KPIs */}
      <Typography variant="h6" fontWeight={700} mb={2}>Sales Performance</Typography>
      <Grid container spacing={2} mb={4}>
        {[
          { label: 'Total Revenue',   value: `₵${Number(data.total_revenue).toFixed(2)}` },
          { label: 'Total Orders',    value: data.total_orders },
          { label: 'Units Sold',      value: data.total_units_sold },
          { label: 'Avg Order Value', value: `₵${Number(data.avg_order_value).toFixed(2)}` },
          { label: 'Cancellation',    value: `${data.cancellation_rate}%` },
          { label: 'Refund Rate',     value: `${data.refund_rate}%` },
        ].map(item => (
          <Grid key={item.label} size={{ xs: 6, sm: 4, md: 2 }}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, textAlign: 'center', py: 2 }}>
              <Typography variant="h5" fontWeight={800}>{item.value}</Typography>
              <Typography variant="caption" color="text.secondary">{item.label}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Sales trend chart */}
      {salesTrendData.length > 0 && (
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={2}>30-Day Sales Trend</Typography>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={salesTrendData} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                <RechartsTooltip contentStyle={{ borderRadius: 8, border: `1px solid ${chart.grid}`, background: chart.tooltipBg, color: chart.tooltipText, fontSize: 13 }} />
                <Legend />
                <Bar yAxisId="left"  dataKey="Revenue" fill={chart.revenue} radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="Units"   fill={chart.units}   radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Engagement */}
      <Typography variant="h6" fontWeight={700} mb={2}>Engagement</Typography>
      <Grid container spacing={2} mb={4}>
        {[
          { label: 'Wishlisted',     value: data.wishlist_count },
          { label: 'Saved',         value: data.saved_count },
          { label: 'Reviews',       value: data.review_count },
          { label: 'Avg Rating',    value: `${data.avg_rating ?? 0} / 5` },
          { label: 'Stock Left',    value: data.total_stock },
        ].map(item => (
          <Grid key={item.label} size={{ xs: 6, sm: 4, md: 2 }}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, textAlign: 'center', py: 2 }}>
              <Typography variant="h5" fontWeight={800}>{item.value}</Typography>
              <Typography variant="caption" color="text.secondary">{item.label}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
