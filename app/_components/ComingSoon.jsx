'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ComingSoon({ title, subtitle, description, icon, relatedLinks = [] }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  }

  return (
    <main>
      {/* Hero */}
      <section className="nm-cs-hero">
        <div className="nm-cs-glow" aria-hidden="true" />
        <div className="nm-cs-hero-inner">

          {/* Animated icon ring */}
          <div className="nm-cs-icon-ring" aria-hidden="true">
            <div className="nm-cs-icon-ring-outer" />
            <div className="nm-cs-icon-ring-inner" />
            <div className="nm-cs-icon-wrap">{icon}</div>
          </div>

          <span className="nm-cs-badge">Coming Soon</span>
          <h1 className="nm-cs-title">{title}</h1>
          {subtitle && <p className="nm-cs-subtitle">{subtitle}</p>}
          {description && <p className="nm-cs-desc">{description}</p>}

          {/* Notify form */}
          <div className="nm-cs-notify">
            <p className="nm-cs-notify-label">Be the first to know when we launch</p>
            {submitted ? (
              <div className="nm-cs-notify-success">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--nm-yellow)" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                You're on the list! We'll notify you at launch.
              </div>
            ) : (
              <form className="nm-cs-notify-form" onSubmit={handleSubmit}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="nm-cs-notify-input"
                />
                <button type="submit" className="nm-cs-notify-btn">Notify Me</button>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* Progress bar section */}
      <section className="nm-cs-progress-section">
        <div className="nm-cs-progress-inner">
          <p className="nm-cs-progress-label">Development progress</p>
          <div className="nm-cs-progress-track">
            <div className="nm-cs-progress-fill" />
          </div>
          <p className="nm-cs-progress-note">We're building something great. Stay tuned.</p>
        </div>
      </section>

      {/* Related links */}
      {relatedLinks.length > 0 && (
        <section className="nm-cs-related">
          <div className="nm-cs-related-inner">
            <p className="nm-cs-related-heading">While you wait, explore these</p>
            <div className="nm-cs-related-grid">
              {relatedLinks.map((link) => (
                <Link key={link.href} href={link.href} className="nm-cs-related-card">
                  <div className="nm-cs-related-card-icon">{link.icon}</div>
                  <div>
                    <div className="nm-cs-related-card-title">{link.label}</div>
                    <div className="nm-cs-related-card-desc">{link.desc}</div>
                  </div>
                  <svg className="nm-cs-related-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back home CTA */}
      <section className="nm-cs-footer-cta">
        <Link href="/" className="nm-cs-back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Negromart Marketplace
        </Link>
      </section>
    </main>
  );
}
