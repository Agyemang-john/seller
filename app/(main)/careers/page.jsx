import ComingSoon from '@/app/_components/ComingSoon';

export const metadata = {
  title: 'Careers | Negromart',
  description: 'Join the Negromart team and help build the leading African e-commerce marketplace. View open roles. Coming soon.',
};

const ICON = (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);

const RELATED = [
  {
    href: 'https://corporate.negromart.com',
    label: 'Negromart Inc.',
    desc: 'Learn about our company and mission.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
  },
  {
    href: '/community',
    label: 'Seller Community',
    desc: 'Connect with the Negromart ecosystem.',
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
    desc: 'Stories and insights from our team.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    ),
  },
];

export default function Page() {
  return (
    <ComingSoon
      title="Careers at Negromart"
      subtitle="Help us build Africa's most trusted marketplace."
      description="We're a growing team passionate about Pan-African commerce. Our careers page with open roles across engineering, product, operations, marketing and seller success is on its way."
      icon={ICON}
      relatedLinks={RELATED}
    />
  );
}
