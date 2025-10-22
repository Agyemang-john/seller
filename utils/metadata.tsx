import { Metadata } from "next";

// Reusable metadata generator
export const generateMetadata = (pageTitle: string, pageDescription: string): Metadata => {
  const siteName = "Negromart";
  const defaultTitle = `${siteName} | Wherever You Are, Sell With Ease`;
  const defaultDescription =
    "Connecting you to global buyers. Sell millions of affordable products from around the world on NegroMart";

  return {
    title: pageTitle ? `${pageTitle} | ${siteName}` : defaultTitle,
    description: pageDescription || defaultDescription,
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
    },
    keywords: [
      "Negromart",
      "Buy Black",
      "Black-owned business",
      "African marketplace",
      "Pan-African commerce",
      "African products",
      "Online shopping",
      "Support Black entrepreneurs",
      "Black wealth",
      "African culture",
    ],
    openGraph: {
      title: pageTitle ? `${pageTitle} | ${siteName}` : defaultTitle,
      description: pageDescription || defaultDescription,
      url: "https://www.negromart.com",
      siteName: siteName,
      images: [
        {
          url: "/favicon.png",
          width: 1200,
          height: 630,
          alt: "Negromart - Marketplace",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle ? `${pageTitle} | ${siteName}` : defaultTitle,
      description: pageDescription || defaultDescription,
      images: ["/favicon.png"],
      site: "@Negromart",
    },
  };
};
