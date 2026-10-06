import React from "react";
import { CircularProgress } from "@mui/material";

/**
 * Frame for each store-application step: heading, body, and a footer with
 * Back / Continue. Plain styling to match the rest of registration
 * (see the SELLER REGISTRATION block in styles/marketplace.css).
 */
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
      {/* ── Header ── */}
      <div style={{ padding: "24px 32px 20px", borderBottom: "1px solid var(--nm-border)" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--nm-blue)", marginBottom: 6 }}>
          {stepLabel}
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.3, color: "var(--nm-navy)", margin: 0 }}>
          {title}
        </h2>
        {description && (
          <p style={{ fontSize: 14, color: "var(--nm-text-mid)", margin: "6px 0 0", lineHeight: 1.6 }}>
            {description}
          </p>
        )}
      </div>

      {/* ── Body ── */}
      <div style={{ padding: "24px 32px" }}>{children}</div>

      {/* ── Footer ── */}
      <div
        style={{
          padding: "16px 32px",
          borderTop: "1px solid var(--nm-border)",
          background: "#f7f8fa",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          {footerNote ? (
            <span style={{ fontSize: 13, color: "var(--nm-text-mid)" }}>{footerNote}</span>
          ) : onBack ? (
            <button type="button" onClick={onBack} className="nm-btn nm-btn-secondary">
              Back
            </button>
          ) : (
            <span style={{ fontSize: 13, color: "var(--nm-text-mid)" }}>
              Fields marked <span style={{ color: "#b91c1c" }}>*</span> are required
            </span>
          )}
        </div>

        {onNext && (
          <button type="button" onClick={onNext} disabled={loading} className="nm-btn nm-btn-primary">
            {loading ? (
              <>
                <CircularProgress size={14} style={{ color: "white" }} />
                Submitting…
              </>
            ) : (
              nextLabel
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default CardShell;
