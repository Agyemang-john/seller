'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LogoutIcon from '@mui/icons-material/Logout';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function DangerZone() {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const CONFIRM_WORD = 'DELETE';

  const handleDeleteRequest = async () => {
    if (confirmText !== CONFIRM_WORD) {
      toast.error(`Please type ${CONFIRM_WORD} to confirm.`);
      return;
    }
    setSubmitting(true);
    try {
      // Placeholder — wire to a real endpoint when available
      await new Promise(r => setTimeout(r, 1000));
      setSubmitted(true);
      toast.success('Account deletion request submitted. You will hear from us within 48 hours.');
      setDeleteOpen(false);
      setConfirmText('');
    } catch {
      toast.error('Failed to submit deletion request. Please contact support.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
        <WarningAmberIcon color="error" />
        <Typography variant="h6" fontWeight={700} color="error.main">Danger Zone</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        These actions are permanent and cannot be undone. Please proceed with caution.
      </Typography>

      <Stack spacing={2}>
        {/* Logout */}
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ sm: 'center' }}
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>Sign Out</Typography>
                <Typography variant="body2" color="text.secondary">
                  End your current session and return to the login page.
                </Typography>
              </Box>
              <Button
                component={Link}
                href="/logout"
                variant="outlined"
                startIcon={<LogoutIcon />}
                sx={{ flexShrink: 0 }}
              >
                Sign Out
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Delete account */}
        <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'error.main' }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ sm: 'center' }}
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <WarningAmberIcon color="error" />
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>Delete Seller Account</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Permanently remove your seller profile, products, and all associated data.
                  </Typography>
                </Box>
              </Stack>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteForeverIcon />}
                onClick={() => setDeleteOpen(true)}
                disabled={submitted}
                sx={{ flexShrink: 0 }}
              >
                {submitted ? 'Request Submitted' : 'Delete Account'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Confirm dialog */}
      <Dialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setConfirmText(''); }}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main', fontWeight: 700 }}>
          <DeleteForeverIcon /> Confirm Account Deletion
        </DialogTitle>

        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This action <strong>cannot be undone</strong>. All your products, order history, reviews,
            and seller data will be permanently deleted within 30 days of the request.
          </Alert>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Type <strong>{CONFIRM_WORD}</strong> below to confirm:
          </Typography>
          <TextField
            fullWidth
            placeholder={`Type ${CONFIRM_WORD} here`}
            value={confirmText}
            onChange={e => setConfirmText(e.target.value.toUpperCase())}
            size="small"
            autoComplete="off"
            error={confirmText.length > 0 && confirmText !== CONFIRM_WORD}
            helperText={confirmText.length > 0 && confirmText !== CONFIRM_WORD ? `Must match "${CONFIRM_WORD}" exactly` : ''}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => { setDeleteOpen(false); setConfirmText(''); }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={submitting ? null : <DeleteForeverIcon />}
            onClick={handleDeleteRequest}
            disabled={confirmText !== CONFIRM_WORD || submitting}
          >
            {submitting ? 'Submitting…' : 'Submit Deletion Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
