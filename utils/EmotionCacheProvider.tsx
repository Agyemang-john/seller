"use client";

import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

const clientSideEmotionCache = createCache({ key: "css", prepend: true });

export default function EmotionCacheProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CacheProvider value={clientSideEmotionCache}>{children}</CacheProvider>;
}
