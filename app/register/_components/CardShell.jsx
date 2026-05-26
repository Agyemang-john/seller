import React from "react";
import { CircularProgress } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const CardShell = ({
  stepLabel,
  title,
  description,
  children,
  onBack,
  onNext,
  nextLabel = "Continue",
  loading = false,
  footerNote,
}) => {
  return (
    <div>
      {/* ── Card header ── */}
      <div
        style={{
          padding: "24px 32px 20px",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
        }}
      >
        {/* Step badge */}
        <span
          style={{
            display: "inline-block",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            color: "var(--nm-blue)",
            background: "#e8f2ff",
            padding: "3px 12px",
            borderRadius: "999px",
            marginBottom: 10,
          }}
        >
          {stepLabel}
        </span>

        <div
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            lineHeight: 1.3,
            color: "var(--nm-text-dark)",
          }}
        >
          {title}
        </div>

        {description && (
          <div
            style={{
              fontSize: 13,
              color: "var(--nm-text-mid)",
              marginTop: 4,
              lineHeight: 1.5,
            }}
          >
            {description}
          </div>
        )}
      </div>

      {/* ── Card body ── */}
      <div style={{ padding: "24px 32px" }}>
        {children}
      </div>

      {/* ── Card footer ── */}
      <div
        style={{
          padding: "14px 32px",
          borderTop: "1px solid rgba(0,0,0,0.07)",
          background: "#f8fafc",
          borderRadius: "0 0 14px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Left side */}
        <div>
          {footerNote ? (
            <span style={{ fontSize: 12, color: "var(--nm-text-mid)" }}>
              {footerNote}
            </span>
          ) : onBack ? (
            <button
              onClick={onBack}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 500,
                color: "var(--nm-text-mid)",
                padding: "6px 10px",
                borderRadius: 8,
                transition: "background 0.15s",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f0f0")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <ArrowBackIcon style={{ fontSize: 15 }} />
              Back
            </button>
          ) : (
            <span style={{ fontSize: 12, color: "var(--nm-text-mid)" }}>
              <span style={{ color: "#e53e3e" }}>*</span> Required fields
            </span>
          )}
        </div>

        {/* Right: Next/Submit button */}
        {onNext && (
          <button
            onClick={onNext}
            disabled={loading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: loading ? "#93c5fd" : "var(--nm-blue)",
              color: "var(--nm-white)",
              border: "none",
              borderRadius: "var(--nm-radius-pill)",
              padding: "10px 28px",
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              transition: "background 0.18s, transform 0.1s",
              boxShadow: "0 2px 8px rgba(0,113,206,0.3)",
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = "var(--nm-blue-hover)";
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = "var(--nm-blue)";
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={14} style={{ color: "white" }} />
                Submitting…
              </>
            ) : (
              <>
                {nextLabel}
                <ArrowForwardIcon style={{ fontSize: 15 }} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default CardShell;
