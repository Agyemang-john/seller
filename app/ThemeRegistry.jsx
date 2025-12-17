"use client";

import { CacheProvider } from "@emotion/react";
import { useState } from "react";
import createEmotionCache from "./emotion-cache";

export default function ThemeRegistry({ children }) {
  const [cache] = useState(() => createEmotionCache());
  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
