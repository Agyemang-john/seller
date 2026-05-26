import ComingSoon from '@/app/_components/ComingSoon';

export const metadata = {
  title: 'Shipping API | Negromart Marketplace',
  description: 'Integrate Negromart shipping directly into your own systems with our Shipping API. Coming soon.',
};

const ICON = (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="16 18 22 12 16 6"/>
    <polyline points="8 6 2 12 8 18"/>
    <line x1="12" y1="2" x2="12" y2="22"/>
  </svg>
);

const RELATED = [
  {
    href: '/developer-portal',
    label: 'Developer Portal',
    desc: 'Full API documentation and developer tools.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
  },
  {
    href: '/shipping',
    label: 'Shipping Solutions',
    desc: 'Explore our manual shipping tools available today.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="3" width="15" height="13" rx="1"/>
        <path d="M16 8h4l3 3v5h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
  },
  {
    href: '/tutorials',
    label: 'Seller Tutorials',
    desc: 'Step-by-step videos to master the platform.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="23 7 16 12 23 17 23 7"/>
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
      </svg>
    ),
  },
];

export default function Page() {
  return (
    <ComingSoon
      title="Shipping API"
      subtitle="Integrate Negromart shipping directly into your systems."
      description="Our Shipping API will let developers connect their own platforms, ERPs and fulfilment software to Negromart's carrier network — with rate-shopping, label generation and tracking in one REST API."
      icon={ICON}
      relatedLinks={RELATED}
    />
  );
}
