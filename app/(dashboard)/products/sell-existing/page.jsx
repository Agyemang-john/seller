'use client';

/**
 * "Sell an existing item" (backend: catalog/). Find an item that's already on
 * Negromart and add your own offer: your price, stock and condition. Its photos
 * and description are reused, and shoppers see your offer under "Other sellers"
 * (or as the featured offer, when yours is the best buy).
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert, Box, Button, Card, CircularProgress, MenuItem, Stack, TextField, Typography,
} from '@mui/material';
import toast from 'react-hot-toast';
import PageContainer from '@/components/PageContainer';
import { createAxiosClient } from '@/utils/clientFetch';
import { apiError } from '@/libs/seller-ops';

const pageTitle = 'Sell an existing item';

export default function SellExistingPage() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [picked, setPicked] = useState(null);
  const [check, setCheck] = useState(null);
  const [form, setForm] = useState({ price: '', quantity: '1', condition: 'new', seller_sku: '' });
  const [saving, setSaving] = useState(false);

  const search = async (e) => {
    e?.preventDefault();
    if (q.trim().length < 2) return;
    setSearching(true);
    try {
      const { data } = await createAxiosClient().get('/api/v1/product/search/', { params: { q: q.trim(), page_size: 30 } });
      setResults((data.products_with_details || []).map((r) => r.product));
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const pick = async (product) => {
    setPicked(product);
    setCheck(null);
    try {
      const { data } = await createAxiosClient().get('/api/v1/catalog/seller/offers/', { params: { product: product.id } });
      setCheck(data);
    } catch (err) {
      setCheck({ error: apiError(err, 'Could not check this item.') });
    }
  };

  const submit = async () => {
    setSaving(true);
    try {
      await createAxiosClient().post('/api/v1/catalog/seller/offers/', { product: picked.id, ...form });
      toast.success('Your offer is live');
      router.push('/products');
    } catch (err) {
      toast.error(apiError(err, 'Could not create your offer.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer title={pageTitle} breadcrumbs={[{ title: 'Home', path: '/dashboard' }, { title: 'Products', path: '/products' }, { title: pageTitle }]}>
      <Box sx={{ maxWidth: 820 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Selling something that&apos;s already listed? Add your offer instead of a new listing: you set the price,
          stock and condition, and we reuse the photos and description. The best offer (price, stock, dispatch speed
          and reviews) is featured; the others show under &quot;Other sellers&quot;. Items in sizes or colours need
          their own listing: give it the same barcode and it&apos;s grouped automatically.
        </Typography>

        {!picked && (
          <>
            <Box component="form" onSubmit={search} sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField fullWidth size="small" value={q} onChange={(e) => setQ(e.target.value)}
                         placeholder="Search Negromart, e.g. Samsung Galaxy A15 128GB" />
              <Button type="submit" variant="contained" disableElevation disabled={searching}>Search</Button>
            </Box>
            {searching && <CircularProgress size={24} />}
            {results && results.length === 0 && <Typography color="text.secondary">No items found.</Typography>}
            <Stack spacing={1}>
              {(results || []).map((p) => (
                <Card key={p.id} variant="outlined" sx={{ p: 1.5, display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  {p.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt="" width={56} height={56} style={{ objectFit: 'cover', borderRadius: 6 }} />
                  )}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography noWrap sx={{ fontWeight: 600 }}>{p.title}</Typography>
                    <Typography variant="caption" color="text.secondary">Listed at {p.currency === 'USD' ? '$' : '₵'}{Number(p.price).toFixed(2)}</Typography>
                  </Box>
                  <Button size="small" variant="outlined" onClick={() => pick(p)}>Sell this</Button>
                </Card>
              ))}
            </Stack>
          </>
        )}

        {picked && (
          <Card variant="outlined" sx={{ p: 2 }}>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>{picked.title}</Typography>
            {!check && <CircularProgress size={20} />}
            {check?.error && <Alert severity="error">{check.error}</Alert>}
            {check && !check.error && !check.can_offer && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {check.my_offer ? 'You already sell this item.' : check.has_variants
                  ? 'This item comes in sizes or colours. Create your own listing with the same barcode instead.'
                  : "This item can't take offers right now."}
              </Alert>
            )}
            {check?.can_offer && (
              <Stack spacing={2} sx={{ maxWidth: 420 }}>
                <TextField label="Your price (GHS)" type="number" size="small" value={form.price}
                           onChange={(e) => setForm({ ...form, price: e.target.value })} />
                <TextField label="Quantity in stock" type="number" size="small" value={form.quantity}
                           onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                <TextField select label="Condition" size="small" value={form.condition}
                           onChange={(e) => setForm({ ...form, condition: e.target.value })}>
                  <MenuItem value="new">New</MenuItem>
                  <MenuItem value="refurbished">Refurbished</MenuItem>
                  <MenuItem value="used">Used</MenuItem>
                </TextField>
                <TextField label="Your SKU (optional)" size="small" value={form.seller_sku}
                           onChange={(e) => setForm({ ...form, seller_sku: e.target.value })} inputProps={{ maxLength: 64 }} />
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" disableElevation onClick={submit}
                          disabled={saving || !(Number(form.price) > 0) || !(Number(form.quantity) > 0)}>
                    {saving ? 'Saving…' : 'Start selling'}
                  </Button>
                  <Button onClick={() => setPicked(null)}>Back</Button>
                </Stack>
              </Stack>
            )}
            {check && !check.can_offer && <Button sx={{ mt: 1 }} onClick={() => setPicked(null)}>Back</Button>}
          </Card>
        )}
      </Box>
    </PageContainer>
  );
}
