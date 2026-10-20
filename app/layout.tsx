// app/layout.tsx

import React from "react";
import type { Metadata, Viewport } from "next";
import { figtree, mono } from './fonts';
import Provider from '@/redux/provider';
import { Setup } from '@/utils';
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import ThemeRegistry from "./ThemeRegistry";
import '@/styles/marketplace.css';



export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://seller.negromart.com'),
  title: "Negromart Seller Center",
  description: "Connecting you to global buyers. Sell millions of affordable products from around the world on NegroMart",
  keywords: [
    "Negromart",
    "E-commerce",
    "Black-owned business",
    "African marketplace",
    "Pan-African commerce",
    "African products",
    "Online shopping",
    "Buy African",
    "African heritage",
    "African jewelry",
    "Afro fashion",
    "Sustainable African products"
  ],
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/apple-icon-180.png",
  },
  // Lets sellers "Add to Home Screen" and run the dashboard like an app.
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Seller Center",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Negromart Seller Center",
    description: "Connecting you to global buyers. Sell millions of affordable products from around the world on NegroMart.",
    url: "https://seller.negromart.com", // change to your actual domain
    siteName: "Negromart Seller",
    images: [
      {
        url: "/openGraph/graph-1488.png", // You can generate an Open Graph image
        width: 1200,
        height: 630,
        alt: "Negromart - Marketplace",
      }
    ],
    locale: "en_US",
    type: "website",
  },
};


export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Draw under the iPhone home indicator; the bottom nav pads for it.
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${figtree.variable} ${mono.variable}`}>
      <body className="antialiased">
        <ThemeRegistry>
          <Provider>
            <Setup />
              <Toaster position="top-right" reverseOrder={false} />
              {children}
          </Provider>
        </ThemeRegistry>
      </body>
    </html>
  );
}