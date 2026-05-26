import ComingSoon from '@/app/_components/ComingSoon';

export const metadata = {
  title: 'The Negromart Digital Museum | Negromart',
  description: 'Celebrating African heritage, culture and creativity through digital art and storytelling. Coming soon.',
};

const ICON = (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <line x1="2" y1="22" x2="22" y2="22"/>
    <path d="M3 22V11l7-7 7 7v11"/>
    <path d="M9 22v-7h6v7"/>
    <path d="M2 11l10-9 10 9"/>
  </svg>
);

const RELATED = [
  {
    href: '/community',
    label: 'Seller Community',
    desc: 'Connect with culturally-rooted African sellers.',
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
    desc: 'Stories celebrating African commerce and culture.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    ),
  },
  {
    href: 'https://www.negromart.com',
    label: 'Shop Negromart.com',
    desc: 'Discover unique products from African creators.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
  },
];

export default function Page() {
  return (
    <ComingSoon
      title="The Negromart Digital Museum"
      subtitle="Celebrating African heritage, culture and creativity."
      description="A digital space dedicated to the rich history, art and stories of the African diaspora. Featuring curated exhibitions, artist spotlights and cultural narratives that connect our global community."
      icon={ICON}
      relatedLinks={RELATED}
    />
  );
}
