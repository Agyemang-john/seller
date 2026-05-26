import ComingSoon from '@/app/_components/ComingSoon';

export const metadata = {
  title: 'Advertising Tools | Negromart Marketplace',
  description: 'Sponsored listings, banner ads and promoted products for Negromart sellers. Coming soon.',
};

const ICON = (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>
);

const RELATED = [
  {
    href: '/community',
    label: 'Seller Community',
    desc: 'Learn marketing strategies from top sellers.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    href: '/blog',
    label: 'Sell Better Blog',
    desc: 'Growth tips and marketing advice for sellers.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/store-analytics',
    label: 'Analytics Dashboard',
    desc: 'Track your store performance right now.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
];

export default function Page() {
  return (
    <ComingSoon
      title="Advertising Tools"
      subtitle="Put your products in front of more buyers."
      description="Negromart Advertising will give sellers access to sponsored product listings, homepage banner placements and promoted search results — all managed from a simple self-serve dashboard with real-time spend tracking."
      icon={ICON}
      relatedLinks={RELATED}
    />
  );
}
