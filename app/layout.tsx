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
  title: "Seller - Negromart | Buy Black, Build Black Wealth",
  description: "Negromart is a Pan-African marketplace where Black-owned businesses connect with buyers worldwide. Shop authentic African products and support Black entrepreneurship.",
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
    title: "Negromart | Buy Black, Build Black Wealth",
    description: "Negromart is a Pan-African marketplace where Black-owned businesses connect with buyers worldwide. Shop authentic African products and support Black entrepreneurship.",
    url: "https://www.negromart.com", // change to your actual domain
    siteName: "Negromart",
    images: [
      {
        url: "/favicon.png", // You can generate an Open Graph image
        width: 1200,
        height: 630,
        alt: "Negromart - Pan-African Marketplace",
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