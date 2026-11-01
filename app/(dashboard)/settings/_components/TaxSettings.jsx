'use client';

/**
 * VAT registration (backend: tax/). Prices on Negromart include tax; when a
 * store is VAT registered its invoices and the shopper's receipt show the VAT
 * inside each price, with the store's TIN.
 */

import { useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, FormControlLabel, Stack, Switch, TextField, Typography } from '@mui/material';
import toast from 'react-hot-toast';
import { createAxiosClient } from '@/utils/clientFetch';
import { apiError } from '@/libs/seller-ops';
import useVendorAccess, { CAP } from '@/hooks/useVendorAccess';

export default function TaxSettings() {
  const { can } = useVendorAccess();
  const canEdit = can(CAP.MANAGE_FINANCE);
  const [data, setData] = useState(null);
  const [form, setForm] = useState({ vat_registered: false, tax_id: '', registered_name: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    createAxiosClient().get('/api/v1/tax/seller/registration/')
      .then(({ data: d }) => {
        setData(d);
        setForm({ vat_registered: d.vat_registered, tax_id: d.tax_id, registered_name: d.registered_name });
      })
      .catch((err) => setError(apiError(err, 'Could not load tax settings.')));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const { data: d } = await createAxiosClient().put('/api/v1/tax/seller/registration/', form);
      setData(d);
      toast.success('Tax settings saved');
    } catch (err) {
      toast.error(apiError(err, 'Could not save tax settings.'));
    } finally {
      setSaving(false);
    }
  };

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data) return null;

  const rateText = (data.rates || []).map((r) => r.name).join(' + ');

  return (
    <Stack spacing={2.5} sx={{ maxWidth: 560 }}>
      <Box>
        <Typography variant="h6" sx={{ fontSize: 17, fontWeight: 700 }}>VAT registration</Typography>
        <Typography variant="body2" color="text.secondary">
          Your prices already include tax. If your business is VAT registered, turn this on so your invoices and
          your customers&apos; receipts show the VAT inside each price{rateText ? ` (${rateText})` : ''} and your TIN.
          If you&apos;re not registered, leave it off: no VAT is shown.
        </Typography>
      </Box>

      <FormControlLabel
        control={<Switch checked={form.vat_registered} disabled={!canEdit}
                         onChange={(e) => setForm((f) => ({ ...f, vat_registered: e.target.checked }))} />}
        label="My business is VAT registered"
      />

      {form.vat_registered && (
        <>
          <TextField label="TIN / VAT number" size="small" value={form.tax_id} disabled={!canEdit}
                     onChange={(e) => setForm((f) => ({ ...f, tax_id: e.target.value }))}
                     helperText="Printed on your invoices." inputProps={{ maxLength: 30 }} />
          <TextField label="Registered business name (if different)" size="small" value={form.registered_name}
                     disabled={!canEdit} inputProps={{ maxLength: 128 }}
                     onChange={(e) => setForm((f) => ({ ...f, registered_name: e.target.value }))} />
          <Box>
            {data.verified
              ? <Chip size="small" color="success" label="Checked by Negromart" />
              : <Chip size="small" label="Not yet checked by Negromart" />}
          </Box>
        </>
      )}

      {canEdit ? (
        <Box>
          <Button variant="contained" disableElevation onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </Box>
      ) : (
        <Alert severity="info">Only the store owner can change tax settings.</Alert>
      )}
    </Stack>
  );
}
