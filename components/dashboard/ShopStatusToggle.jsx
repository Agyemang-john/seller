'use client';

import { useState } from 'react';
import {
  Box, Switch, FormControlLabel, Typography, Dialog,
  DialogTitle, DialogContent, DialogActions, Button,
  Alert, Chip, CircularProgress,
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import StoreOutlinedIcon from '@mui/icons-material/StoreOutlined';
import { createAxiosClient } from '@/utils/clientFetch';
import { toast } from 'react-toastify';

const axios = createAxiosClient();

const PAUSE_EFFECTS = [
  'All your products will be hidden from search and category listings.',
  'Customers will not be able to add your items to their cart or wishlist.',
  'No new orders can be placed from your shop.',
  'Existing orders and payouts are unaffected.',
  'You can turn your shop back on at any time — everything stays intact.',
];

const RESUME_EFFECTS = [
  'All your published products become visible to customers immediately.',
  'Customers can search, browse, add to cart, and order from your shop.',
];

/**
 * Shop on/off toggle with confirmation modal.
 *
 * Props:
 *   initialPaused  boolean  — current shop_paused value from the server
 *   onToggle       fn(newPaused) — called after a successful API update
 *   compact        boolean  — render just the switch + label, no pill wrapper
 *                             (use inside a card that already shows status context)
 */
export default function ShopStatusToggle({ initialPaused = false, onToggle, compact = false }) {
  const [paused, setPaused]       = useState(initialPaused);
  const [pending, setPending]     = useState(null);   // null | true | false
  const [loading, setLoading]     = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSwitchChange = (e) => {
    setPending(!e.target.checked); // toggling: checked=true means "shop live" → pending=false (resume)
    setDialogOpen(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await axios.patch('/api/v1/vendor/shop/status/', { paused: pending });
      setPaused(pending);
      onToggle?.(pending);
      toast.success(
        pending
          ? 'Your shop is now paused. Products are hidden from customers.'
          : 'Your shop is live again! Customers can see your products.',
      );
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Something went wrong. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
      setDialogOpen(false);
      setPending(null);
    }
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setPending(null);
  };

  const wantsToPause  = pending === true;
  const wantsToResume = pending === false;

  const switchControl = (
    <FormControlLabel
      control={
        <Switch
          checked={!paused}
          onChange={handleSwitchChange}
          color="success"
          size="small"
        />
      }
      label={
        <Typography variant="body2" fontWeight={600} sx={{ userSelect: 'none' }}>
          {paused ? 'Turn shop on' : 'Pause shop'}
        </Typography>
      }
      sx={{ m: 0 }}
    />
  );

  return (
    <>
      {compact ? (
        switchControl
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            py: 1.25,
            borderRadius: 2,
            border: '1px solid',
            borderColor: paused ? 'warning.light' : 'success.light',
            bgcolor: paused ? 'warning.50' : 'success.50',
            width: 'fit-content',
          }}
        >
          {paused
            ? <StoreOutlinedIcon sx={{ color: 'warning.main', fontSize: 20 }} />
            : <StorefrontIcon sx={{ color: 'success.main', fontSize: 20 }} />
          }
          {switchControl}
        </Box>
      )}

      {/* ── Confirmation dialog ─────────────────────────────────────── */}
      <Dialog
        open={dialogOpen}
        onClose={handleCancel}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {wantsToPause ? 'Pause your shop?' : 'Bring your shop back online?'}
        </DialogTitle>

        <DialogContent sx={{ pt: 0 }}>
          <Alert
            severity={wantsToPause ? 'warning' : 'info'}
            sx={{ mb: 2, borderRadius: 2 }}
          >
            {wantsToPause
              ? 'Your shop will be immediately hidden from customers.'
              : 'Your shop and all published products will be visible to customers right away.'}
          </Alert>

          <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={600}>
            What happens:
          </Typography>
          <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
            {(wantsToPause ? PAUSE_EFFECTS : RESUME_EFFECTS).map((line) => (
              <Typography component="li" variant="body2" color="text.secondary" key={line} sx={{ mb: 0.5 }}>
                {line}
              </Typography>
            ))}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handleCancel}
            disabled={loading}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color={wantsToPause ? 'warning' : 'success'}
            onClick={handleConfirm}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={14} color="inherit" /> : null}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            {loading
              ? 'Saving…'
              : wantsToPause
                ? 'Yes, pause my shop'
                : 'Yes, go live'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
