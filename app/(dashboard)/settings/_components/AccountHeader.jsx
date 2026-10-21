'use client';

import { alpha } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import GppGoodIcon from '@mui/icons-material/GppGood';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';

const ROLE_LABELS = { owner: 'Owner', admin: 'Admin', staff: 'Staff' };
const PASSWORD_STALE_DAYS = 365;

/** Things the seller should fix, most important first. Shared with the Security tab. */
export function securityIssues(o) {
  const issues = [];
  if (!o.email_verified) issues.push('email');
  if (!o.phone_verified) issues.push('phone');
  if (o.password_changed_at) {
    const days = (Date.now() - new Date(o.password_changed_at).getTime()) / 86400000;
    if (days > PASSWORD_STALE_DAYS) issues.push('password');
  }
  return issues;
}

function initials(o) {
  return `${o.first_name?.[0] ?? ''}${o.last_name?.[0] ?? ''}`.toUpperCase() || '?';
}

export default function AccountHeader({ overview, error, onReviewSecurity }) {
  if (!overview) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 3 } }}>
        {error ? (
          <Typography variant="body2" color="text.secondary">
            We couldn&apos;t load your account summary. Your settings below still work.
          </Typography>
        ) : (
          <Stack direction="row" spacing={2} alignItems="center">
            <Skeleton variant="circular" width={56} height={56} />
            <Box sx={{ flex: 1 }}>
              <Skeleton width="40%" height={28} />
              <Skeleton width="60%" height={20} />
            </Box>
          </Stack>
        )}
      </Card>
    );
  }

  const issues = securityIssues(overview);
  const protectedOk = issues.length === 0;
  const devices = overview.seller_devices + overview.shopper_devices;
  const name = [overview.first_name, overview.last_name].filter(Boolean).join(' ') || overview.email;

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 2, md: 3 }}
        alignItems={{ md: 'center' }}
        justifyContent="space-between"
        sx={{ p: { xs: 2, sm: 3 } }}
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
          <Avatar sx={{ width: 56, height: 56, fontWeight: 700, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            {initials(overview)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" fontWeight={700} noWrap>{name}</Typography>
            <Typography variant="body2" color="text.secondary" noWrap>{overview.email}</Typography>
            {overview.store_name && (
              <Typography variant="caption" color="text.secondary">
                {ROLE_LABELS[overview.store_role] ?? 'Member'} · {overview.store_name}
              </Typography>
            )}
          </Box>
        </Stack>

        <Box
          sx={(t) => ({
            p: 1.75,
            borderRadius: 2,
            minWidth: { md: 320 },
            bgcolor: alpha(protectedOk ? t.palette.success.main : t.palette.warning.main, 0.08),
            border: 1,
            borderColor: alpha(protectedOk ? t.palette.success.main : t.palette.warning.main, 0.3),
          })}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            {protectedOk
              ? <GppGoodIcon color="success" sx={{ mt: 0.25 }} />
              : <GppMaybeIcon color="warning" sx={{ mt: 0.25 }} />}
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                {protectedOk
                  ? 'Your account is protected'
                  : `${issues.length} thing${issues.length === 1 ? '' : 's'} to secure`}
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div">
                Two-step sign-in is on · {devices} device{devices === 1 ? '' : 's'} signed in
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center" flexWrap="wrap" useFlexGap>
                <Chip size="small" label="Sign-in code required" color="success" variant="outlined" sx={{ height: 22, fontSize: 11 }} />
                <Button size="small" onClick={onReviewSecurity} sx={{ px: 1, minWidth: 0 }}>
                  {protectedOk ? 'Review security' : 'Fix now'}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}
