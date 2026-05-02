'use client';

import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import BadgeIcon from '@mui/icons-material/Badge';
import BlockIcon from '@mui/icons-material/Block';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import StarIcon from '@mui/icons-material/Star';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Link from 'next/link';

const STATUS_CONFIG = {
  PENDING:   { label: 'Pending Review',  color: 'warning', icon: <HourglassEmptyIcon /> },
  VERIFIED:  { label: 'Verified',        color: 'success', icon: <CheckCircleIcon /> },
  REJECTED:  { label: 'Rejected',        color: 'error',   icon: <ErrorIcon /> },
  SUSPENDED: { label: 'Suspended',       color: 'error',   icon: <BlockIcon /> },
};

function fmtDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function StatCard({ icon, label, value, sub, valueColor }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1.5, flexShrink: 0 }}>
            {React.cloneElement(icon, { sx: { fontSize: 20, color: 'primary.main' } })}
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
            <Typography variant="subtitle1" fontWeight={700} color={valueColor || 'text.primary'}>{value}</Typography>
            {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function AccountStatusTab({ account }) {
  if (!account) return null;

  const cfg = STATUS_CONFIG[account.status] || STATUS_CONFIG.PENDING;

  const daysLeft = account.subscription_end_date
    ? Math.max(0, Math.ceil((new Date(account.subscription_end_date) - new Date()) / 86_400_000))
    : 0;

  const subProgress = account.subscription_start_date && account.subscription_end_date
    ? Math.max(0, Math.min(100, Math.round(
        (new Date() - new Date(account.subscription_start_date)) /
        (new Date(account.subscription_end_date) - new Date(account.subscription_start_date)) * 100
      )))
    : 0;

  return (
    <Stack spacing={3}>
      {/* Verification */}
      <Card sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>Verification Status</Typography>
        <Divider sx={{ mb: 2.5 }} />

        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <Chip icon={cfg.icon} label={cfg.label} color={cfg.color} sx={{ fontWeight: 600 }} />
            {account.is_approved && <Chip label="Approved" color="success" variant="outlined" size="small" />}
            {account.is_featured && <Chip icon={<StarIcon />} label="Featured" color="warning" variant="outlined" size="small" />}
          </Stack>

          {account.status === 'PENDING' && (
            <Alert severity="info" icon={<HourglassEmptyIcon />}>
              Your account is under review. Our team will verify your documents and notify you once approved.
              This typically takes 1–3 business days.
            </Alert>
          )}
          {account.status === 'REJECTED' && (
            <Alert severity="error">
              Your verification was rejected. Please update your documents in the{' '}
              <strong>Documents</strong> tab and ensure all submissions are clear and valid.
              Contact support if you need assistance.
            </Alert>
          )}
          {account.status === 'SUSPENDED' && (
            <Alert severity="error">
              Your account has been suspended. Please contact our support team for assistance.
            </Alert>
          )}
          {account.status === 'VERIFIED' && !account.is_approved && (
            <Alert severity="warning">
              Your identity is verified, but your account is not yet fully approved to list products.
            </Alert>
          )}
        </Stack>
      </Card>

      {/* Stats */}
      <Box>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Account Overview</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<CalendarMonthIcon />}
              label="Member Since"
              value={fmtDate(account.created_at).split(',')[0]}
              sub={new Date(account.created_at).getFullYear()}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<VisibilityIcon />}
              label="Profile Views"
              value={(account.views || 0).toLocaleString()}
              sub="All time"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<BadgeIcon />}
              label="Vendor Type"
              value={account.vendor_type === 'student' ? 'Student' : 'Business'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<CardMembershipIcon />}
              label="Subscription"
              value={account.is_subscribed ? 'Active' : 'Inactive'}
              valueColor={account.is_subscribed ? 'success.main' : 'text.secondary'}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Subscription detail */}
      <Card sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>Subscription</Typography>
          <Button component={Link} href="/subscribe" variant="outlined" size="small">
            Manage Plan
          </Button>
        </Stack>
        <Divider sx={{ mb: 2.5 }} />

        {account.is_subscribed ? (
          <Stack spacing={2.5}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              <Box>
                <Typography variant="caption" color="text.secondary">Start Date</Typography>
                <Typography variant="body2" fontWeight={600}>{fmtDate(account.subscription_start_date)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">End Date</Typography>
                <Typography variant="body2" fontWeight={600}>{fmtDate(account.subscription_end_date)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Days Remaining</Typography>
                <Typography
                  variant="body2"
                  fontWeight={700}
                  color={daysLeft <= 7 ? 'error.main' : daysLeft <= 30 ? 'warning.main' : 'success.main'}
                >
                  {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                </Typography>
              </Box>
            </Stack>

            <Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">Subscription usage</Typography>
                <Typography variant="caption" color="text.secondary">{subProgress}%</Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={subProgress}
                color={daysLeft <= 7 ? 'error' : daysLeft <= 30 ? 'warning' : 'success'}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>

            {daysLeft <= 30 && (
              <Alert severity={daysLeft <= 7 ? 'error' : 'warning'}>
                {daysLeft <= 7
                  ? 'Your subscription expires very soon! Renew now to avoid interruption.'
                  : `Your subscription expires in ${daysLeft} days. Consider renewing soon.`}
              </Alert>
            )}
          </Stack>
        ) : (
          <Stack spacing={2} alignItems="flex-start">
            <Typography variant="body2" color="text.secondary">
              You don't have an active subscription. Subscribe to unlock full selling capabilities.
            </Typography>
            <Button component={Link} href="/subscribe" variant="contained" size="small">
              View Plans
            </Button>
          </Stack>
        )}
      </Card>
    </Stack>
  );
}
