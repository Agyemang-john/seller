'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Box, Typography, Stack, TextField, Grid, Button,
  Chip, CircularProgress, Collapse, Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { createAxiosClient } from '@/utils/clientFetch';

const FIELD_SX = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    '& fieldset': { borderColor: 'divider' },
  },
};

const COUNTRIES = [
  { code: 'GH', label: 'Ghana' },
  { code: 'NG', label: 'Nigeria' },
  { code: 'KE', label: 'Kenya' },
  { code: 'ZA', label: 'South Africa' },
  { code: 'CI', label: "Côte d'Ivoire" },
  { code: 'SN', label: 'Senegal' },
  { code: 'CM', label: 'Cameroon' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'US', label: 'United States' },
];

/**
 * BillingDetailsForm
 *
 * Props:
 *   profile        — current BillingProfile data from the API (can be null)
 *   onProfileSaved — (profile) => void  called after successful save
 *   compact        — boolean  if true, collapses into a summary with "Edit" button
 *   required       — boolean  if true, shows "Required before payment" banner
 */
export default function BillingDetailsForm({ profile: initialProfile, onProfileSaved, compact = false, required = false }) {
  const [editing,  setEditing]  = useState(!compact || !initialProfile?.is_complete);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState(null);
  const [success,  setSuccess]  = useState(false);

  const [form, setForm] = useState({
    first_name:    initialProfile?.first_name    || '',
    last_name:     initialProfile?.last_name     || '',
    email:         initialProfile?.email         || '',
    phone:         initialProfile?.phone         || '',
    business_name: initialProfile?.business_name || '',
    address_line1: initialProfile?.address_line1 || '',
    address_line2: initialProfile?.address_line2 || '',
    city:          initialProfile?.city          || '',
    region:        initialProfile?.region        || '',
    postal_code:   initialProfile?.postal_code   || '',
    country:       initialProfile?.country       || 'GH',
  });

  // Sync when profile prop changes (e.g. first load from parent)
  useEffect(() => {
    if (initialProfile) {
      setForm({
        first_name:    initialProfile.first_name    || '',
        last_name:     initialProfile.last_name     || '',
        email:         initialProfile.email         || '',
        phone:         initialProfile.phone         || '',
        business_name: initialProfile.business_name || '',
        address_line1: initialProfile.address_line1 || '',
        address_line2: initialProfile.address_line2 || '',
        city:          initialProfile.city          || '',
        region:        initialProfile.region        || '',
        postal_code:   initialProfile.postal_code   || '',
        country:       initialProfile.country       || 'GH',
      });
      // If profile is complete and we're in compact mode, collapse automatically
      if (compact && initialProfile.is_complete) setEditing(false);
    }
  }, [initialProfile]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = useCallback(async () => {
    if (!form.first_name || !form.last_name || !form.email) {
      setError('First name, last name, and email are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const client = createAxiosClient();
      const res    = await client.patch('/api/v1/payments/billing/profile/', form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      if (compact) setEditing(false);
      onProfileSaved?.(res.data);
    } catch (err) {
      const msg = err?.response?.data?.detail
        || Object.values(err?.response?.data || {}).flat().join(' ')
        || 'Could not save billing details.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }, [form, compact, onProfileSaved]);

  const isComplete = !!(form.first_name && form.last_name && form.email);

  // ── Compact summary mode ────────────────────────────────────────────────
  if (compact && !editing) {
    return (
      <Box sx={{ p: '14px 18px', borderRadius: '12px', border: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 34, height: 34, borderRadius: '9px', bgcolor: isComplete ? 'success.lighter' : 'action.selected', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {isComplete
                ? <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                : <PersonOutlineIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              }
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={600} color="text.primary">
                {isComplete ? `${form.first_name} ${form.last_name}` : 'Billing details'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {isComplete ? form.email : 'Not completed yet'}
                {isComplete && form.business_name ? ` · ${form.business_name}` : ''}
              </Typography>
            </Box>
          </Stack>
          <Button size="small" startIcon={<EditOutlinedIcon sx={{ fontSize: 14 }} />} onClick={() => setEditing(true)}
            sx={{ borderRadius: '8px', borderColor: 'divider', color: 'text.secondary', fontWeight: 600, fontSize: 11, '&:hover': { color: 'text.primary' } }}>
            Edit
          </Button>
        </Stack>
      </Box>
    );
  }

  // ── Full form ──────────────────────────────────────────────────────────
  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.disabled', fontSize: 10, display: 'block', mb: 0.3 }}>
            Billing details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Used for invoices and subscription receipts
          </Typography>
        </Box>
        {isComplete && (
          <Chip icon={<CheckCircleIcon sx={{ fontSize: 13 }} />} label="Complete" size="small"
            sx={{ height: 22, fontSize: 11, fontWeight: 600, bgcolor: 'success.lighter', color: 'success.dark', borderRadius: '6px' }} />
        )}
      </Stack>

      {/* Required banner */}
      {required && !isComplete && (
        <Box sx={{ px: 2, py: 1.5, mb: 2.5, borderRadius: '10px', bgcolor: 'warning.lighter', border: '1px solid', borderColor: 'warning.light' }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'warning.dark' }}>
            ⚠ Please complete your billing details before subscribing.
          </Typography>
        </Box>
      )}

      {error   && <Alert severity="error"   sx={{ mb: 2, borderRadius: '10px' }} onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '10px' }}>Billing details saved.</Alert>}

      <Grid container spacing={1.75}>
        {/* Name */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField label="First name" size="small" fullWidth required sx={FIELD_SX}
            value={form.first_name} onChange={set('first_name')} placeholder="Kwame" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField label="Last name" size="small" fullWidth required sx={FIELD_SX}
            value={form.last_name} onChange={set('last_name')} placeholder="Asante" />
        </Grid>

        {/* Contact */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField label="Billing email" type="email" size="small" fullWidth required sx={FIELD_SX}
            value={form.email} onChange={set('email')} placeholder="kwame@yourstore.com"
            helperText="Invoices are sent here" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField label="Phone number" type="tel" size="small" fullWidth sx={FIELD_SX}
            value={form.phone} onChange={set('phone')} placeholder="+233 XX XXX XXXX" />
        </Grid>

        {/* Business */}
        <Grid size={{ xs: 12 }}>
          <TextField label="Business / company name" size="small" fullWidth sx={FIELD_SX}
            value={form.business_name} onChange={set('business_name')} placeholder="Asante Trades Ltd (optional)" />
        </Grid>

        {/* Address */}
        <Grid size={{ xs: 12 }}>
          <TextField label="Address line 1" size="small" fullWidth sx={FIELD_SX}
            value={form.address_line1} onChange={set('address_line1')} placeholder="Street address" />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField label="Address line 2" size="small" fullWidth sx={FIELD_SX}
            value={form.address_line2} onChange={set('address_line2')} placeholder="Apartment, suite, etc. (optional)" />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField label="City" size="small" fullWidth sx={FIELD_SX}
            value={form.city} onChange={set('city')} placeholder="Accra" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField label="Region / state" size="small" fullWidth sx={FIELD_SX}
            value={form.region} onChange={set('region')} placeholder="Greater Accra" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField label="Country" size="small" fullWidth sx={FIELD_SX}
            value={form.country} onChange={set('country')} placeholder="GH"
            select SelectProps={{ native: true }} InputLabelProps={{ shrink: true }}>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {/* Save */}
      <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }}>
        <Button variant="contained" disableElevation onClick={handleSave} disabled={saving}
          startIcon={saving ? <CircularProgress size={14} thickness={5} color="inherit" /> : <SaveOutlinedIcon />}
          sx={{ bgcolor: 'text.primary', color: 'background.paper', borderRadius: '10px', fontWeight: 600, '&:hover': { bgcolor: 'text.secondary' } }}>
          {saving ? 'Saving…' : 'Save details'}
        </Button>
        {compact && initialProfile?.is_complete && (
          <Button variant="outlined" onClick={() => setEditing(false)}
            sx={{ borderRadius: '10px', borderColor: 'divider', color: 'text.secondary', fontWeight: 600, '&:hover': { borderColor: 'text.primary', color: 'text.primary' } }}>
            Cancel
          </Button>
        )}
      </Stack>
    </Box>
  );
}