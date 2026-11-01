'use client';

/**
 * Seller verification (backend: verification/). Usable before the store is
 * approved, so it signs in with the owner's account cookie (like the register
 * flow), not the seller dashboard cookie.
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Alert, Box, Button, Card, Chip, CircularProgress, MenuItem, Stack, TextField, Typography,
} from '@mui/material';

const HOST = process.env.NEXT_PUBLIC_HOST;
const STATE = {
  accepted: { label: 'Accepted', color: 'success' },
  rejected: { label: 'Needs a new upload', color: 'error' },
  pending: { label: 'Waiting for review', color: 'warning' },
  missing: { label: 'Not uploaded', color: 'default' },
};

async function api(method, body) {
  const res = await fetch(`${HOST}/api/v1/verification/seller/`, {
    method, credentials: 'include', headers: { 'X-User-Type': 'customer' }, body,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || 'Something went wrong. Please try again.');
  return data;
}

export default function VerificationPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [files, setFiles] = useState({});
  const [idType, setIdType] = useState('ghana_card');
  const [idNumber, setIdNumber] = useState('');
  const [reg, setReg] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(() => {
    api('GET').then((d) => {
      setData(d);
      if (d.id_type) setIdType(d.id_type);
      setReg(d.business_reg_number || '');
    }).catch((e) => setError(e.message));
  }, []);
  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    const fd = new FormData();
    fd.append('id_type', idType);
    if (idNumber.trim()) fd.append('id_number', idNumber.trim());
    if (data.needs_business_reg) fd.append('business_reg_number', reg);
    Object.entries(files).forEach(([field, file]) => fd.append(field, file));
    try {
      const d = await api('PUT', fd);
      setData(d);
      setFiles({});
      setIdNumber('');
      setSaved(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 680, mx: 'auto', px: 2, py: 5 }}>
      <Typography component="h1" sx={{ fontSize: 26, fontWeight: 700, mb: 1 }}>Store verification</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        We check every seller&apos;s identity before their store opens. Your documents are stored privately and only
        Negromart&apos;s review team can see them.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {saved && <Alert severity="success" sx={{ mb: 2 }}>Thanks. We&apos;ll review your documents and let you know by email.</Alert>}
      {!data && !error && <CircularProgress size={28} />}

      {data && (
        <>
          {data.status === 'VERIFIED' && data.is_approved && (
            <Alert severity="success" sx={{ mb: 2 }}>Your store is verified. <Link href="/dashboard">Go to your dashboard</Link></Alert>
          )}
          {data.status === 'REJECTED' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Some details need fixing. Upload the documents marked below and we&apos;ll look again.
              {data.review_note && <Box sx={{ mt: 0.5 }}>{data.review_note}</Box>}
            </Alert>
          )}

          <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Identity</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField select size="small" label="ID type" value={idType} onChange={(e) => setIdType(e.target.value)} sx={{ minWidth: 180 }}>
                <MenuItem value="ghana_card">Ghana Card</MenuItem>
                <MenuItem value="passport">Passport</MenuItem>
                <MenuItem value="voter_id">Voter&apos;s ID</MenuItem>
                <MenuItem value="drivers_licence">Driver&apos;s licence</MenuItem>
              </TextField>
              <TextField size="small" fullWidth label={data.id_number_masked ? `ID number (saved: ${data.id_number_masked})` : 'ID number'}
                         placeholder={idType === 'ghana_card' ? 'GHA-123456789-0' : ''} value={idNumber}
                         onChange={(e) => setIdNumber(e.target.value)} />
            </Stack>
            {data.needs_business_reg && (
              <TextField size="small" fullWidth sx={{ mt: 2 }} label="Business registration number" placeholder="e.g. CS123456789"
                         value={reg} onChange={(e) => setReg(e.target.value)} />
            )}
          </Card>

          <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Documents</Typography>
            <Stack spacing={2}>
              {data.documents.map((d) => (
                <Box key={d.field} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{d.label}</Typography>
                    {d.state === 'rejected' && d.reason && (
                      <Typography sx={{ fontSize: 13, color: 'error.main' }}>{d.reason}</Typography>
                    )}
                  </Box>
                  <Chip size="small" label={STATE[d.state]?.label} color={STATE[d.state]?.color} />
                  {d.state !== 'accepted' && (
                    <Button component="label" size="small" variant="outlined" sx={{ textTransform: 'none' }}>
                      {files[d.field] ? files[d.field].name : d.state === 'missing' ? 'Upload' : 'Replace'}
                      <input hidden type="file" accept="application/pdf,image/jpeg,image/png,image/webp"
                             onChange={(e) => e.target.files?.[0] && setFiles((f) => ({ ...f, [d.field]: e.target.files[0] }))} />
                    </Button>
                  )}
                </Box>
              ))}
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              PDF, JPG, PNG or WebP, up to 10 MB each. Make sure all four corners and the text are visible.
            </Typography>
          </Card>

          <Button variant="contained" disableElevation onClick={submit}
                  disabled={saving || (!Object.keys(files).length && !idNumber.trim() && reg === (data.business_reg_number || ''))}>
            {saving ? 'Submitting…' : 'Submit for review'}
          </Button>
        </>
      )}
    </Box>
  );
}
