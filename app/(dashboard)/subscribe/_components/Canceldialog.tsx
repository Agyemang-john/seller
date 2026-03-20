"use client";

import { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, TextField, Stack, CircularProgress, Alert,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import type { ActiveSubscription } from "@/types/subscription";

interface CancelDialogProps {
  open: boolean;
  subscription: ActiveSubscription | null;
  loading: boolean;
  error: string | null;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

const INK     = "#777777";
const INK_DIM = "rgb(121, 120, 120)";

// Format ISO date to e.g. "11 April 2026"
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export default function CancelDialog({
  open, subscription, loading, error, onConfirm, onClose,
}: CancelDialogProps) {
  const [reason, setReason] = useState("");

  if (!subscription) return null;

  const planName   = subscription.plan_name;
  const accessUntil = formatDate(subscription.end_date);
  const daysLeft   = subscription.days_remaining;

  const handleConfirm = () => {
    onConfirm(reason.trim());
  };

  const handleClose = () => {
    if (loading) return;   // prevent close while request is in flight
    setReason("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          border: "1px solid rgba(8,8,8,0.10)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.12)",
        },
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            px: 3.5, py: 3,
            borderRadius: "16px 16px 0 0",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
            <WarningAmberRoundedIcon sx={{ color: "#fbbf24", fontSize: 22 }} />
            <Typography
              sx={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 22, fontWeight: 700,
              }}
            >
              Cancel {planName} plan
            </Typography>
          </Stack>
          <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
            You'll keep full access until your billing period ends.
          </Typography>
        </Box>
      </DialogTitle>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <DialogContent sx={{ px: 3.5, pt: 3, pb: 1 }}>

        {/* What happens info box */}
        <Box
          sx={{
            border: "1px solid rgba(8,8,8,0.08)",
            borderRadius: "12px",
            p: 2.5,
            mb: 3,
          }}
        >
          <Typography
            sx={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase", mb: 1.75 }}
          >
            What happens when you cancel
          </Typography>

          {[
            {
              icon: "✓",
              colour: "#16a34a",
              text: `Full ${planName} access continues until ${accessUntil} (${daysLeft} days remaining).`,
            },
            {
              icon: "✓",
              colour: "#16a34a",
              text: "No further charges will be made to your saved card.",
            },
            {
              icon: "→",
              colour: "#d97706",
              text: `After ${accessUntil} your store automatically moves to the Free plan.`,
            },
            {
              icon: "!",
              colour: "#dc2626",
              text: "Products above the Free plan limit (10) will be unlisted automatically.",
            },
          ].map(({ icon, colour, text }) => (
            <Stack key={text} direction="row" spacing={1.5} sx={{ mb: 1.25 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, mt: "1px", flexShrink: 0, color: colour }}>
                {icon}
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.55 }}>
                {text}
              </Typography>
            </Stack>
          ))}
        </Box>

        {/* Optional reason */}
        <TextField
          label="Why are you cancelling? (optional)"
          placeholder="e.g. Too expensive, switching platforms, not using enough features…"
          multiline
          minRows={3}
          fullWidth
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={loading}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              fontSize: 13,
            },
            "& .MuiInputLabel-root": { fontSize: 13 },
          }}
        />

        {/* API error */}
        {error && (
          <Alert severity="error" sx={{ borderRadius: "10px", mb: 2, fontSize: 13 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      {/* ── Actions ────────────────────────────────────────────────────── */}
      <DialogActions sx={{ px: 3.5, pb: 3, pt: 1, gap: 1.5 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
          sx={{
            borderRadius: "10px",
            borderColor: "rgba(8,8,8,0.16)",
            fontWeight: 600,
            fontSize: 13,
            px: 2.5,
            "&:hover": { borderColor: INK, color: INK, bgcolor: "transparent" },
          }}
        >
          Keep my plan
        </Button>

        <Button
          onClick={handleConfirm}
          disabled={loading}
          variant="contained"
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : null}
          sx={{
            borderRadius: "10px",
            fontWeight: 600,
            fontSize: 13,
            px: 2.5,
            boxShadow: "none",
            "&:hover": { bgcolor: "#a3a3a3", boxShadow: "none" },
            "&.Mui-disabled": { bgcolor: "#fca5a5", color: "#ffffff" },
          }}
        >
          {loading ? "Cancelling…" : `Yes, cancel ${planName}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}