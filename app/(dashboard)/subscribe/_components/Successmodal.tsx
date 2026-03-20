"use client";

import { Box, Typography, Paper, Stack, Backdrop } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import AutorenewIcon from "@mui/icons-material/Autorenew";

interface SuccessModalProps {
  planName: string;
  onClose: () => void;
}

export default function SuccessModal({ planName, onClose }: SuccessModalProps) {
  return (
    <Backdrop
      open
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      sx={{ zIndex: (theme) => theme.zIndex.modal, backdropFilter: "blur(12px)" }}
    >
      <Paper
        elevation={8}
        onClick={(e) => e.stopPropagation()}
        sx={{
          p: "52px 44px", borderRadius: "24px",
          textAlign: "center", maxWidth: 420, width: "100%", mx: 3,
          animation: "modalIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
          "@keyframes modalIn": {
            from: { opacity: 0, transform: "scale(0.88) translateY(18px)" },
            to:   { opacity: 1, transform: "scale(1) translateY(0)" },
          },
        }}
      >
        {/* Check icon */}
        <Box
          sx={{
            width: 68, height: 68, borderRadius: "50%",
            border: 1, borderColor: "divider",
            display: "flex", alignItems: "center", justifyContent: "center",
            mx: "auto", mb: 3,
          }}
        >
          <CheckIcon sx={{ fontSize: 28, color: "text.primary" }} />
        </Box>

        <Typography sx={{ fontFamily: "serif", fontSize: 34, fontWeight: 700, letterSpacing: "-1px", mb: 1.5 }} color="text.primary">
          You&apos;re live.
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 300, lineHeight: 1.7, mb: 4.5 }}>
          Your{" "}
          <Typography component="strong" fontWeight={600} color="text.primary">
            {planName} Plan
          </Typography>
          {" "}is now active. Your new features are unlocked and a receipt has been sent to your email.
        </Typography>

        {/* Auto-renewal note */}
        <Paper
          variant="outlined"
          sx={{ p: "14px 18px", borderRadius: "10px", mb: 3.5, bgcolor: "action.hover" }}
        >
          <Stack direction="row" alignItems="flex-start" spacing={1}>
            <AutorenewIcon sx={{ fontSize: 16, color: "text.secondary", mt: "2px", flexShrink: 0 }} />
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, textAlign: "left" }}>
              Your plan renews automatically. You&apos;ll receive an email 24 hours before each charge. Cancel anytime from your dashboard.
            </Typography>
          </Stack>
        </Paper>

        {/* CTA */}
        <Box
          component="button"
          onClick={onClose}
          sx={{
            width: "100%", py: 1.75,
            bgcolor: "text.primary", color: "background.paper",
            border: "none", borderRadius: "10px",
            fontFamily: "serif", fontSize: 16, fontWeight: 700,
            cursor: "pointer", letterSpacing: "-0.3px",
            transition: "all 0.2s",
            "&:hover": { opacity: 0.88, transform: "translateY(-1px)" },
          }}
        >
          Go to my Dashboard →
        </Box>
      </Paper>
    </Backdrop>
  );
}