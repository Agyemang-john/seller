'use client';

/**
 * Order handling settings (GET/PATCH /api/v1/vendor/operations-settings/).
 *   handling_days       – ship-by deadline = order date + this many days
 *   low_stock_threshold – products at or below it are flagged on the home page
 * Everyone on the team can see them; only roles with "manage store" can change them.
 */

import { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, CircularProgress, Grid, Skeleton, TextField, Typography } from '@mui/material';
import toast from 'react-hot-toast';
import { createAxiosClient } from '@/utils/clientFetch';
import useVendorAccess, { CAP } from '@/hooks/useVendorAccess';
import { apiError } from '@/libs/seller-ops';

export default function OperationsSettings() {
  const { can } = useVendorAccess();
  const editable = can(CAP.MANAGE_STORE);
  const [values, setValues] = useState(null);
  const [saved, setSaved] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    createAxiosClient().get('/api/v1/vendor/operations-settings/')
      .then(({ data }) => { setValues(data); setSaved(data); })
      .catch((err) => setError(apiError(err, 'Could not load order handling settings.')));
  }, []);

  const dirty = values && saved && (values.handling_days !== saved.handling_days
    || values.low_stock_threshold !== saved.low_stock_threshold);

  const save = async () => {
    setBusy(true);
    try {
      const { data } = await createAxiosClient().patch('/api/v1/vendor/operations-settings/', values);
      setValues(data);
      setSaved(data);
      toast.success('Order handling settings saved.');
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  const setNumber = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value === '' ? '' : Number(e.target.value) }));

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Order handling</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        How quickly you dispatch orders and when we warn you about stock.
      </Typography>
      <Card variant="outlined" sx={{ borderRadius: '12px' }}>
        <CardContent>
          {error ? (
            <Alert severity="error">{error}</Alert>
          ) : !values ? (
            <Skeleton variant="rounded" height={80} />
          ) : (
            <Grid container spacing={2} alignItems="flex-start">
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  label="Handling time (days)" type="number" fullWidth size="small"
                  value={values.handling_days} onChange={setNumber('handling_days')} disabled={!editable}
                  inputProps={{ min: 1, max: 14 }}
                  helperText="Orders not shipped within this time are marked late."
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  label="Low-stock alert at (units)" type="number" fullWidth size="small"
                  value={values.low_stock_threshold} onChange={setNumber('low_stock_threshold')} disabled={!editable}
                  inputProps={{ min: 0 }}
                  helperText="Products at or below this quantity are flagged."
                />
              </Grid>
              {editable && (
                <Grid size={{ xs: 12, md: 4 }}>
                  <Button variant="contained" onClick={save} disabled={!dirty || busy} sx={{ mt: { md: 0.25 } }}>
                    {busy ? <CircularProgress size={18} color="inherit" /> : 'Save changes'}
                  </Button>
                </Grid>
              )}
            </Grid>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
