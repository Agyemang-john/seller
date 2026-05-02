'use client';

import { useState } from 'react';
import { createAxiosClient } from '@/utils/clientFetch';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockResetIcon from '@mui/icons-material/LockReset';
import SecurityIcon from '@mui/icons-material/Security';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import toast from 'react-hot-toast';

export default function SecuritySettings() {
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
      const msg = err.response?.data?.detail || err.message || 'Could not send reset email.';
      toast.error(msg);
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
    <Box>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
        <SecurityIcon color="primary" />
        <Typography variant="h6" fontWeight={700}>Security</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage your account password and security options.
      </Typography>

      <Stack spacing={2}>
        {/* Password change */}
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
                    {done
                      ? 'Your password was updated successfully.'
                      : 'Change your account login password.'}
                  </Typography>
                </Box>
              </Stack>

              {done ? (
                <Chip
                  icon={<CheckCircleIcon />}
                  label="Password updated"
                  color="success"
                  variant="outlined"
                  sx={{ flexShrink: 0 }}
                />
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<LockResetIcon />}
                  onClick={handleOpen}
                  sx={{ flexShrink: 0 }}
                >
                  {open ? 'Cancel' : 'Change Password'}
                </Button>
              )}
            </Stack>

            <Collapse in={open} unmountOnExit>
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2.5 }}>
                <Stack spacing={2}>
                  <TextField
                    label="Current Password"
                    type={show.current ? 'text' : 'password'}
                    {...fieldProps('current_password')}
                    error={Boolean(errors.current_password)}
                    helperText={errors.current_password}
                    size="small"
                    fullWidth
                    autoComplete="current-password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => toggleShow('current')} edge="end" size="small">
                            {show.current ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="New Password"
                    type={show.new ? 'text' : 'password'}
                    {...fieldProps('new_password')}
                    error={Boolean(errors.new_password)}
                    helperText={errors.new_password || 'Minimum 8 characters.'}
                    size="small"
                    fullWidth
                    autoComplete="new-password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => toggleShow('new')} edge="end" size="small">
                            {show.new ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Confirm New Password"
                    type={show.confirm ? 'text' : 'password'}
                    {...fieldProps('confirm')}
                    error={Boolean(errors.confirm)}
                    helperText={errors.confirm}
                    size="small"
                    fullWidth
                    autoComplete="new-password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => toggleShow('confirm')} edge="end" size="small">
                            {show.confirm ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                    <Button
                      variant="text"
                      size="small"
                      onClick={handleForgotPassword}
                      disabled={sendingReset}
                      sx={{ color: 'text.secondary', pl: 0 }}
                    >
                      {sendingReset ? 'Sending reset email…' : 'Forgot password?'}
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

        {/* Active sessions info */}
        <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: 'action.hover' }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ p: 1.25, bgcolor: 'action.selected', borderRadius: 2, flexShrink: 0 }}>
                <SecurityIcon color="action" />
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>Active Sessions</Typography>
                <Typography variant="body2" color="text.secondary">
                  You are currently logged in. Logging out will clear your session token.
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
