'use client';

/**
 * Building blocks for the seller Home page (app/(dashboard)/dashboard).
 * Layout follows Walmart Seller Center's home: greeting + quick actions,
 * today's tasks next to the performance scorecard, then sales.
 */
import Link from 'next/link';
import { alpha } from '@mui/material/styles';
import { Box, Button, Card, Chip, Divider, Grid, LinearProgress, Stack, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import useVendorAccess, { CAP } from '@/hooks/useVendorAccess';

export const HEADING_FONT = 'var(--font-figtree), system-ui, sans-serif';

/** The card every Home section sits in, so they all line up. */
export function HomeCard({ title, subtitle, action, children, sx, id, noPad = false }) {
  return (
    <Card id={id} variant="outlined" sx={{ borderRadius: '20px', height: '100%', display: 'flex', flexDirection: 'column', minWidth: 0, scrollMarginTop: 16, ...sx }}>
      {(title || action) && (
        <>
          <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 1.75, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap' }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontFamily: HEADING_FONT, fontWeight: 700, fontSize: 17, letterSpacing: '-0.3px' }}>{title}</Typography>
              {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
            </Box>
            {action}
          </Box>
          <Divider />
        </>
      )}
      <Box sx={{ flex: 1, minWidth: 0, ...(noPad ? {} : { p: { xs: 2, sm: 2.5 } }) }}>{children}</Box>
    </Card>
  );
}

export function CardLink({ href, children }) {
  return (
    <Button component={Link} href={href} size="small" endIcon={<ChevronRightRoundedIcon />} sx={{ fontWeight: 600, fontSize: 13, textTransform: 'none' }}>
      {children}
    </Button>
  );
}

// ── Greeting + quick actions ──────────────────────────────────────────────────
function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export function HomeHeader({ storeName, vendorStatus, toShip }) {
  const { can } = useVendorAccess();
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  const actions = [
    can(CAP.MANAGE_CATALOG) && { href: '/products/product', label: 'Add a product', icon: <AddRoundedIcon />, primary: true },
    can(CAP.MANAGE_ORDERS)  && { href: '/orders?filter=to_ship', label: toShip ? `Ship orders (${toShip})` : 'Ship orders', icon: <LocalShippingRoundedIcon /> },
    can(CAP.MANAGE_CATALOG) && { href: '/coupons', label: 'Create a coupon', icon: <LocalOfferRoundedIcon /> },
    can(CAP.VIEW_FINANCE)   && { href: '/payouts', label: 'Earnings', icon: <PaymentsRoundedIcon /> },
  ].filter(Boolean);

  return (
    <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', md: 'flex-end' }, justifyContent: 'space-between', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{today}</Typography>
        <Stack direction="row" alignItems="center" spacing={1.25} flexWrap="wrap" useFlexGap>
          <Typography component="h1" sx={{ fontFamily: HEADING_FONT, fontSize: { xs: 24, sm: 30 }, fontWeight: 700, letterSpacing: '-1px', lineHeight: 1.15 }}>
            {greeting()}{storeName ? `, ${storeName}` : ''}
          </Typography>
          {vendorStatus && (
            <Chip
              component={Link}
              href="/settings"
              clickable
              size="small"
              label={vendorStatus.shop_paused ? 'Shop paused' : 'Shop live'}
              color={vendorStatus.shop_paused ? 'warning' : 'success'}
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: 12 }}
            />
          )}
        </Stack>
      </Box>

      {/* Phones: 2×2 grid of equal buttons. Desktop: one row. */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: `repeat(${actions.length}, auto)` }, gap: 1, width: { xs: '100%', md: 'auto' } }}>
        {actions.map((a) => (
          <Button
            key={a.href}
            component={Link}
            href={a.href}
            variant={a.primary ? 'contained' : 'outlined'}
            disableElevation
            startIcon={a.icon}
            sx={{
              borderRadius: '10px', fontWeight: 600, textTransform: 'none', whiteSpace: 'nowrap', height: 40,
              ...(a.primary ? {} : { borderColor: 'divider', color: 'text.primary', '&:hover': { borderColor: 'text.primary', bgcolor: 'action.hover' } }),
            }}
          >
            {a.label}
          </Button>
        ))}
      </Box>
    </Box>
  );
}

// ── Performance scorecard ─────────────────────────────────────────────────────
// Store-health targets shown to sellers as guidance. They are not enforced by
// the backend; adjust here if the marketplace standards change.
const STANDARDS = [
  { key: 'on_time_delivery_rate', label: 'On-time delivery', target: 90,  better: 'higher', fmt: (v) => `${v.toFixed(1)}%`, targetText: '≥ 90%', max: 100, help: '/orders' },
  { key: 'cancellation_rate',     label: 'Cancellation rate', target: 2,  better: 'lower',  fmt: (v) => `${v.toFixed(1)}%`, targetText: '≤ 2%',  max: 10,  help: '/orders' },
  { key: 'refund_rate',           label: 'Refund rate',       target: 6,  better: 'lower',  fmt: (v) => `${v.toFixed(1)}%`, targetText: '≤ 6%',  max: 20,  help: '/order-returns' },
  { key: 'avg_rating',            label: 'Average rating',    target: 4,  better: 'higher', fmt: (v) => `${v.toFixed(1)} ★`, targetText: '≥ 4.0', max: 5,   help: '/reviews' },
];

export function PerformanceScorecard({ data }) {
  const rows = STANDARDS.map((s) => {
    const raw = data?.[s.key];
    const value = raw == null ? null : Number(raw);
    const ok = value == null ? null : s.better === 'higher' ? value >= s.target : value <= s.target;
    return { ...s, value, ok };
  });
  const measured = rows.filter((r) => r.ok !== null);
  const failing = measured.filter((r) => !r.ok).length;

  const summary = !measured.length
    ? { text: 'Not enough orders yet', color: 'text.secondary' }
    : failing
      ? { text: `${failing} metric${failing === 1 ? '' : 's'} below target`, color: 'warning.main' }
      : { text: 'All metrics on target', color: 'success.main' };

  return (
    <HomeCard title="Seller performance" subtitle={<Box component="span" sx={{ color: summary.color, fontWeight: 600 }}>{summary.text}</Box>}>
      <Stack spacing={2}>
        {rows.map((r) => {
          const pct = r.value == null ? 0 : Math.min(100, (r.value / r.max) * 100);
          const color = r.ok === null ? 'inherit' : r.ok ? 'success' : 'warning';
          return (
            <Box key={r.key} component={Link} href={r.help} sx={{ textDecoration: 'none', color: 'inherit', display: 'block', borderRadius: 1, '&:hover .metric-label': { textDecoration: 'underline' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                {r.ok === null ? null : r.ok
                  ? <CheckCircleRoundedIcon sx={{ fontSize: 16, color: 'success.main' }} />
                  : <ErrorRoundedIcon sx={{ fontSize: 16, color: 'warning.main' }} />}
                <Typography className="metric-label" sx={{ fontSize: 13.5, fontWeight: 600, flex: 1 }}>{r.label}</Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{r.value == null ? '—' : r.fmt(r.value)}</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={pct}
                color={color}
                sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { borderRadius: 3, ...(r.ok === null ? { bgcolor: 'text.disabled' } : {}) } }}
              />
              <Typography sx={{ fontSize: 11.5, color: 'text.secondary', mt: 0.5 }}>Target {r.targetText}</Typography>
            </Box>
          );
        })}
      </Stack>
    </HomeCard>
  );
}

// ── KPI strip ─────────────────────────────────────────────────────────────────
const money = (n) => (n == null ? '—' : `GHS ${Number(n).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
const count = (n) => (n == null ? '—' : Number(n).toLocaleString());

function Kpi({ label, value, hero }) {
  return (
    <Box sx={{
      p: { xs: 1.75, sm: 2.25 }, height: '100%', borderRadius: '12px', minWidth: 0,
      bgcolor: hero ? (t) => alpha(t.palette.primary.main, 0.08) : 'action.hover',
    }}>
      <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: hero ? 'primary.main' : 'text.secondary', mb: 0.75 }}>{label}</Typography>
      <Typography sx={{ fontFamily: HEADING_FONT, fontSize: { xs: 18, sm: 24 }, fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {value}
      </Typography>
    </Box>
  );
}

export function SalesKpis({ data }) {
  const items = [
    { label: 'Revenue', value: money(data?.total_revenue), hero: true },
    { label: 'Orders', value: count(data?.total_orders) },
    { label: 'Units sold', value: count(data?.total_units_sold) },
    { label: 'Avg order value', value: money(data?.avg_order_value) },
    { label: 'Product views', value: count(data?.total_views) },
    { label: 'Wishlisted', value: count(data?.wishlist_count) },
  ];
  return (
    <Grid container spacing={1.5}>
      {items.map((k) => (
        <Grid key={k.label} size={{ xs: 6, sm: 4, lg: 2 }}>
          <Kpi {...k} />
        </Grid>
      ))}
    </Grid>
  );
}

// ── Plan nudge (free / basic stores only) ─────────────────────────────────────
export function PlanCard({ plan }) {
  if (!plan || ['pro', 'enterprise'].includes(plan.tier)) return null;
  return (
    <HomeCard>
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: (t) => alpha(t.palette.warning.main, 0.15), color: 'warning.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <WorkspacePremiumRoundedIcon fontSize="small" />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 15 }}>You&rsquo;re on {plan.name}</Typography>
            <Typography variant="caption" color="text.secondary">Commission {Number(plan.commission_rate).toString()}% · payouts after {plan.payout_delay_days} days</Typography>
          </Box>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Higher plans lower your commission, pay out faster and unlock more analytics.
        </Typography>
        <Button component={Link} href="/subscribe" variant="outlined" sx={{ borderRadius: '10px', fontWeight: 600, textTransform: 'none', alignSelf: 'flex-start' }}>
          Compare plans
        </Button>
      </Stack>
    </HomeCard>
  );
}
