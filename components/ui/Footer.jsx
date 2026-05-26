import Link from 'next/link';

const SELLER_LINKS = [
  { label: 'Seller Center', href: '/' },
  { label: 'Developer Portal', href: '/developer-portal' },
  { label: 'Marketplace Learn', href: '/tutorials' },
  { label: 'Sell Better Blog', href: '/blog' },
];

const ABOUT_LINKS = [
  { label: 'Shop Negromart.com', href: 'https://www.negromart.com', external: true },
  { label: 'Negromart Inc.', href: 'https://corporate.negromart.com', external: true },
  { label: 'Careers', href: '/careers' },
  { label: 'The Negromart Digital Museum', href: '/museum' },
];

const SOCIALS = [
  // {
  //   label: 'LinkedIn',
  //   href: '#',
  //   icon: (
  //     <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
  //       <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
  //       <rect x="2" y="9" width="4" height="12"/>
  //       <circle cx="4" cy="4" r="2"/>
  //     </svg>
  //   ),
  // },
    {
    label: 'Instagram',
    href: 'https://www.instagram.com/negromart.llc/',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm0 2h10c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3zm10.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>
      </svg>
    ),
  },
  {
    label: 'Pinterest',
    href: 'https://www.pinterest.com/negromartt/?actingBusinessId=981151606227920657',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.084 2.438 7.596 5.938 9.156-.082-.777-.156-1.969.031-2.813.172-.75 1.11-4.781 1.11-4.781s-.282-.563-.282-1.406c0-1.313.766-2.297 1.719-2.297.812 0 1.203.609 1.203 1.344 0 .828-.531 2.063-.797 3.203-.234.953.484 1.734 1.422 1.734 1.703 0 3.016-1.797 3.016-4.391 0-2.297-1.641-3.906-4-3.906-2.719 0-4.313 2.047-4.313 4.156 0 .828.313 1.703.719 2.188a.29.29 0 0 1 .063.281c-.078.313-.25.953-.281 1.094-.047.172-.156.219-.344.125-1.281-.594-2.078-2.438-2.078-3.922 0-3.188 2.313-6.109 6.672-6.109 3.5 0 6.219 2.5 6.219 5.844 0 3.484-2.203 6.297-5.25 6.297-1.031 0-2-.531-2.328-1.141l-.641 2.438c-.234.891-.859 2-1.281 2.672.969.297 2 .453 3.078.453 5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@NEGROMART',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
        <polygon fill="var(--nm-navy)" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
      </svg>
    ),
  },
  {
    label: 'X / Twitter',
    href: 'https://x.com/Negromart_',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61583673413615',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="nm-footer">
      {/* Main columns */}
      <div className="nm-footer-main">
        {/* Brand */}
        <div className="nm-footer-brand">
          <div className="nm-footer-spark">
            <span className="nm-footer-spark-icon"> <img src="/logow.png" alt="Negromart white logo" width="32" height="32" /></span>
          </div>
          <p className="nm-footer-copy">© {year} Negromart. All rights reserved.</p>
        </div>

        {/* Seller resources */}
        <div>
          <p className="nm-footer-col-title">Seller resources</p>
          <ul className="nm-footer-links">
            {SELLER_LINKS.map((l) => (
              <li key={l.label}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Get to know us */}
        <div>
          <p className="nm-footer-col-title">Get to know us!</p>
          <ul className="nm-footer-links">
            {ABOUT_LINKS.map((l) => (
              <li key={l.label}>
                {l.external ? (
                  <a href={l.href} target="_blank" rel="noopener noreferrer">
                    {l.label}
                  </a>
                ) : (
                  <Link href={l.href}>{l.label}</Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <hr className="nm-footer-divider" />

      {/* Bottom bar */}
      <div className="nm-footer-bottom">
        <div className="nm-footer-legal">
          <a href="https://corporate.negromart.com/privacy-policy" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>
          <span className="nm-sep">|</span>
          <a href="https://corporate.negromart.com/terms-conditions" target="_blank" rel="noopener noreferrer">
            Terms &amp; Conditions
          </a>
          <span className="nm-sep">|</span>
          <a href="https://corporate.negromart.com/support" target="_blank" rel="noopener noreferrer">
            Contact Support
          </a>
        </div>

        <div className="nm-footer-socials">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              className="nm-social-btn"
              aria-label={s.label}
              target="_blank"
              rel="noopener noreferrer"
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
