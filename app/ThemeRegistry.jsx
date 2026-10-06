"use client";

import { CacheProvider } from "@emotion/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useState } from "react";
import createEmotionCache from "./emotion-cache";

// Base theme for pages outside the dashboard (landing, registration, auth,
// join-team). Uses the main site's font; the dashboard wraps its pages in
// theme/AppTheme, which takes precedence there.
const baseTheme = createTheme({
  typography: {
    fontFamily: "var(--font-figtree), system-ui, sans-serif",
    button: { textTransform: "none", fontWeight: 600 },
  },
  palette: {
    // Seller brand blue (styles/marketplace.css --nm-blue)
    primary: { main: "#0071ce", dark: "#0058a3", contrastText: "#ffffff" },
    text: { primary: "#1a1a2e", secondary: "#4a4a4a" },
  },
  shape: { borderRadius: 8 },
});

export default function ThemeRegistry({ children }) {
  const [cache] = useState(() => createEmotionCache());
  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={baseTheme}>{children}</ThemeProvider>
    </CacheProvider>
  );
}
