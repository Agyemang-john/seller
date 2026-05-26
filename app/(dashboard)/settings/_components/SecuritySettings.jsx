'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createAxiosClient } from '@/utils/clientFetch';
import { useAppDispatch } from '@/redux/hooks';
import { logout } from '@/redux/features/authSlice';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import ComputerIcon from '@mui/icons-material/Computer';
import DeviceUnknownIcon from '@mui/icons-material/DeviceUnknown';
import LockResetIcon from '@mui/icons-material/LockReset';
import LogoutIcon from '@mui/icons-material/Logout';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import SecurityIcon from '@mui/icons-material/Security';
import TabletIcon from '@mui/icons-material/Tablet';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import toast from 'react-hot-toast';

// ── helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso) {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function timeAgo(iso) {
  if (!iso) return '';
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  } catch {
    return '';
  }
}

const DEVICE_ICONS = {
  desktop: <ComputerIcon fontSize="small" />,
  mobile: <PhoneAndroidIcon fontSize="small" />,
  tablet: <TabletIcon fontSize="small" />,
  unknown: <DeviceUnknownIcon fontSize="small" />,
};

// ── sub-components ───────────────────────────────────────────────────────────

function SessionCard({ session, onRevoke, revoking }) {
  const icon = DEVICE_ICONS[session.device_type] ?? DEVICE_ICONS.unknown;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        borderColor: session.is_current ? 'primary.main' : 'divider',
        bgcolor: session.is_current ? 'primary.50' : 'background.paper',
        transition: 'border-color 0.2s',
      }}
    >
      <CardContent sx={{ p: { xs: 1.75, sm: 2 }, '&:last-child': { pb: { xs: 1.75, sm: 2 } } }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          {/* Device icon */}
          <Box
            sx={{
              p: 1,
              borderRadius: 1.5,
              bgcolor: session.is_current ? 'primary.100' : 'action.hover',
              color: session.is_current ? 'primary.main' : 'text.secondary',
              flexShrink: 0,
              mt: 0.25,
            }}
          >
            {icon}
          </Box>

          {/* Session details */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ sm: 'center' }}
              justifyContent="space-between"
              spacing={0.5}
            >
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Typography variant="subtitle2" fontWeight={600} noWrap>
                  {session.device_name}
                </Typography>
                {session.is_current && (
                  <Chip
                    label="This device"
                    size="small"
                    color="primary"
                    sx={{ height: 18, fontSize: 10, fontWeight: 700 }}
                  />
                )}
              </Stack>

              {/* Revoke button */}
              {!session.is_current && (
                <Tooltip title="Revoke this session">
                  <span>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onRevoke(session.id)}
                      disabled={revoking === session.id}
                      sx={{ flexShrink: 0 }}
                    >
                      {revoking === session.id ? (
                        <CircularProgress size={16} color="error" />
                      ) : (
                        <CloseIcon fontSize="small" />
                      )}
                    </IconButton>
                  </span>
                </Tooltip>
              )}
            </Stack>

            <Stack spacing={0.1} sx={{ mt: 0.25 }}>
              {session.ip_address && (
                <Typography variant="caption" color="text.secondary">
                  IP: <strong>{session.ip_address}</strong>
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                Last active:{' '}
                <strong>
                  {timeAgo(session.last_activity)} · {fmtDate(session.last_activity)}
                </strong>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Signed in: {fmtDate(session.created_at)}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ── password section ──────────────────────────────────────────────────────────

function PasswordSection() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const toggleShow = (field) => setShow(s => ({ ...s, [field]: !s[field] }));

  const fieldProps = (key) => ({
    value: form[key],
    onChange: (e) => {
      setForm(f => ({ ...f, [key]: e.target.value }));
      if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
    },
  });

  const validate = () => {
    const e = {};
    if (!form.current_password) e.current_password = 'Required.';
    if (form.new_password.length < 8) e.new_password = 'Must be at least 8 characters.';
    if (form.new_password !== form.confirm) e.confirm = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const axiosClient = createAxiosClient();
      await axiosClient.post('/api/users/set_password/', {
        current_password: form.current_password,
        new_password: form.new_password,
      });
      setDone(true);
      setOpen(false);
      setForm({ current_password: '', new_password: '', confirm: '' });
      toast.success('Password changed successfully!');
    } catch (err) {
      const data = err.response?.data;
      if (data?.current_password) {
        setErrors({ current_password: Array.isArray(data.current_password) ? data.current_password[0] : data.current_password });
      } else if (data?.new_password) {
        setErrors({ new_password: Array.isArray(data.new_password) ? data.new_password[0] : data.new_password });
      } else {
        toast.error(data?.detail || 'Failed to change password. Try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    setSendingReset(true);
    try {
      const axiosClient = createAxiosClient();
      const { data: accountData } = await axiosClient.get('/api/v1/vendor/account/');
      const email = accountData.email || accountData.user_email;
      if (!email) throw new Error('No email on record.');
      await axiosClient.post('/api/users/reset_password/', { email });
      toast.success('Password reset email sent! Check your inbox.');
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || 'Could not send reset email.');
    } finally {
      setSendingReset(false);
    }
  };

  const handleOpen = () => {
    if (open) {
      setOpen(false);
      setForm({ current_password: '', new_password: '', confirm: '' });
      setErrors({});
    } else {
      setOpen(true);
    }
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ p: 1.25, bgcolor: 'primary.50', borderRadius: 2, flexShrink: 0 }}>
              <LockResetIcon color="primary" />
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>Password</Typography>
              <Typography variant="body2" color="text.secondary">
                {done ? 'Your password was updated successfully.' : 'Change your account login password.'}
              </Typography>
            </Box>
          </Stack>

          {done ? (
            <Chip icon={<CheckCircleIcon />} label="Password updated" color="success" variant="outlined" sx={{ flexShrink: 0 }} />
          ) : (
            <Button variant="outlined" startIcon={<LockResetIcon />} onClick={handleOpen} sx={{ flexShrink: 0 }}>
              {open ? 'Cancel' : 'Change Password'}
            </Button>
          )}
        </Stack>

        <Collapse in={open} unmountOnExit>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2.5 }}>
            <Stack spacing={2}>
              {['current_password', 'new_password', 'confirm'].map((key) => (
                <TextField
                  key={key}
                  label={key === 'current_password' ? 'Current Password' : key === 'new_password' ? 'New Password' : 'Confirm New Password'}
                  type={show[key.split('_')[0]] ? 'text' : 'password'}
                  {...fieldProps(key)}
                  error={Boolean(errors[key])}
                  helperText={errors[key] || (key === 'new_password' ? 'Minimum 8 characters.' : undefined)}
                  size="small"
                  fullWidth
                  autoComplete={key === 'current_password' ? 'current-password' : 'new-password'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => toggleShow(key.split('_')[0])} edge="end" size="small">
                          {show[key.split('_')[0]] ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              ))}
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                <Button variant="text" size="small" onClick={handleForgotPassword} disabled={sendingReset} sx={{ color: 'text.secondary', pl: 0 }}>
                  {sendingReset ? 'Sending…' : 'Forgot password?'}
                </Button>
                <Button type="submit" variant="contained" disabled={submitting} sx={{ minWidth: 140 }}>
                  {submitting ? 'Saving…' : 'Update Password'}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function SecuritySettings() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [revoking, setRevoking] = useState(null);  // session id being revoked
  const [bulkLoading, setBulkLoading] = useState(null);  // 'others' | 'all'
  const [confirmAll, setConfirmAll] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      const axiosClient = createAxiosClient();
      const { data } = await axiosClient.get('/api/vendor/sessions/');
      setSessions(Array.isArray(data) ? data : []);
    } catch {
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const handleRevoke = async (sessionId) => {
    setRevoking(sessionId);
    try {
      const axiosClient = createAxiosClient();
      await axiosClient.delete(`/api/vendor/sessions/${sessionId}/`);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      toast.success('Device removed successfully.');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not revoke session.');
    } finally {
      setRevoking(null);
    }
  };

  const handleLogoutOthers = async () => {
    setBulkLoading('others');
    try {
      const axiosClient = createAxiosClient();
      const { data } = await axiosClient.post('/api/vendor/logout-other-sessions/');
      toast.success(data?.detail || 'Other devices logged out.');
      fetchSessions();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not log out other devices.');
    } finally {
      setBulkLoading(null);
    }
  };

  const handleLogoutAll = async () => {
    setConfirmAll(false);
    setBulkLoading('all');
    try {
      const axiosClient = createAxiosClient();
      await axiosClient.post('/api/vendor/logout-all/');
      dispatch(logout());
      toast.success('Logged out from all devices.');
      router.push('/auth/login');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not log out all devices.');
      setBulkLoading(null);
    }
  };

  const otherCount = sessions.filter(s => !s.is_current).length;

  return (
    <Box>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
        <SecurityIcon color="primary" />
        <Typography variant="h6" fontWeight={700}>Security</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage your password and control which devices have access to your account.
      </Typography>

      <Stack spacing={2.5}>
        {/* Password section */}
        <PasswordSection />

        {/* Active Sessions */}
        <Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }} flexWrap="wrap" gap={1}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>Active Sessions</Typography>
              <Typography variant="body2" color="text.secondary">
                {sessionsLoading
                  ? 'Loading devices…'
                  : sessions.length === 0
                  ? 'No active sessions found.'
                  : `${sessions.length} device${sessions.length !== 1 ? 's' : ''} currently signed in`}
              </Typography>
            </Box>

            {!sessionsLoading && sessions.length > 0 && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<LogoutIcon fontSize="small" />}
                onClick={fetchSessions}
                sx={{ flexShrink: 0 }}
              >
                Refresh
              </Button>
            )}
          </Stack>

          <Stack spacing={1}>
            {sessionsLoading ? (
              [1, 2].map((i) => (
                <Card key={i} variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Skeleton variant="rounded" width={36} height={36} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton width="60%" height={20} />
                        <Skeleton width="40%" height={16} sx={{ mt: 0.5 }} />
                        <Skeleton width="50%" height={16} sx={{ mt: 0.25 }} />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))
            ) : sessions.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                No session data available. Session tracking begins on your next login.
              </Alert>
            ) : (
              sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onRevoke={handleRevoke}
                  revoking={revoking}
                />
              ))
            )}
          </Stack>
        </Box>

        {/* Bulk logout actions */}
        {!sessionsLoading && sessions.length > 0 && (
          <>
            <Divider />
            <Stack spacing={1.5}>
              <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                Bulk actions
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                {otherCount > 0 && (
                  <Button
                    variant="outlined"
                    color="warning"
                    startIcon={bulkLoading === 'others' ? <CircularProgress size={16} color="warning" /> : <LogoutIcon />}
                    onClick={handleLogoutOthers}
                    disabled={bulkLoading !== null}
                    sx={{ flex: 1 }}
                  >
                    {bulkLoading === 'others'
                      ? 'Logging out…'
                      : `Log out from ${otherCount} other device${otherCount !== 1 ? 's' : ''}`}
                  </Button>
                )}

                <Button
                  variant="outlined"
                  color="error"
                  startIcon={bulkLoading === 'all' ? <CircularProgress size={16} color="error" /> : <WarningAmberIcon />}
                  onClick={() => setConfirmAll(true)}
                  disabled={bulkLoading !== null}
                  sx={{ flex: 1 }}
                >
                  {bulkLoading === 'all' ? 'Logging out…' : 'Log out from all devices'}
                </Button>
              </Stack>

              <Typography variant="caption" color="text.secondary">
                "Log out from all devices" will immediately invalidate every active session,
                including this one, and redirect you to the login page.
              </Typography>
            </Stack>
          </>
        )}
      </Stack>

      {/* Confirm dialog for logout-all */}
      <Dialog
        open={confirmAll}
        onClose={() => setConfirmAll(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Log out from all devices?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will immediately end every active session — including this one — across all
            browsers and devices. You&apos;ll be redirected to the login page.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setConfirmAll(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleLogoutAll} variant="contained" color="error" startIcon={<WarningAmberIcon />}>
            Log out everywhere
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
