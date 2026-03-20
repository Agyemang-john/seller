// app/(vendor)/subscription/verify/page.js
"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Paper,
  Stack,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import { useVerifySubscription } from "@/hooks/useSubscription";

const PRO_BG = "#111111";
const PRO_TEXT = "#ffffff";

// ── Shared card wrapper ───────────────────────────────────────────────────────
function VerifyCard({ children }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: "24px",
          p: { xs: "36px 24px", sm: "52px 44px" },
          textAlign: "center",
          maxWidth: 420,
          width: "100%",
        }}
      >
        {children}
      </Paper>
    </Box>
  );
}

// ── MoMo success ─────────────────────────────────────────────────────────────
function MomoSuccess() {
  const router = useRouter();

  return (
    <VerifyCard>
      <Box
        sx={{
          width: 68,
          height: 68,
          borderRadius: "50%",
          bgcolor: PRO_BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 3,
        }}
      >
        <CheckIcon sx={{ fontSize: 28, color: PRO_TEXT }} />
      </Box>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        spacing={1}
        sx={{ mb: 1.5 }}
      >
        <PhoneAndroidIcon
          sx={{ fontSize: 18, color: "text.secondary" }}
        />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            fontSize: 11,
          }}
        >
          Mobile Money
        </Typography>
      </Stack>

      <Typography
        sx={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 38,
          fontWeight: 700,
          letterSpacing: "-1.5px",
          mb: 1.5,
        }}
        color="text.primary"
      >
        Payment confirmed.
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ fontWeight: 300, lineHeight: 1.7, mb: 3 }}
      >
        Your MoMo payment was approved and your subscription is now{" "}
        <Box component="strong" sx={{ color: "text.primary", fontWeight: 600 }}>
          active
        </Box>
        . Your store features have been unlocked.
      </Typography>

      <Box
        sx={{
          bgcolor: "action.hover",
          border: 1,
          borderColor: "divider",
          borderRadius: "10px",
          p: "14px 18px",
          mb: 3.5,
          display: "flex",
          alignItems: "flex-start",
          gap: 1.25,
          textAlign: "left",
        }}
      >
        <AutorenewIcon
          sx={{
            fontSize: 18,
            color: "text.secondary",
            mt: "1px",
            flexShrink: 0,
          }}
        />
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.65 }}
        >
          Your plan renews automatically. You&apos;ll receive a reminder before
          each charge. Cancel anytime from your billing dashboard.
        </Typography>
      </Box>

      <Button
        fullWidth
        variant="contained"
        disableElevation
        onClick={() => router.push("/dashboard")}
        sx={{
          py: 1.75,
          bgcolor: "text.primary",
          color: "background.paper",
          borderRadius: "10px",
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 700,
          fontSize: 17,
          "&:hover": { bgcolor: "text.secondary" },
        }}
      >
        Go to my Dashboard →
      </Button>
    </VerifyCard>
  );
}

// ── Card verification ─────────────────────────────────────────────────────────
function CardVerifyInner() {
  const { status, planName, error, goToDashboard } =
    useVerifySubscription();
  const searchParams = useSearchParams();
  const reference =
    searchParams.get("ref") ?? searchParams.get("reference");

  if (status === "loading" || status === "idle") {
    return (
      <VerifyCard>
        <Box
          sx={{
            width: 68,
            height: 68,
            borderRadius: "50%",
            bgcolor: "action.hover",
            border: 1,
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3,
          }}
        >
          <CircularProgress
            size={24}
            thickness={5}
            sx={{ color: "text.primary" }}
          />
        </Box>

        <Typography
          sx={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: "-1px",
            mb: 1.5,
          }}
          color="text.primary"
        >
          Confirming your payment…
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontWeight: 300, lineHeight: 1.7 }}
        >
          Please wait while we verify your subscription with Paystack.
        </Typography>
      </VerifyCard>
    );
  }

  if (status === "error") {
    return (
      <VerifyCard>
        <Box
          sx={{
            width: 68,
            height: 68,
            borderRadius: "50%",
            bgcolor: "error.lighter",
            border: 1,
            borderColor: "error.light",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3,
          }}
        >
          <CloseIcon sx={{ fontSize: 28, color: "error.main" }} />
        </Box>

        <Typography
          sx={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: "-1px",
            mb: 1.5,
          }}
          color="text.primary"
        >
          Payment could not be verified
        </Typography>

        <Typography
          variant="body1"
          color="error.main"
          sx={{ lineHeight: 1.7, mb: 2 }}
        >
          {error}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.7, mb: 3.5 }}
        >
          If you were charged, contact{" "}
          <Box
            component="a"
            href="mailto:support@negromart.com"
            sx={{
              color: "text.primary",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            support@negromart.com
          </Box>{" "}
          with reference: <strong>{reference}</strong>
        </Typography>

        <Button
          fullWidth
          variant="contained"
          disableElevation
          onClick={() => {
            window.location.href = "/vendor/subscription";
          }}
          sx={{
            py: 1.75,
            bgcolor: "text.primary",
            color: "background.paper",
            borderRadius: "10px",
            fontWeight: 600,
            fontSize: 14,
            "&:hover": { bgcolor: "text.secondary" },
          }}
        >
          Try again
        </Button>
      </VerifyCard>
    );
  }

  return (
    <VerifyCard>
      <Box
        sx={{
          width: 68,
          height: 68,
          borderRadius: "50%",
          bgcolor: PRO_BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 3,
        }}
      >
        <CheckIcon sx={{ fontSize: 28, color: PRO_TEXT }} />
      </Box>

      <Typography
        sx={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 38,
          fontWeight: 700,
          letterSpacing: "-1.5px",
          mb: 1.5,
        }}
        color="text.primary"
      >
        You&apos;re live.
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ fontWeight: 300, lineHeight: 1.7, mb: 3 }}
      >
        Your{" "}
        <Box
          component="strong"
          sx={{ color: "text.primary", fontWeight: 600 }}
        >
          {planName} Plan
        </Box>{" "}
        is now active.
      </Typography>

      <Button
        fullWidth
        variant="contained"
        disableElevation
        onClick={goToDashboard}
        sx={{
          py: 1.75,
          bgcolor: "text.primary",
          color: "background.paper",
          borderRadius: "10px",
          fontWeight: 700,
          fontSize: 17,
        }}
      >
        Go to my Dashboard →
      </Button>
    </VerifyCard>
  );
}

// ── Router ───────────────────────────────────────────────────────────────────
function VerifyRouter() {
  const searchParams = useSearchParams();
  const isMomo = searchParams.get("momo") === "1";

  if (isMomo) return <MomoSuccess />;

  return <CardVerifyInner />;
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function SubscriptionVerifyPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: "100vh",
            bgcolor: "background.default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress
            size={28}
            thickness={5}
            sx={{ color: "text.primary" }}
          />
        </Box>
      }
    >
      <VerifyRouter />
    </Suspense>
  );
}