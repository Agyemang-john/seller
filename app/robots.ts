import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/auth/*',
          '/payment/',
          '/profile/',
          '/payouts/',
          '/orders/',
          '/reviews/',
          '/working-hours/',
          '/help/',
          '/logout/',
          '/register/*',
        ],
      },
    ],
    sitemap: 'https://seller.negromart.com/sitemap.xml',
    // host: 'https://seller.negromart.com',
  };
}
