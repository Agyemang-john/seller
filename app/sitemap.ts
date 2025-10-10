import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const now = new Date().toISOString();

  try {


    // 🧭 Static pages (these never or rarely change)
    const staticUrls: MetadataRoute.Sitemap = [
      { url: `${baseUrl}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
      { url: `${baseUrl}/register`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    //   { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    //   { url: `${baseUrl}/help`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    //   { url: `${baseUrl}/privacy-policy`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    //   { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    ];

    
    // Combine all URLs together
    return [...staticUrls];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return [];
  }
}
