// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Provider from '@/redux/provider';
import { Setup } from '@/utils';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://seller.negromart.com'),
  title: "Seller | Wherever You Are, Sell With Ease",
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
    icon: "/favicon-new.ico",
  },
  openGraph: {
    title: "Seller | Wherever You Are, Sell With Ease",
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
    <html lang="en">
      <head>
        <meta name="msvalidate.01" content="5DA71870689BE44E8BBAC87A7BF7461A" />
        
        {/* Bing */}
        <meta name="msvalidate.01" content="C0B1BE8D62E65099CC0EC26BC04B076E" />
        <link rel="icon" href="/favicon-new.ico" sizes="any" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Provider>
          <Setup />
            {children}
        </Provider>
      </body>
    </html>
  );
}