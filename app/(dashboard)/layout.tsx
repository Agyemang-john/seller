import { Metadata } from 'next';
import ClientProviders from "@/hooks/ClientProviders";

// Generate dynamic metadata with current date for freshness
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://seller.negromart.com'),
  title: {
    default: 'Negromart Seller Dashboard - Negromart',
    template: '%s | Negromart Seller Dashboard', // For nested pages, e.g., "Orders | Ecommerce Seller Dashboard"
  },
  description: 'Connecting you to global buyers. Sell millions of affordable products from around the world on NegroMart',
  keywords: 'negromart seller dashboard, sales analytics',
  authors: [{ name: 'Negromart' }], // Customize with your brand
  creator: 'Negromart',
  publisher: 'Negromart',
  // Open Graph for social sharing (e.g., LinkedIn, Twitter)
  openGraph: {
    title: 'Negromart Seller Dashboard - Drive Sales Growth',
    description: 'Connecting you to global buyers. Sell millions of affordable products from around the world on NegroMart',
    url: 'https://seller.negromart.com/dashboard', // Replace with your actual domain
    siteName: 'Negromart',
    images: [
      {
        url: 'https://seller.negromart.com/favicon.jpg', // Add a dashboard screenshot image
        width: 1200,
        height: 630,
        alt: 'Ecommerce Seller Dashboard Overview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  // Twitter Card for X/Twitter sharing
  twitter: {
    card: 'summary_large_image',
    title: 'Seller Dashboard - Negromart',
    description: 'Connecting you to global buyers. Sell millions of affordable products from around the world on NegroMart',
    images: ['https://negromart.com/favicon.png'], // Optional: Separate image for Twitter
    creator: '@negromart.llc', // Replace with your X handle
  },
  // Additional for robots/search engines
  robots: {
    index: true, // Set to false if dashboard is private
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // Icons for browser tab/favicon (if not defined globally)
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <ClientProviders>{children}</ClientProviders>;
}