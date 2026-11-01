'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, Card, Chip, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import toast from 'react-hot-toast';
import PageContainer from '@/components/PageContainer';
import { createAxiosClient } from '@/utils/clientFetch';
import { apiError, formatDate } from '@/libs/seller-ops';

const SIDE_LABEL = { buyer: 'Shopper', seller: 'Your store', staff: 'Negromart', system: 'Update' };

export default function SellerClaimPage({ params }) {
  const { ref } = use(params);
  const [claim, setClaim] = useState(null);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [offer, setOffer] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    createAxiosClient().get(`/api/v1/protection/seller/claims/${ref}/`)
      .then(({ data }) => { setClaim(data); setOffer(String(data.amount_claimed)); })
      .catch((err) => setError(apiError(err, 'Claim not found.')));
  }, [ref]);
  useEffect(() => { load(); }, [load]);

  const post = async (action, body) => {
    setBusy(true);
    try {
      const { data } = await createAxiosClient().post(`/api/v1/protection/seller/claims/${ref}/${action}/`, body);
      setClaim(data);
      return true;
    } catch (err) {
      toast.error(apiError(err));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const title = `Claim ${ref}`;
  return (
    <PageContainer title={title} breadcrumbs={[{ title: 'Home', path: '/dashboard' }, { title: 'Claims', path: '/claims' }, { title: ref }]}>
      <Box sx={{ maxWidth: 820 }}>
        {error && <Alert severity="error">{error}</Alert>}
        {!claim && !error && <CircularProgress size={24} />}
        {claim && (
          <>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, flexWrap: 'wrap' }}>
              <Chip label={claim.status_label} size="small" />
              <Typography variant="body2" color="text.secondary">
                {claim.item.title} · order {claim.order.number} · {claim.reason_label} · GHS {claim.amount_claimed} claimed
              </Typography>
            </Stack>

            {claim.status === 'open' && (
              <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Respond by {formatDate(claim.seller_respond_by, true)}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  Offer a refund to settle it. A full refund ({`GHS ${claim.amount_claimed}`}) closes the claim at once; a
                  partial one goes to the shopper to accept. The amount comes out of your earnings.
                </Typography>
                <Stack direction="row" spacing={1}>
                  <TextField size="small" type="number" label="Refund (GHS)" value={offer} onChange={(e) => setOffer(e.target.value)} />
                  <Button variant="contained" disableElevation disabled={busy || !(Number(offer) > 0)}
                          onClick={() => post('offer', { amount: offer })}>
                    Offer refund
                  </Button>
                </Stack>
              </Card>
            )}
            {claim.status === 'seller_offered' && <Alert severity="info" sx={{ mb: 2 }}>You offered GHS {claim.seller_offer_amount}. Waiting for the shopper.</Alert>}
            {claim.status === 'escalated' && <Alert severity="warning" sx={{ mb: 2 }}>Negromart is reviewing this claim. You can still add information below.</Alert>}
            {claim.status === 'resolved_buyer' && <Alert severity="error" sx={{ mb: 2 }}>Resolved: GHS {claim.resolution_amount} refunded from your earnings.</Alert>}
            {claim.status === 'resolved_seller' && <Alert severity="success" sx={{ mb: 2 }}>Decided in your favour. {claim.resolution_note}</Alert>}

            <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
              {(claim.messages || []).map((m, i) => (
                <Box key={i} sx={{ mb: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">{SIDE_LABEL[m.side]} · {formatDate(m.created_at, true)}</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{m.text}</Typography>
                  {m.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <a href={m.image} target="_blank" rel="noreferrer"><img src={m.image} alt="Attached" style={{ maxWidth: 220, borderRadius: 6 }} /></a>
                  )}
                </Box>
              ))}
            </Card>

            {['open', 'seller_offered', 'escalated'].includes(claim.status) && (
              <Stack spacing={1}>
                <TextField multiline minRows={2} value={text} onChange={(e) => setText(e.target.value)}
                           placeholder="Reply to the shopper (visible to Negromart too)" inputProps={{ maxLength: 2000 }} />
                <Box>
                  <Button variant="outlined" disabled={busy || !text.trim()}
                          onClick={async () => { if (await post('messages', { text })) setText(''); }}>
                    Send
                  </Button>
                </Box>
              </Stack>
            )}
          </>
        )}
      </Box>
    </PageContainer>
  );
}
