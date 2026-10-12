"use client";

import { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, TextField, Stack, CircularProgress, Alert, Chip,
} from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { formatLongDate } from "@/libs/utils/planBuilder";

interface CancelDialogProps {
  open: boolean;
  /** Plan name + end date of the subscription being cancelled */
  subscription: { plan_name: string; end_date: string; days_remaining: number } | null;
  /** Listing limit on Free, if known */
  freeMaxProducts: number | null;
  loading: boolean;
  error: string | null;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

const REASONS = ["Too expensive", "Not selling enough", "Missing features", "Taking a break", "Switching platforms"];

export default function CancelDialog({
  open, subscription, freeMaxProducts, loading, error, onConfirm, onClose,
}: CancelDialogProps) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  if (!subscription) return null;

  const planName = subscription.plan_name;
  const accessUntil = formatLongDate(subscription.end_date);

  const handleClose = () => {
    if (loading) return;
    setReason("");
    setDetails("");
    onClose();
  };

  const points = [
    { icon: <CheckRoundedIcon sx={{ fontSize: 16 }} />, text: `You keep ${planName} until ${accessUntil} (${subscription.days_remaining} days).` },
    { icon: <CheckRoundedIcon sx={{ fontSize: 16 }} />, text: "You won't be charged again." },
    {
      icon: <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />,
      text: `On ${accessUntil} your store moves to Free${freeMaxProducts != null && freeMaxProducts < 999_999
        ? `. Listings you already have stay live, but you can't add more once you're over ${freeMaxProducts}`
        : ""}.`,
    },
    { icon: <CheckRoundedIcon sx={{ fontSize: 16 }} />, text: "You can undo this any time before then." },
  ];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "16px" } }}>
      <DialogTitle sx={{ px: 3.5, pt: 3, pb: 1 }}>
        <Typography component="span" sx={{ display: "block", fontFamily: "var(--font-figtree), system-ui, sans-serif", fontSize: 22, fontWeight: 700 }}>
          Cancel {planName}?
        </Typography>
        <Typography component="span" variant="body2" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
          Here&apos;s what happens.
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 3.5, pt: 2, pb: 1 }}>
        <Stack spacing={1.25} sx={{ p: 2.25, mb: 3, borderRadius: "12px", border: 1, borderColor: "divider", bgcolor: "action.hover" }}>
          {points.map(({ icon, text }) => (
            <Stack key={text} direction="row" spacing={1.25} alignItems="flex-start">
              <Box sx={{ color: "text.secondary", display: "flex", mt: "2px" }}>{icon}</Box>
              <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6 }}>{text}</Typography>
            </Stack>
          ))}
        </Stack>

        <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ mb: 1.25 }}>
          Why are you cancelling? <Typography component="span" variant="body2" color="text.secondary">(optional)</Typography>
        </Typography>
        <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1, mb: 2 }}>
          {REASONS.map((r) => (
            <Chip
              key={r}
              label={r}
              onClick={() => setReason(reason === r ? "" : r)}
              variant={reason === r ? "filled" : "outlined"}
              disabled={loading}
              sx={{
                fontWeight: 600, borderRadius: "8px",
                ...(reason === r && { bgcolor: "text.primary", color: "background.paper", "&:hover": { bgcolor: "text.secondary" } }),
              }}
            />
          ))}
        </Stack>
        <TextField
          placeholder="Anything else we should know?"
          multiline
          minRows={2}
          fullWidth
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          disabled={loading}
          sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: 13 } }}
        />

        {error && <Alert severity="error" sx={{ borderRadius: "10px", mb: 2 }}>{error}</Alert>}
      </DialogContent>

      <DialogActions sx={{ px: 3.5, pb: 3, pt: 1, gap: 1 }}>
        <Button onClick={handleClose} disabled={loading} variant="contained" disableElevation
          sx={{ borderRadius: "10px", fontWeight: 700, px: 2.5, bgcolor: "text.primary", color: "background.paper", "&:hover": { bgcolor: "text.secondary" } }}>
          Keep {planName}
        </Button>
        <Button
          onClick={() => onConfirm([reason, details.trim()].filter(Boolean).join(" — "))}
          disabled={loading}
          color="error"
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : null}
          sx={{ borderRadius: "10px", fontWeight: 600, px: 2 }}
        >
          {loading ? "Cancelling…" : "Cancel subscription"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
