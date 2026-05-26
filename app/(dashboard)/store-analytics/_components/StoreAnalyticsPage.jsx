'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Box, Button, CircularProgress, Typography, Stack,
  Divider, ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import RefreshIcon              from '@mui/icons-material/Refresh';
import ArrowForwardIcon         from '@mui/icons-material/ArrowForward';
import VisibilityOutlinedIcon   from '@mui/icons-material/VisibilityOutlined';
import SmartphoneRoundedIcon    from '@mui/icons-material/SmartphoneRounded';
import LaptopRoundedIcon        from '@mui/icons-material/LaptopRounded';
import TabletRoundedIcon        from '@mui/icons-material/TabletRounded';
import DevicesRoundedIcon       from '@mui/icons-material/DevicesRounded';
import PeopleOutlinedIcon       from '@mui/icons-material/PeopleOutlined';
import TrendingUpIcon           from '@mui/icons-material/TrendingUp';
import RepeatRoundedIcon        from '@mui/icons-material/RepeatRounded';
import PersonAddOutlinedIcon    from '@mui/icons-material/PersonAddOutlined';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import { LineChart } from '@mui/x-charts/LineChart';
import { PieChart  } from '@mui/x-charts/PieChart';
import { useTheme  } from '@mui/material/styles';
import useSWR from 'swr';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
  fetcher, SWR_CONFIG,
  ErrorBoundary, ChartSection, SectionHeader,
} from '@/components/dashboard/DashboardUI';

const fmt = (n) => (n || 0).toLocaleString();

// ── ViewTile ──────────────────────────────────────────────────────────────────
function ViewTile({ label, data, accent = false }) {
  const unique    = data?.unique    ?? 0;
  const returning = data?.returning ?? 0;
  const bots      = data?.bots      ?? 0;
  const headline  = data?.unique !== undefined ? unique : (data?.total ?? 0);
  const hasDetail = data?.returning !== undefined;

  return (
    <Box sx={{
      p: { xs: '14px 16px', md: '22px 24px' }, borderRadius: '16px', border: '1px solid',
      borderColor: accent ? 'text.primary' : 'divider',
      bgcolor:     accent ? 'text.primary' : 'background.paper',
      display: 'flex', flexDirection: 'column', gap: 1.25, height: '100%',
      transition: 'box-shadow 0.18s, transform 0.18s',
      '&:hover': { boxShadow: '0 8px 28px rgba(0,0,0,0.1)', transform: 'translateY(-2px)' },
    }}>
      <Typography variant="caption" sx={{
        display: 'block', fontSize: 10, fontWeight: 700,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        color: accent ? 'rgba(255,255,255,0.5)' : 'text.disabled',
      }}>
        {label}
      </Typography>
      <Typography sx={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: { xs: 28, md: 44 }, fontWeight: 700, lineHeight: 1,
        color: accent ? '#fff' : 'text.primary',
      }}>
        {fmt(headline)}
      </Typography>
      {hasDetail && (
        <Typography sx={{ fontSize: 11, lineHeight: 1.7, color: accent ? 'rgba(255,255,255,0.45)' : 'text.disabled' }}>
          {fmt(unique)} unique · {fmt(returning)} returning
          {bots > 0 && <Box component="span" sx={{ opacity: 0.55 }}> · {fmt(bots)} bots filtered</Box>}
        </Typography>
      )}
    </Box>
  );
}

// ── TrendChart ────────────────────────────────────────────────────────────────
function TrendChart({ data }) {
  const theme = useTheme();
  const [series, setSeries] = useState('unique');
  const trend   = data?.trend ?? [];
  const xAxis   = trend.map((d) => new Date(d.date));
  const allZero = trend.every((d) => d.unique === 0 && d.total === 0);

  const seriesDef = {
    unique:    { data: trend.map((d) => d.unique),    label: 'Unique views',    color: theme.palette.text.primary },
    returning: { data: trend.map((d) => d.returning), label: 'Returning views', color: theme.palette.primary.main },
    total:     { data: trend.map((d) => d.total),     label: 'Total views',     color: theme.palette.text.secondary },
  };

  return (
    <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '20px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={1.5} sx={{ mb: 2.5 }}>
        <Stack direction="row" alignItems="baseline" spacing={1}>
          <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px' }} color="text.primary">
            View Trend
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: 10 }}>
            Last 30 days
          </Typography>
        </Stack>
        <ToggleButtonGroup
          value={series} exclusive size="small"
          onChange={(_, v) => { if (v) setSeries(v); }}
          sx={{ '& .MuiToggleButton-root': { px: 1.5, py: 0.5, fontSize: 11, fontWeight: 600, textTransform: 'none', borderRadius: '8px !important', border: '1px solid', borderColor: 'divider' } }}
        >
          <ToggleButton value="unique">Unique</ToggleButton>
          <ToggleButton value="returning">Returning</ToggleButton>
          <ToggleButton value="total">Total</ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      {allZero ? (
        <Box sx={{ minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <VisibilityOutlinedIcon sx={{ fontSize: 28, color: 'text.disabled' }} />
          <Typography variant="body2" color="text.disabled">No view data in the last 30 days</Typography>
        </Box>
      ) : (
        <LineChart
          xAxis={[{ data: xAxis, scaleType: 'time', tickMinStep: 3600 * 1000 * 24 }]}
          series={[{ data: seriesDef[series].data, label: seriesDef[series].label, color: seriesDef[series].color, curve: 'monotoneX', area: true, showMark: false }]}
          height={300}
          margin={{ top: 16, right: 24, bottom: 48, left: 60 }}
          sx={{
            '& .MuiAreaElement-root':     { opacity: 0.07 },
            '& .MuiLineElement-root':     { strokeWidth: 2 },
            '& .MuiChartsAxis-tickLabel': { fill: theme.palette.text.secondary, fontSize: 11 },
          }}
        />
      )}
    </Box>
  );
}

// ── DeviceBreakdown ───────────────────────────────────────────────────────────
function DeviceBreakdown({ breakdown }) {
  const theme = useTheme();
  if (!breakdown) return null;

  const DEVICE_META = {
    mobile:  { label: 'Mobile',  Icon: SmartphoneRoundedIcon, color: theme.palette.primary.main   },
    desktop: { label: 'Desktop', Icon: LaptopRoundedIcon,     color: theme.palette.text.primary    },
    tablet:  { label: 'Tablet',  Icon: TabletRoundedIcon,     color: theme.palette.text.secondary  },
    unknown: { label: 'Other',   Icon: DevicesRoundedIcon,    color: theme.palette.action.active   },
  };

  const entries = Object.entries(DEVICE_META)
    .map(([key, meta]) => ({ ...meta, key, count: breakdown[key] || 0 }))
    .filter((e) => e.count > 0)
    .sort((a, b) => b.count - a.count);

  const total = entries.reduce((s, e) => s + e.count, 0);

  if (entries.length === 0) return (
    <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '20px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', minHeight: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, height: '100%' }}>
      <DevicesRoundedIcon sx={{ fontSize: 28, color: 'text.disabled' }} />
      <Typography variant="body2" color="text.disabled">No device data yet</Typography>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '20px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', height: '100%' }}>
      <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 3 }}>
        <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px' }} color="text.primary">
          Devices
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: 10 }}>
          Last 30 days · bots excluded
        </Typography>
      </Stack>
      <Stack spacing={2}>
        {entries.map(({ key, label, Icon, color, count }) => {
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <Box key={key}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <Icon sx={{ fontSize: 15, color: 'text.secondary' }} />
                  <Typography variant="caption" fontWeight={600} color="text.primary" sx={{ fontSize: 12 }}>{label}</Typography>
                </Stack>
                <Stack direction="row" alignItems="baseline" spacing={0.6}>
                  <Typography variant="caption" fontWeight={700} color="text.primary" sx={{ fontSize: 13 }}>{fmt(count)}</Typography>
                  <Typography variant="caption" color="text.disabled">{pct}%</Typography>
                </Stack>
              </Stack>
              <Box sx={{ height: 7, borderRadius: '4px', bgcolor: 'action.hover', overflow: 'hidden' }}>
                <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: color, borderRadius: '4px', transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)' }} />
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}

// ── VisitorComposition ────────────────────────────────────────────────────────
function VisitorComposition({ data }) {
  const theme = useTheme();
  if (!data?.month) return null;

  const { unique = 0, returning = 0 } = data.month;
  const total      = unique + returning;
  const returnRate = total > 0 ? Math.round((returning / total) * 100) : 0;

  const pieData = [
    { id: 0, value: unique,    label: 'New',       color: theme.palette.text.primary  },
    { id: 1, value: returning, label: 'Returning',  color: theme.palette.primary.main  },
  ].filter((d) => d.value > 0);

  return (
    <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '20px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 2 }}>
        <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px' }} color="text.primary">
          Visitors
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: 10 }}>
          Last 30 days
        </Typography>
      </Stack>

      {total === 0 ? (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, minHeight: 160 }}>
          <PeopleOutlinedIcon sx={{ fontSize: 28, color: 'text.disabled' }} />
          <Typography variant="body2" color="text.disabled">No visitor data yet</Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ flex: 1 }}>
            <PieChart
              series={[{ data: pieData, innerRadius: 54, outerRadius: 82, paddingAngle: 2, cornerRadius: 4 }]}
              height={200}
              margin={{ top: 0, right: 130, bottom: 0, left: 0 }}
              slotProps={{
                legend: {
                  direction: 'column',
                  position: { vertical: 'middle', horizontal: 'right' },
                  itemMarkWidth: 8, itemMarkHeight: 8, markGap: 6, itemGap: 12,
                  labelStyle: { fontSize: 11, fill: theme.palette.text.secondary },
                },
              }}
            />
          </Box>
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" spacing={3} justifyContent="center">
            <Stack alignItems="center" spacing={0.25}>
              <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, lineHeight: 1 }} color="text.primary">
                {returnRate}%
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Return rate
              </Typography>
            </Stack>
            <Box sx={{ width: '1px', bgcolor: 'divider' }} />
            <Stack alignItems="center" spacing={0.25}>
              <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, lineHeight: 1 }} color="text.primary">
                {fmt(total)}
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Total visitors
              </Typography>
            </Stack>
          </Stack>
        </>
      )}
    </Box>
  );
}

// ── InsightCard ───────────────────────────────────────────────────────────────
function InsightCard({ icon: Icon, label, value, subtext }) {
  return (
    <Box sx={{
      p: '20px 22px', borderRadius: '16px', border: '1px solid', borderColor: 'divider',
      bgcolor: 'background.paper', display: 'flex', alignItems: 'flex-start', gap: 1.5,
      transition: 'box-shadow 0.18s, transform 0.18s',
      '&:hover': { boxShadow: '0 6px 24px rgba(0,0,0,0.07)', transform: 'translateY(-1px)' },
    }}>
      <Box sx={{ width: 38, height: 38, borderRadius: '10px', bgcolor: 'action.selected', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon sx={{ fontSize: 17, color: 'text.secondary' }} />
      </Box>
      <Box>
        <Typography variant="caption" sx={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'text.disabled', mb: 0.3 }}>
          {label}
        </Typography>
        <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: { xs: 18, md: 24 }, fontWeight: 700, lineHeight: 1 }} color="text.primary">
          {value ?? '—'}
        </Typography>
        {subtext && (
          <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block', fontSize: 10 }}>
            {subtext}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function StoreInsights({ data }) {
  const insights = useMemo(() => {
    if (!data) return [];
    const trend  = data.trend  ?? [];
    const month  = data.month  ?? {};

    // Avg daily views (last 30 days)
    const total30  = trend.reduce((s, d) => s + (d.total || 0), 0);
    const avgDaily = Math.round(total30 / 30);

    // Peak weekday by average views on each day-of-week
    const sumByDay = [0, 0, 0, 0, 0, 0, 0];
    const cntByDay = [0, 0, 0, 0, 0, 0, 0];
    trend.forEach((d) => {
      const dow = new Date(d.date + 'T12:00:00').getDay(); // noon avoids DST edge case
      sumByDay[dow] += d.total || 0;
      cntByDay[dow]++;
    });
    const avgByDay = sumByDay.map((v, i) => cntByDay[i] > 0 ? v / cntByDay[i] : 0);
    const peakDow  = avgByDay.indexOf(Math.max(...avgByDay));
    const peakDay  = total30 > 0 ? DAYS[peakDow] : '—';

    // Return rate
    const { unique = 0, returning = 0 } = month;
    const totalVisitors = unique + returning;
    const returnRate = totalVisitors > 0 ? `${Math.round((returning / totalVisitors) * 100)}%` : '—';

    // Week-over-week growth
    const thisWeek = trend.slice(-7).reduce((s, d) => s + (d.total || 0), 0);
    const prevWeek = trend.slice(-14, -7).reduce((s, d) => s + (d.total || 0), 0);
    let growth = '—';
    if (prevWeek > 0) {
      const pct = Math.round(((thisWeek - prevWeek) / prevWeek) * 100);
      growth = `${pct >= 0 ? '+' : ''}${pct}%`;
    } else if (thisWeek > 0) {
      growth = 'New';
    }

    return [
      { icon: TrendingUpIcon,            label: 'Avg daily',   value: fmt(avgDaily), subtext: '30-day average'           },
      { icon: CalendarTodayRoundedIcon,  label: 'Busiest day', value: peakDay,       subtext: 'Highest avg traffic day'  },
      { icon: RepeatRoundedIcon,         label: 'Return rate', value: returnRate,    subtext: 'Returning / total (30d)'  },
      { icon: PersonAddOutlinedIcon,     label: '7-day growth',value: growth,        subtext: 'vs previous 7 days'       },
    ];
  }, [data]);

  return (
    <Grid container spacing={1.5}>
      {insights.map((ins) => (
        <Grid key={ins.label} size={{ xs: 6, md: 3 }}>
          <InsightCard {...ins} />
        </Grid>
      ))}
    </Grid>
  );
}

// ── Subscription gate ─────────────────────────────────────────────────────────
function SubscriptionGate({ upgradeUrl = '/subscribe' }) {
  return (
    <Box sx={{
      minHeight: 420, display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: '20px', border: '1px solid', borderColor: 'divider',
      bgcolor: 'background.paper', position: 'relative', overflow: 'hidden', mb: 4,
    }}>
      {/* faint grid watermark */}
      <Box aria-hidden sx={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage: 'repeating-linear-gradient(0deg,currentColor 0,currentColor 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,currentColor 0,currentColor 1px,transparent 1px,transparent 60px)',
        color: 'text.primary', pointerEvents: 'none',
      }} />
      <Stack alignItems="center" spacing={3} sx={{ position: 'relative', p: { xs: 4, md: 6 }, textAlign: 'center', maxWidth: 460 }}>
        <Box sx={{
          width: 64, height: 64, borderRadius: '18px',
          bgcolor: 'text.primary', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <LockOutlinedIcon sx={{ color: 'background.paper', fontSize: 28 }} />
        </Box>
        <Box>
          <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: { xs: 26, md: 32 }, fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1.15, mb: 1.25 }} color="text.primary">
            Subscribe to unlock Store Traffic
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>
            Visitor counts, trend charts, device breakdown, return rates, and performance insights are available on the{' '}
            <Box component="strong" sx={{ color: 'text.primary' }}>Basic plan</Box> and above.
          </Typography>
        </Box>
        <Stack spacing={1} sx={{ width: '100%', maxWidth: 280 }}>
          {[
            'Daily & monthly unique visitors',
            '30-day view trend chart',
            'Device & visitor breakdown',
            'Return rate & growth insights',
          ].map((f) => (
            <Stack key={f} direction="row" alignItems="center" spacing={1}>
              <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: 'text.disabled', flexShrink: 0 }} />
              <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'left' }}>{f}</Typography>
            </Stack>
          ))}
        </Stack>
        <Button
          href={upgradeUrl} variant="contained" disableElevation endIcon={<ArrowForwardIcon />}
          sx={{ bgcolor: 'text.primary', color: 'background.paper', borderRadius: '12px', fontWeight: 700, fontSize: 14, px: 4, py: 1.5, '&:hover': { bgcolor: 'text.secondary' } }}
        >
          View plans
        </Button>
      </Stack>
    </Box>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function StoreAnalyticsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const qs = `refresh=${refreshKey}`;

  const { data, error, isLoading } = useSWR(
    `/api/v1/vendor/store-views/?${qs}`,
    fetcher,
    SWR_CONFIG,
  );

  const handleRefresh = useCallback(() => {
    if (!isLoading) setRefreshKey((k) => k + 1);
  }, [isLoading]);

  const isUpgrade = error?.status === 403 && error?.errorCode === 'plan_upgrade_required';
  const dataError = error && !isUpgrade ? error : null;

  return (
    <Box sx={{ pb: 10 }}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <Box sx={{
        display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' },
        gap: 2, mb: 4,
      }}>
        <Box>
          <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: { xs: 22, sm: 28, md: 38 }, fontWeight: 700, letterSpacing: '-1.5px', lineHeight: 1, mb: 0.5 }} color="text.primary">
            Store Traffic
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Who visits your store, when, and how
          </Typography>
        </Box>
        <Button
          variant="outlined" size="small" onClick={handleRefresh} disabled={isLoading || isUpgrade}
          startIcon={isLoading ? <CircularProgress size={13} thickness={5} /> : <RefreshIcon />}
          sx={{ borderRadius: '10px', borderColor: 'divider', color: 'text.primary', fontWeight: 600, height: 40, '&:hover': { borderColor: 'text.primary', bgcolor: 'action.hover' } }}
        >
          Refresh
        </Button>
      </Box>

      {/* ── Subscription gate — replaces all sections for unpaid sellers ─ */}
      {isUpgrade && <SubscriptionGate upgradeUrl={error?.upgradeUrl || '/subscribe'} />}

      {/* ── All sections — only rendered when not gated ─────────────── */}
      {!isUpgrade && (
        <>
          {/* KPI tiles */}
          <ChartSection error={dataError} isLoading={isLoading} skeletonHeight={148} featureName="Store Traffic">
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                <ViewTile label="Today"        data={data?.today}    accent />
              </Grid>
              <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                <ViewTile label="Last 7 Days"  data={data?.week}     />
              </Grid>
              <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                <ViewTile label="Last 30 Days" data={data?.month}    />
              </Grid>
              <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                <ViewTile label="All Time"     data={data?.all_time} />
              </Grid>
            </Grid>
          </ChartSection>

          <Divider sx={{ my: 4 }} />

          <SectionHeader title="View Trend" subtitle="Daily · last 30 days" />
          <ChartSection error={dataError} isLoading={isLoading} skeletonHeight={340} featureName="View Trend">
            <TrendChart data={data} />
          </ChartSection>

          <Divider sx={{ my: 4 }} />

          <SectionHeader title="Quick Insights" subtitle="Computed from 30-day data" />
          <ChartSection error={dataError} isLoading={isLoading} skeletonHeight={120} featureName="Insights">
            <StoreInsights data={data} />
          </ChartSection>

          <Divider sx={{ my: 4 }} />

          <SectionHeader title="Visitor Breakdown" subtitle="Last 30 days" />
          <ChartSection error={dataError} isLoading={isLoading} skeletonHeight={260} featureName="Visitor Breakdown">
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, md: 7 }}>
                <DeviceBreakdown breakdown={data?.device_breakdown} />
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <VisitorComposition data={data} />
              </Grid>
            </Grid>
          </ChartSection>

          <Divider sx={{ my: 4 }} />
        </>
      )}

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <Box sx={{ p: '14px 22px', borderRadius: '12px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
        <Typography variant="caption" color="text.secondary">
          {isUpgrade
            ? 'Subscribe to a plan to unlock store traffic analytics.'
            : 'Live counts update every 3 min · daily stats materialise at midnight UTC'}
        </Typography>
        <Button href="/subscribe" size="small" variant="outlined" endIcon={<ArrowForwardIcon sx={{ fontSize: 12 }} />}
          sx={{ fontSize: 11, fontWeight: 600, borderRadius: '8px', borderColor: 'divider', color: 'text.secondary', '&:hover': { borderColor: 'text.primary', color: 'text.primary' } }}>
          {isUpgrade ? 'View plans' : 'Manage plan'}
        </Button>
      </Box>

    </Box>
  );
}
