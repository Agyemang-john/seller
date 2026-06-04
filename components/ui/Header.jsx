'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/redux/hooks';
const NAV_ITEMS = [
  {
    label: 'Launch',
    links: [
      { label: 'How to Apply', href: '/register' },
      { label: 'Getting Started', href: '/register' },
      { label: 'Seller Eligibility', href: '/register' },
      { label: 'Pricing & Fees', href: '/billing' },
    ],
  },
  {
    label: 'Ship',
    links: [
      { label: 'Shipping Solutions', href: '/shipping' },
      { label: 'Fulfillment Services', href: '/fulfillment' },
      { label: 'Returns Management', href: '/returns' },
      { label: 'Shipping API', href: '/shipping-api' },
    ],
  },
  {
    label: 'Grow',
    links: [
      { label: 'Advertising Tools', href: '/advertising' },
      { label: 'Analytics Dashboard', href: '/store-analytics' },
      { label: 'Promotions', href: '/dashboard' },
      { label: 'Brand Management', href: '/community' },
    ],
  },
];

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAppSelector(state => state.auth);

  return (
    <>
      <header className="nm-header">
        <nav className="nm-nav">
          {/* Logo */}
          <Link href="/" className="nm-logo">
            <span className="nm-logo-brand">Negromart</span>
            <span className="nm-logo-suffix">Marketplace</span>
          </Link>

          {/* Desktop nav links */}
          <div className="nm-nav-links">
            {NAV_ITEMS.map((item) => (
              <div key={item.label} className="nm-nav-item">
                <button className="nm-nav-trigger">
                  {item.label}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 10l5 5 5-5z" />
                  </svg>
                </button>
                <div className="nm-dropdown">
                  {item.links.map((l) => (
                    <Link key={l.label} href={l.href}>{l.label}</Link>
                  ))}
                </div>
              </div>
            ))}
            <Link href="/blog" className="nm-nav-plain">Sell Better Blog</Link>
            <Link href="/tutorials" className="nm-nav-plain">Marketplace Learn</Link>
          </div>

          {/* Desktop CTAs — hidden on mobile */}
          {!isLoading && (
            <div className="nm-header-cta">
              {isAuthenticated ? (
                <Link href="/dashboard" className="nm-join-btn nm-join-btn-dashboard">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className="nm-signin-btn">Sign In</Link>
                  <Link href="/register" className="nm-join-btn">Join Marketplace</Link>
                </>
              )}
            </div>
          )}

          {/* Mobile: hamburger only — visible on mobile */}
          <button
            className="nm-mobile-menu-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>
        </nav>
      </header>

      {/* Mobile overlay */}
      <div
        className={`nm-overlay${drawerOpen ? ' nm-open' : ''}`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Mobile drawer */}
      <div className={`nm-mobile-drawer${drawerOpen ? ' nm-open' : ''}`}>

        {/* Drawer header row: close button */}
        <div className="nm-drawer-header">
          <button
            className="nm-mobile-close"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>

        {/* Auth CTA — top of drawer, most prominent */}
        {!isLoading && (
          <div className="nm-drawer-auth">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="nm-drawer-cta nm-drawer-cta--dashboard"
                onClick={() => setDrawerOpen(false)}
              >
                <span className="nm-online-dot" />
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="nm-drawer-cta nm-drawer-cta--outline"
                  onClick={() => setDrawerOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="nm-drawer-cta nm-drawer-cta--primary"
                  onClick={() => setDrawerOpen(false)}
                >
                  Join Marketplace
                </Link>
              </>
            )}
          </div>
        )}

        {/* Nav links */}
        <div className="nm-mobile-nav">
          {NAV_ITEMS.map((item) =>
            item.links.map((l) => (
              <Link key={l.label} href={l.href} onClick={() => setDrawerOpen(false)}>
                {item.label}: {l.label}
              </Link>
            ))
          )}
          <Link href="/blog" onClick={() => setDrawerOpen(false)}>Sell Better Blog</Link>
          <Link href="/tutorials" onClick={() => setDrawerOpen(false)}>Marketplace Learn</Link>
        </div>
      </div>
    </>
  );
}
