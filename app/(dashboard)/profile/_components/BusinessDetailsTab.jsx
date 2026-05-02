'use client';

import { useEffect, useState } from 'react';
import { createAxiosClient } from '@/utils/clientFetch';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';
import toast from 'react-hot-toast';

const BUSINESS_TYPES = [
  { value: 'sole_proprietor', label: 'Sole Proprietor' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'corporation', label: 'Corporation' },
  { value: 'llc', label: 'Limited Liability Company (LLC)' },
  { value: 'non_profit', label: 'Non-Profit' },
  { value: 'other', label: 'Other' },
];

const COUNTRIES = [
  { code: 'GH', name: 'Ghana' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'KE', name: 'Kenya' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'UG', name: 'Uganda' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'CI', name: "Côte d'Ivoire" },
  { code: 'SN', name: 'Senegal' },
  { code: 'BJ', name: 'Benin' },
  { code: 'TG', name: 'Togo' },
  { code: 'GN', name: 'Guinea' },
  { code: 'LR', name: 'Liberia' },
  { code: 'SL', name: 'Sierra Leone' },
  { code: 'MR', name: 'Mauritania' },
  { code: 'ML', name: 'Mali' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'ZW', name: 'Zimbabwe' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
];

export default function BusinessDetailsTab({ account, onRefresh }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    contact: '',
    country: 'GH',
    business_type: 'sole_proprietor',
    is_manufacturer: false,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (account) {
      setForm({
        name: account.name || '',
        email: account.email || '',
        contact: account.contact || '',
        country: account.country || 'GH',
        business_type: account.business_type || 'sole_proprietor',
        is_manufacturer: account.is_manufacturer ?? false,
      });
    }
  }, [account]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const axiosClient = createAxiosClient();
      await axiosClient.put('/api/v1/vendor/account/', form);
      toast.success('Business details updated!');
      onRefresh();
    } catch (err) {
      const data = err.response?.data || {};
      setErrors(data);
      const first = Object.values(data)[0];
      toast.error(Array.isArray(first) ? first[0] : (first || 'Failed to save.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <Card sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.5 }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>Business Information</Typography>
              <Typography variant="body2" color="text.secondary">
                Update your business registration and contact details.
              </Typography>
            </Box>
            {account?.vendor_type && (
              <Chip
                label={account.vendor_type === 'student' ? 'Student Vendor' : 'Business Vendor'}
                color={account.vendor_type === 'student' ? 'info' : 'success'}
                size="small"
                variant="outlined"
                sx={{ mt: 0.5 }}
              />
            )}
          </Stack>
          <Divider sx={{ my: 2.5 }} />

          <Stack spacing={2.5}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Store / Business Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                required
                inputProps={{ minLength: 2 }}
              />
              <TextField
                fullWidth
                label="Business Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email || 'Public-facing business email'}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Contact Number"
                name="contact"
                value={form.contact}
                onChange={handleChange}
                error={!!errors.contact}
                helperText={errors.contact || 'Include country code, e.g. +233244000000'}
                required
              />
              <FormControl fullWidth error={!!errors.country}>
                <InputLabel>Country</InputLabel>
                <Select name="country" value={form.country} onChange={handleChange} label="Country">
                  {COUNTRIES.map(c => (
                    <MenuItem key={c.code} value={c.code}>{c.name}</MenuItem>
                  ))}
                </Select>
                {errors.country && <FormHelperText>{errors.country}</FormHelperText>}
              </FormControl>
            </Stack>

            <FormControl fullWidth error={!!errors.business_type}>
              <InputLabel>Business Structure</InputLabel>
              <Select name="business_type" value={form.business_type} onChange={handleChange} label="Business Structure">
                {BUSINESS_TYPES.map(bt => (
                  <MenuItem key={bt.value} value={bt.value}>{bt.label}</MenuItem>
                ))}
              </Select>
              {errors.business_type && <FormHelperText>{errors.business_type}</FormHelperText>}
              <FormHelperText sx={{ ml: 0 }}>Your business's legal structure</FormHelperText>
            </FormControl>

            <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
              <FormControlLabel
                control={
                  <Switch
                    name="is_manufacturer"
                    checked={form.is_manufacturer}
                    onChange={handleChange}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ ml: 0.5 }}>
                    <Typography variant="body2" fontWeight={600}>We manufacture our products</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Enabling this badge improves trust with buyers
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </Stack>
        </Card>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving} sx={{ px: 4 }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
