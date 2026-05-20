'use client';

import { useState, useEffect } from 'react';
import { createAxiosClient } from '@/utils/clientFetch';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import StorefrontIcon from '@mui/icons-material/Storefront';
import StoreOutlinedIcon from '@mui/icons-material/StoreOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import toast from 'react-hot-toast';
import ShopStatusToggle from '@/components/dashboard/ShopStatusToggle';

export default function AccountSettings() {
  const [userInfo, setUserInfo] = useState(null);
  const [vendorInfo, setVendorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shopPaused, setShopPaused] = useState(null);

  const [emailOpen, setEmailOpen] = useState(false);
  const [emailForm, setEmailForm] = useState({ current_password: '', new_email: '' });
  const [emailErrors, setEmailErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailDone, setEmailDone] = useState(false);

  useEffect(() => {
    const axiosClient = createAxiosClient();
    Promise.all([
      axiosClient.get('/api/users/me/'),
      axiosClient.get('/api/v1/vendor/account/'),
      axiosClient.get('/api/v1/vendor/my-status/'),
    ])
      .then(([userRes, vendorRes, statusRes]) => {
        setUserInfo(userRes.data);
        setVendorInfo(vendorRes.data);
        setShopPaused(statusRes.data.shop_paused ?? false);
      })
      .catch(() => toast.error('Could not load account info.'))
      .finally(() => setLoading(false));
  }, []);

  const storeUrl = vendorInfo?.slug ? `negromart.com/seller/${vendorInfo.slug}` : null;
  const fullStoreUrl = vendorInfo?.slug ? `https://negromart.com/seller/${vendorInfo.slug}` : null;

  const copySlug = () => {
    if (!fullStoreUrl) return;
    navigator.clipboard
      .writeText(fullStoreUrl)
      .then(() => toast.success('Store URL copied!'))
      .catch(() => toast.error('Copy failed.'));
  };

  const emailFieldProps = (key) => ({
    value: emailForm[key],
    onChange: (e) => {
      setEmailForm(f => ({ ...f, [key]: e.target.value }));
      if (emailErrors[key]) setEmailErrors(prev => ({ ...prev, [key]: '' }));
    },
  });

  const validateEmail = () => {
    const e = {};
    if (!emailForm.current_password) e.current_password = 'Required.';
    if (!emailForm.new_email || !/\S+@\S+\.\S+/.test(emailForm.new_email))
      e.new_email = 'Enter a valid email address.';
    setEmailErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleEmailChange = async (ev) => {
    ev.preventDefault();
    if (!validateEmail()) return;
    setEmailSubmitting(true);
    try {
      const axiosClient = createAxiosClient();
      await axiosClient.post('/api/users/set_email/', {
        current_password: emailForm.current_password,
        new_email: emailForm.new_email,
      });
      const updated = emailForm.new_email;
      setEmailDone(true);
      setEmailOpen(false);
      setEmailForm({ current_password: '', new_email: '' });
      setUserInfo(prev => ({ ...prev, email: updated }));
      toast.success('Email address updated!');
    } catch (err) {
      const data = err.response?.data;
      if (data?.current_password) {
        setEmailErrors({ current_password: Array.isArray(data.current_password) ? data.current_password[0] : data.current_password });
      } else if (data?.new_email) {
        setEmailErrors({ new_email: Array.isArray(data.new_email) ? data.new_email[0] : data.new_email });
      } else {
        toast.error(data?.detail || 'Failed to update email. Try again.');
      }
    } finally {
      setEmailSubmitting(false);
    }
  };

  const handleEmailOpen = () => {
    if (emailOpen) {
      setEmailOpen(false);
      setEmailForm({ current_password: '', new_email: '' });
      setEmailErrors({});
    } else {
      setEmailOpen(true);
    }
  };

  return (
    <Box>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
        <AccountCircleIcon color="primary" />
        <Typography variant="h6" fontWeight={700}>Account</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        View and manage your login credentials and public store details.
      </Typography>

      <Stack spacing={2}>
        {/* Login email */}
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ sm: 'center' }}
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>Login Email</Typography>
                {loading ? (
                  <Skeleton width={200} height={20} sx={{ mt: 0.5 }} />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {userInfo?.email || '—'}
                  </Typography>
                )}
              </Box>

              {!loading && (
                emailDone ? (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Email updated"
                    color="success"
                    variant="outlined"
                    sx={{ flexShrink: 0 }}
                  />
                ) : (
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={handleEmailOpen}
                    sx={{ flexShrink: 0 }}
                  >
                    {emailOpen ? 'Cancel' : 'Change Email'}
                  </Button>
                )
              )}
            </Stack>

            <Collapse in={emailOpen} unmountOnExit>
              <Box component="form" onSubmit={handleEmailChange} sx={{ mt: 2.5 }}>
                <Stack spacing={2}>
                  <TextField
                    label="Confirm Current Password"
                    type={showPwd ? 'text' : 'password'}
                    {...emailFieldProps('current_password')}
                    error={Boolean(emailErrors.current_password)}
                    helperText={emailErrors.current_password || "We need to verify it's you."}
                    size="small"
                    fullWidth
                    autoComplete="current-password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPwd(s => !s)} edge="end" size="small">
                            {showPwd ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="New Email Address"
                    type="email"
                    {...emailFieldProps('new_email')}
                    error={Boolean(emailErrors.new_email)}
                    helperText={emailErrors.new_email}
                    size="small"
                    fullWidth
                    autoComplete="email"
                  />
                  <Stack direction="row" justifyContent="flex-end">
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={emailSubmitting}
                      sx={{ minWidth: 140 }}
                    >
                      {emailSubmitting ? 'Saving…' : 'Update Email'}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Collapse>
          </CardContent>
        </Card>

        {/* Public store URL */}
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ sm: 'center' }}
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>Public Store URL</Typography>
                {loading ? (
                  <Skeleton width={260} height={20} sx={{ mt: 0.5 }} />
                ) : (
                  <Typography
                    variant="body2"
                    color={storeUrl ? 'text.secondary' : 'text.disabled'}
                    sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                  >
                    {storeUrl || 'Not yet available'}
                  </Typography>
                )}
              </Box>
              {!loading && storeUrl && (
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title="Copy URL">
                    <IconButton onClick={copySlug} size="small">
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Open store">
                    <IconButton
                      component="a"
                      href={fullStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                    >
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Shop visibility */}
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-start' }} justifyContent="space-between">
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  {shopPaused
                    ? <StoreOutlinedIcon sx={{ fontSize: 18, color: 'warning.main' }} />
                    : <StorefrontIcon sx={{ fontSize: 18, color: 'success.main' }} />
                  }
                  <Typography variant="subtitle2" fontWeight={600}>Shop Visibility</Typography>
                  {loading ? (
                    <Skeleton width={56} height={22} sx={{ borderRadius: 4 }} />
                  ) : (
                    <Chip
                      label={shopPaused ? 'Paused' : 'Live'}
                      color={shopPaused ? 'warning' : 'success'}
                      size="small"
                      sx={{ fontWeight: 700, fontSize: 11, height: 20 }}
                    />
                  )}
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {shopPaused
                    ? 'Your shop is paused. Products are hidden from search, listings, and cart.'
                    : 'Your shop is live. Customers can browse, add to cart, and place orders.'}
                </Typography>
                {shopPaused && (
                  <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: 'block' }}>
                    Toggle back on to make your products visible again.
                  </Typography>
                )}
              </Box>

              {!loading && shopPaused !== null && (
                <Box sx={{ flexShrink: 0 }}>
                  <ShopStatusToggle
                    compact
                    initialPaused={shopPaused}
                    onToggle={(newPaused) => setShopPaused(newPaused)}
                  />
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Account meta */}
        <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: 'action.hover' }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ sm: 'center' }}
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                  Account ID
                </Typography>
                {loading ? (
                  <Skeleton width={100} height={20} sx={{ mt: 0.5 }} />
                ) : (
                  <Typography variant="caption" color="text.disabled" sx={{ fontFamily: 'monospace' }}>
                    #{vendorInfo?.id ?? userInfo?.id ?? '—'}
                  </Typography>
                )}
              </Box>
              {!loading && (
                <Chip
                  label={userInfo?.username ? `@${userInfo.username}` : 'Seller Account'}
                  size="small"
                  variant="outlined"
                />
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
