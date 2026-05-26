import ComingSoon from '@/app/_components/ComingSoon';

export const metadata = {
  title: 'Developer Portal | Negromart Marketplace',
  description: 'API documentation, SDKs and developer tools for building on the Negromart Marketplace platform. Coming soon.',
};

const ICON = (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
    <polyline points="7 8 3 12 7 16" style={{strokeWidth: 1.8}}/>
    <polyline points="11 8 15 12 11 16" style={{strokeWidth: 1.8}}/>
  </svg>
);

const RELATED = [
  {
    href: '/shipping-api',
    label: 'Shipping API',
    desc: 'Integrate Negromart shipping into your systems.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="16 18 22 12 16 6"/>
        <polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
  },
  {
    href: '/tutorials',
    label: 'Seller Tutorials',
    desc: 'Get started with our platform guides.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="23 7 16 12 23 17 23 7"/>
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
      </svg>
    ),
  },
  {
    href: '/community',
    label: 'Seller Community',
    desc: 'Connect with other builders and sellers.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
];

export default function Page() {
  return (
    <ComingSoon
      title="Developer Portal"
      subtitle="Build on the Negromart Marketplace platform."
      description="Our Developer Portal will provide full REST API documentation, webhooks, SDKs in multiple languages, a sandbox environment, and an app marketplace — everything you need to integrate your systems with Negromart."
      icon={ICON}
      relatedLinks={RELATED}
    />
  );
}
