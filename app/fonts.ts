// app/fonts.ts
// Same fonts as the main site (frontend/app/fonts.ts) so the seller centre
// reads as part of Negromart, not a separate product.
import { Figtree, IBM_Plex_Mono } from 'next/font/google'

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono-stack",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export { figtree, mono };
