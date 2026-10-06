// app/layout.tsx

import React from "react";
import type { Metadata } from "next";
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