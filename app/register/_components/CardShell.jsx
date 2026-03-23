import React from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

// ─── Card Shell wraps each step with a header, scrollable body, and footer nav ─
const CardShell = ({
  stepLabel,        // e.g. "Step 1 of 4"
  title,            // e.g. "Business Information"
  description,      // subtitle text
  children,         // form content
  onBack,           // undefined hides Back button
  onNext,           // undefined hides Next button
  nextLabel = "Continue",
  loading = false,
  footerNote,       // optional left-side note in footer
}) => {
  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          px: { xs: 2.5, sm: 3.5 },
          pt: 3,
          pb: 2.5,
          borderBottom: "1px solid rgba(0,0,0,0.07)",
        }}
      >
        <Typography
          sx={{
            display: "inline-block",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.06em",
            color: "#1a56db",
            bgcolor: "#e8f0fe",
            px: 1.25,
            py: 0.4,
            borderRadius: 10,
            mb: 1,
          }}
        >
          {stepLabel}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.1rem", lineHeight: 1.3 }}>
          {title}
        </Typography>
        {description && (
          <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.5 }}>
            {description}
          </Typography>
        )}
      </Box>

      {/* Body */}
      <Box sx={{ px: { xs: 2.5, sm: 3.5 }, py: 3 }}>
        {children}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          px: { xs: 2.5, sm: 3.5 },
          py: 2,
          borderTop: "1px solid rgba(0,0,0,0.07)",
          bgcolor: "#f8fafc",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: "0 0 12px 12px",
        }}
      >
        <Box>
          {footerNote ? (
            <Typography sx={{ fontSize: 12, color: "text.disabled" }}>
              {footerNote}
            </Typography>
          ) : onBack ? (
            <Button
              onClick={onBack}
              startIcon={<ArrowBackIcon sx={{ fontSize: 15 }} />}
              sx={{
                textTransform: "none",
                fontSize: 13,
                fontWeight: 500,
                color: "text.secondary",
                "&:hover": { bgcolor: "rgba(0,0,0,0.05)" },
              }}
            >
              Back
            </Button>
          ) : (
            <Typography sx={{ fontSize: 12, color: "text.disabled" }}>
              <Typography component="span" sx={{ color: "error.main" }}>*</Typography> Required fields
            </Typography>
          )}
        </Box>

        {onNext && (
          <Button
            variant="contained"
            onClick={onNext}
            disabled={loading}
            endIcon={
              loading ? (
                <CircularProgress size={15} sx={{ color: "white" }} />
              ) : (
                <ArrowForwardIcon sx={{ fontSize: 15 }} />
              )
            }
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: 14,
              px: 3,
              py: 1,
              bgcolor: "#1a56db",
              borderRadius: 2,
              boxShadow: "0 1px 4px rgba(26,86,219,0.3)",
              "&:hover": {
                bgcolor: "#1240a8",
                boxShadow: "0 4px 12px rgba(26,86,219,0.35)",
              },
            }}
          >
            {loading ? "Submitting..." : nextLabel}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default CardShell;