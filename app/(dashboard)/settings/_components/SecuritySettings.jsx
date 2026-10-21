'use client';

/**
 * Security tab: a checkup of how protected the account is, password, every
 * device signed in (Seller Centre and shopping), recent security activity and
 * a lockdown button for "someone else is in my account".
 *
 * Signing a device out is real: the backend blacklists its refresh token and
 * rejects its access token on the next request (userauths/session_utils.py).
 */

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { alpha } from '@mui/material/styles';
import { createAxiosClient } from '@/utils/clientFetch';
import { useAppDispatch } from '@/redux/hooks';
import { logout } from '@/redux/features/authSlice';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ComputerIcon from '@mui/icons-material/Computer';
import DeviceUnknownIcon from '@mui/icons-material/DeviceUnknown';
import DevicesIcon from '@mui/icons-material/Devices';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import GppBadIcon from '@mui/icons-material/GppBad';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import KeyIcon from '@mui/icons-material/Key';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import PhonelinkEraseIcon from '@mui/icons-material/PhonelinkErase';
import RefreshIcon from '@mui/icons-material/Refresh';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import TabletIcon from '@mui/icons-material/Tablet';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import toast from 'react-hot-toast';
import { securityIssues } from './AccountHeader';

// ── helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso) {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function timeAgo(iso) {
  if (!iso) return '';
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

const DEVICE_ICONS = {
  desktop: ComputerIcon,
  mobile: PhoneAndroidIcon,
  tablet: TabletIcon,
  unknown: DeviceUnknownIcon,
};

function DeviceIcon({ type, ...props }) {
  const Icon = DEVICE_ICONS[type] ?? DeviceUnknownIcon;
  return <Icon {...props} />;
}

function errorText(err, fallback) {
  const d = err?.response?.data;
  return d?.detail || fallback;
}

function SectionTitle({ title, subtitle, action }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ sm: 'flex-end' }}
      justifyContent="space-between"
      spacing={1}
      sx={{ mb: 1.5 }}
    >
      <Box>
        <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>
        {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
      </Box>
      {action}
    </Stack>
  );
}

// ── security checkup ─────────────────────────────────────────────────────────

const CHECK_TONE = {
  ok: { Icon: CheckCircleIcon, color: 'success' },
  warn: { Icon: ErrorOutlineIcon, color: 'warning' },
  info: { Icon: InfoOutlinedIcon, color: 'info' },
};

function CheckRow({ tone, title, detail }) {
  const { Icon, color } = CHECK_TONE[tone];
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ py: 1.25 }}>
      <Icon color={color} fontSize="small" sx={{ mt: 0.25 }} />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600}>{title}</Typography>
        <Typography variant="caption" color="text.secondary" component="div">{detail}</Typography>
      </Box>
    </Stack>
  );
}

function SecurityCheckup({ overview }) {
  if (!overview) {
    return <Skeleton variant="rounded" height={220} sx={{ borderRadius: 2 }} />;
  }
  const issues = securityIssues(overview);
  const devices = overview.seller_devices + overview.shopper_devices;

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, px: { xs: 2, sm: 2.5 }, py: 1 }}>
      <Stack divider={<Divider flexItem />}>
        <CheckRow
          tone="ok"
          title="Two-step sign-in is on"
          detail="Every Seller Centre sign-in needs your password and a one-time code sent to your email or phone."
        />
        <CheckRow
          tone={overview.email_verified ? 'ok' : 'warn'}
          title={overview.email_verified ? 'Email verified' : 'Email not verified'}
          detail={overview.email_verified
            ? `${overview.email} receives your sign-in codes and security alerts.`
            : 'Verify your email so we can send you sign-in codes and alerts.'}
        />
        <CheckRow
          tone={overview.phone_verified ? 'ok' : 'warn'}
          title={overview.phone_verified ? 'Phone verified' : 'Phone not verified'}
          detail={overview.phone_verified
            ? `${overview.phone} can receive sign-in codes.`
            : 'Verify your phone number so you can still sign in if you lose access to your email.'}
        />
        <CheckRow
          tone={issues.includes('password') ? 'warn' : overview.password_changed_at ? 'ok' : 'info'}
          title="Password"
          detail={overview.password_changed_at
            ? `Last changed ${timeAgo(overview.password_changed_at)}.${issues.includes('password') ? ' Consider choosing a new one.' : ''}`
            : 'Use a password you don\'t use on any other website.'}
        />
        <CheckRow
          tone="info"
          title={`${devices} device${devices === 1 ? '' : 's'} signed in`}
          detail="We email you whenever your account signs in from a new device. Sign out anything you don't recognise below."
        />
      </Stack>
    </Card>
  );
}

// ── password ─────────────────────────────────────────────────────────────────

function passwordStrength(pw) {
  if (!pw) return null;
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  if (score <= 2) return { value: 33, label: 'Weak', color: 'error' };
  if (score <= 3) return { value: 66, label: 'Fair', color: 'warning' };
  return { value: 100, label: 'Strong', color: 'success' };
}

const EMPTY_PASSWORD_FORM = { current_password: '', new_password: '', confirm: '' };

function PasswordSection({ overview, onChanged }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_PASSWORD_FORM);
  const [signOutOthers, setSignOutOthers] = useState(true);
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const strength = passwordStrength(form.new_password);

  const field = (key) => ({
    value: form[key],
    onChange: (e) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
    },
  });

  const close = () => {
    setOpen(false);
    setForm(EMPTY_PASSWORD_FORM);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.current_password) errs.current_password = 'Required.';
    if (form.new_password.length < 8) errs.new_password = 'Must be at least 8 characters.';
    if (form.new_password !== form.confirm) errs.confirm = 'Passwords do not match.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      const { data } = await createAxiosClient().post('/api/vendor/security/password/', {
        current_password: form.current_password,
        new_password: form.new_password,
        sign_out_other_devices: signOutOthers,
      });
      close();
      const n = data?.signed_out_devices ?? 0;
      toast.success(n > 0
        ? `Password changed. ${n} other device${n === 1 ? ' was' : 's were'} signed out.`
        : 'Password changed.');
      onChanged();
    } catch (err) {
      const d = err.response?.data;
      const first = (v) => (Array.isArray(v) ? v[0] : v);
      if (d?.current_password) setErrors({ current_password: first(d.current_password) });
      else if (d?.new_password) setErrors({ new_password: first(d.new_password) });
      else toast.error(errorText(err, 'Could not change your password. Try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!overview?.email) return;
    setSendingReset(true);
    try {
      await createAxiosClient().post('/api/users/reset_password/', { email: overview.email });
      toast.success(`Reset link sent to ${overview.email}.`);
    } catch (err) {
      toast.error(errorText(err, 'Could not send the reset email.'));
    } finally {
      setSendingReset(false);
    }
  };

  const visibility = {
    endAdornment: (
      <InputAdornment position="end">
        <IconButton onClick={() => setShow((s) => !s)} edge="end" size="small" aria-label={show ? 'Hide passwords' : 'Show passwords'}>
          {show ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
        </IconButton>
      </InputAdornment>
    ),
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, p: { xs: 2, sm: 2.5 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={(t) => ({ p: 1.25, borderRadius: 2, display: 'flex', bgcolor: alpha(t.palette.primary.main, 0.1) })}>
            <KeyIcon color="primary" />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>Password</Typography>
            <Typography variant="body2" color="text.secondary">
              {overview?.password_changed_at
                ? `Last changed ${timeAgo(overview.password_changed_at)}`
                : 'Change the password you sign in with.'}
            </Typography>
          </Box>
        </Stack>
        <Button variant="outlined" onClick={open ? close : () => setOpen(true)} sx={{ flexShrink: 0 }}>
          {open ? 'Cancel' : 'Change password'}
        </Button>
      </Stack>

      <Collapse in={open} unmountOnExit>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2.5 }}>
          <Stack spacing={2}>
            <TextField
              label="Current password"
              type={show ? 'text' : 'password'}
              {...field('current_password')}
              error={Boolean(errors.current_password)}
              helperText={errors.current_password}
              size="small"
              fullWidth
              autoComplete="current-password"
              InputProps={visibility}
            />
            <Box>
              <TextField
                label="New password"
                type={show ? 'text' : 'password'}
                {...field('new_password')}
                error={Boolean(errors.new_password)}
                helperText={errors.new_password || 'At least 8 characters. Longer is stronger.'}
                size="small"
                fullWidth
                autoComplete="new-password"
                InputProps={visibility}
              />
              {strength && (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={strength.value}
                    color={strength.color}
                    sx={{ flex: 1, height: 6, borderRadius: 3 }}
                  />
                  <Typography variant="caption" color={`${strength.color}.main`} fontWeight={600} sx={{ minWidth: 48 }}>
                    {strength.label}
                  </Typography>
                </Stack>
              )}
            </Box>
            <TextField
              label="Confirm new password"
              type={show ? 'text' : 'password'}
              {...field('confirm')}
              error={Boolean(errors.confirm)}
              helperText={errors.confirm}
              size="small"
              fullWidth
              autoComplete="new-password"
            />
            <FormControlLabel
              control={<Checkbox checked={signOutOthers} onChange={(e) => setSignOutOthers(e.target.checked)} />}
              label={
                <Typography variant="body2">
                  Sign out of all other devices
                  <Typography component="span" variant="caption" color="text.secondary" display="block">
                    Recommended if you think someone else knows your password.
                  </Typography>
                </Typography>
              }
            />
            <Stack direction={{ xs: 'column-reverse', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={1}>
              <Button variant="text" size="small" onClick={handleForgotPassword} disabled={sendingReset} sx={{ color: 'text.secondary' }}>
                {sendingReset ? 'Sending…' : 'Forgot your current password?'}
              </Button>
              <Button type="submit" variant="contained" disabled={submitting} sx={{ minWidth: 160 }}>
                {submitting ? 'Saving…' : 'Update password'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Collapse>
    </Card>
  );
}

// ── devices ──────────────────────────────────────────────────────────────────

function DeviceRow({ session, onSignOut }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 1.5, px: { xs: 2, sm: 2.5 } }}>
      <Box
        sx={(t) => ({
          p: 1,
          borderRadius: 1.5,
          display: 'flex',
          flexShrink: 0,
          color: session.is_current ? 'primary.main' : 'text.secondary',
          bgcolor: session.is_current ? alpha(t.palette.primary.main, 0.1) : 'action.hover',
        })}
      >
        <DeviceIcon type={session.device_type} fontSize="small" />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap>{session.device_name}</Typography>
          {session.is_current && (
            <Chip label="This device" size="small" color="primary" sx={{ height: 20, fontSize: 11, fontWeight: 700, flexShrink: 0 }} />
          )}
        </Stack>
        <Typography variant="caption" color="text.secondary" component="div" noWrap>
          {session.is_current ? 'Active now' : `Last active ${timeAgo(session.last_activity)}`}
          {session.ip_address ? ` · IP ${session.ip_address}` : ''}
        </Typography>
        <Typography variant="caption" color="text.disabled" component="div" noWrap>
          Signed in {fmtDate(session.created_at)}
        </Typography>
      </Box>
      {!session.is_current && (
        <Button size="small" color="error" onClick={() => onSignOut(session)} sx={{ flexShrink: 0 }}>
          Sign out
        </Button>
      )}
    </Stack>
  );
}

function DeviceGroup({ title, icon, sessions, onSignOut }) {
  if (sessions.length === 0) return null;
  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, color: 'text.secondary' }}>
        {icon}
        <Typography variant="overline" fontWeight={700} sx={{ lineHeight: 1.5 }}>
          {title} · {sessions.length}
        </Typography>
      </Stack>
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <Stack divider={<Divider />}>
          {sessions.map((s) => <DeviceRow key={s.id} session={s} onSignOut={onSignOut} />)}
        </Stack>
      </Card>
    </Box>
  );
}

function DevicesSection({ onChanged }) {
  const fullScreen = useMediaQuery((t) => t.breakpoints.down('sm'));
  const [sessions, setSessions] = useState(null);
  const [failed, setFailed] = useState(false);
  const [target, setTarget] = useState(null);      // a session, or 'others'
  const [working, setWorking] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await createAxiosClient().get('/api/vendor/sessions/');
      setSessions(Array.isArray(data) ? data : []);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const others = (sessions ?? []).filter((s) => !s.is_current);

  const confirm = async () => {
    setWorking(true);
    try {
      const client = createAxiosClient();
      if (target === 'others') {
        const { data } = await client.post('/api/vendor/logout-other-sessions/');
        toast.success(data?.detail || 'Other devices signed out.');
      } else {
        await client.delete(`/api/vendor/sessions/${target.id}/`);
        toast.success(`${target.device_name} was signed out.`);
      }
      setTarget(null);
      await load();
      onChanged();
    } catch (err) {
      toast.error(errorText(err, 'Could not sign that device out. Try again.'));
    } finally {
      setWorking(false);
    }
  };

  return (
    <Box>
      <SectionTitle
        title="Where you're signed in"
        subtitle="Your Negromart account on Seller Centre and on the shop. Don't recognise a device? Sign it out."
        action={sessions && (
          <Stack direction="row" spacing={1}>
            <Button size="small" startIcon={<RefreshIcon fontSize="small" />} onClick={load}>Refresh</Button>
            {others.length > 0 && (
              <Button size="small" variant="outlined" color="error" startIcon={<LogoutIcon fontSize="small" />} onClick={() => setTarget('others')}>
                Sign out {others.length} other{others.length === 1 ? '' : 's'}
              </Button>
            )}
          </Stack>
        )}
      />

      {failed ? (
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={load}>Retry</Button>}>
          We couldn&apos;t load your devices.
        </Alert>
      ) : !sessions ? (
        <Skeleton variant="rounded" height={140} sx={{ borderRadius: 2 }} />
      ) : sessions.length === 0 ? (
        <Alert severity="info">Device tracking starts from your next sign-in.</Alert>
      ) : (
        <Stack spacing={2.5}>
          <DeviceGroup
            title="Seller Centre"
            icon={<StorefrontOutlinedIcon fontSize="small" />}
            sessions={sessions.filter((s) => s.kind === 'seller')}
            onSignOut={setTarget}
          />
          <DeviceGroup
            title="Shopping on Negromart"
            icon={<ShoppingBagOutlinedIcon fontSize="small" />}
            sessions={sessions.filter((s) => s.kind === 'shopper')}
            onSignOut={setTarget}
          />
        </Stack>
      )}

      <Dialog open={Boolean(target)} onClose={() => !working && setTarget(null)} maxWidth="xs" fullWidth fullScreen={fullScreen}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {target === 'others' ? 'Sign out all other devices?' : 'Sign out this device?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            {target === 'others' ? (
              <>
                {others.length} device{others.length === 1 ? '' : 's'} will be signed out right away, on Seller
                Centre and on the shop. You&apos;ll stay signed in here.
              </>
            ) : target ? (
              <>
                <strong>{target.device_name}</strong>
                {target.ip_address ? ` (IP ${target.ip_address})` : ''} will be signed out right away and
                will need your password and a sign-in code to get back in.
              </>
            ) : null}
          </DialogContentText>
          <Alert severity="info" sx={{ mt: 2 }}>
            If you didn&apos;t sign in there yourself, change your password too.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setTarget(null)} disabled={working}>Cancel</Button>
          <Button
            onClick={confirm}
            variant="contained"
            color="error"
            disabled={working}
            startIcon={working ? <CircularProgress size={16} color="inherit" /> : <LogoutIcon />}
          >
            Sign out
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ── recent activity ──────────────────────────────────────────────────────────

const EVENT_ICONS = {
  sign_in: LoginIcon,
  sign_out: LogoutIcon,
  device_signed_out: PhonelinkEraseIcon,
  others_signed_out: DevicesIcon,
  signed_out_everywhere: GppBadIcon,
  password_changed: KeyIcon,
};

function describeEvent(e) {
  const m = e.metadata || {};
  switch (e.event) {
    case 'sign_in':
      return 'Signed in to Seller Centre';
    case 'sign_out':
      return 'Signed out of Seller Centre';
    case 'device_signed_out':
      return `Signed out ${m.target || 'a device'}`;
    case 'others_signed_out':
      return `Signed out ${m.count} other device${m.count === 1 ? '' : 's'}`;
    case 'signed_out_everywhere':
      return 'Signed out everywhere';
    case 'password_changed':
      return m.signed_out_devices
        ? `Password changed · ${m.signed_out_devices} device${m.signed_out_devices === 1 ? '' : 's'} signed out`
        : 'Password changed';
    default:
      return e.label;
  }
}

function ActivitySection({ overview }) {
  const events = overview?.events;
  return (
    <Box>
      <SectionTitle
        title="Recent security activity"
        subtitle="Sign-ins and changes to your account. Anything you don't recognise? Secure your account below."
      />
      {!overview ? (
        <Skeleton variant="rounded" height={160} sx={{ borderRadius: 2 }} />
      ) : events.length === 0 ? (
        <Alert severity="info">Your security activity will appear here from your next sign-in.</Alert>
      ) : (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <Stack divider={<Divider />}>
            {events.map((e) => {
              const Icon = EVENT_ICONS[e.event] ?? InfoOutlinedIcon;
              return (
                <Stack key={e.id} direction="row" spacing={1.5} alignItems="flex-start" sx={{ py: 1.5, px: { xs: 2, sm: 2.5 } }}>
                  <Icon fontSize="small" sx={{ mt: 0.25, color: e.new_device ? 'warning.main' : 'text.secondary' }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Typography variant="body2" fontWeight={600}>{describeEvent(e)}</Typography>
                      {e.new_device && (
                        <Chip label="New device" size="small" color="warning" variant="outlined" sx={{ height: 20, fontSize: 11 }} />
                      )}
                    </Stack>
                    <Typography variant="caption" color="text.secondary" component="div" noWrap>
                      {[e.device_name, e.ip_address && `IP ${e.ip_address}`].filter(Boolean).join(' · ') || '—'}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" title={fmtDate(e.created_at)} sx={{ flexShrink: 0, mt: 0.25 }}>
                    {timeAgo(e.created_at)}
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
        </Card>
      )}
    </Box>
  );
}

// ── lockdown ─────────────────────────────────────────────────────────────────

function LockdownSection() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const fullScreen = useMediaQuery((t) => t.breakpoints.down('sm'));
  const [open, setOpen] = useState(false);
  const [working, setWorking] = useState(false);

  const signOutEverywhere = async () => {
    setWorking(true);
    try {
      await createAxiosClient().post('/api/vendor/logout-all/');
      dispatch(logout());
      toast.success('Signed out everywhere. Sign back in, then change your password.');
      router.push('/auth/login');
    } catch (err) {
      toast.error(errorText(err, 'Could not sign out everywhere. Try again.'));
      setWorking(false);
    }
  };

  return (
    <Box
      sx={(t) => ({
        p: { xs: 2, sm: 2.5 },
        borderRadius: 2,
        border: 1,
        borderColor: alpha(t.palette.error.main, 0.35),
        bgcolor: alpha(t.palette.error.main, 0.04),
      })}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <GppBadIcon color="error" sx={{ mt: 0.25 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>Think someone else is in your account?</Typography>
            <Typography variant="body2" color="text.secondary">
              Sign out everywhere at once, including this device and the shop. Then sign back in and change your password.
            </Typography>
          </Box>
        </Stack>
        <Button variant="contained" color="error" onClick={() => setOpen(true)} sx={{ flexShrink: 0 }}>
          Sign out everywhere
        </Button>
      </Stack>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 1.5, mb: 0 }}>
        Negromart will never ask for your password or sign-in code by phone, SMS or chat.
        Still worried? Email <a href="mailto:support@negromart.com">support@negromart.com</a>.
      </Typography>

      <Dialog open={open} onClose={() => !working && setOpen(false)} maxWidth="xs" fullWidth fullScreen={fullScreen}>
        <DialogTitle sx={{ fontWeight: 700 }}>Sign out everywhere?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Every device signed in to your Negromart account will be signed out immediately, on Seller
            Centre and on the shop, including this one. You&apos;ll need your password and a sign-in code
            to get back in.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setOpen(false)} disabled={working}>Cancel</Button>
          <Button
            onClick={signOutEverywhere}
            variant="contained"
            color="error"
            disabled={working}
            startIcon={working ? <CircularProgress size={16} color="inherit" /> : <GppBadIcon />}
          >
            Sign out everywhere
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ── main ─────────────────────────────────────────────────────────────────────

export default function SecuritySettings({ overview, onChanged }) {
  return (
    <Stack spacing={4}>
      <Box>
        <SectionTitle
          title="Security checkup"
          subtitle="How your account is protected right now."
        />
        <SecurityCheckup overview={overview} />
      </Box>
      <PasswordSection overview={overview} onChanged={onChanged} />
      <DevicesSection onChanged={onChanged} />
      <ActivitySection overview={overview} />
      <LockdownSection />
    </Stack>
  );
}
