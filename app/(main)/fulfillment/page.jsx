import ComingSoon from '@/app/_components/ComingSoon';

export const metadata = {
  title: 'Fulfillment Services | Negromart Marketplace',
  description: 'Negromart Fulfillment Services — store, pack and ship your products from our warehouses. Coming soon.',
};

const ICON = (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M21 10V6a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 2 6v12a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/>
    <path d="M16.5 9.4 7.55 4.24"/>
    <polyline points="3.29 7 12 12 20.71 7"/>
    <line x1="12" y1="22" x2="12" y2="12"/>
    <circle cx="18.5" cy="15.5" r="2.5"/>
    <path d="M20.27 17.27 22 19"/>
  </svg>
);

const RELATED = [
  {
    href: '/shipping',
    label: 'Shipping Solutions',
    desc: 'Set up your own shipping rates and labels today.',
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
    href: '/returns',
    label: 'Returns Management',
    desc: 'Handle returns seamlessly from your dashboard.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="1 4 1 10 7 10"/>
        <path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
      </svg>
    ),
  },
  {
    href: '/tutorials',
    label: 'Seller Tutorials',
    desc: 'Learn shipping and fulfilment best practices.',
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
      title="Fulfillment Services"
      subtitle="Store, pack and ship — all handled by Negromart."
      description="Our fulfillment centres will let you store inventory with us. When an order comes in, we pick, pack and ship on your behalf — so you can focus on growing your business."
      icon={ICON}
      relatedLinks={RELATED}
    />
  );
}
