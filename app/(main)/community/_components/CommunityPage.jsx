import Link from 'next/link';

const COMMUNITY_FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: 'Seller Forums',
    desc: 'Post questions, share advice and exchange strategies with thousands of active Negromart sellers across Africa and the diaspora.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: 'Live Q&A Sessions',
    desc: 'Join weekly live sessions hosted by Negromart experts and top sellers. Ask real questions and get real answers in real time.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    title: 'Seller Spotlights',
    desc: 'Get featured in our monthly seller spotlight. Share your story, grow your brand visibility and inspire others in the community.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
    title: 'Resource Library',
    desc: 'Access downloadable guides, templates, checklists and playbooks curated by Negromart\'s seller success team.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    title: 'Regional Groups',
    desc: 'Connect with sellers in your country or region — Ghana, Nigeria, diaspora groups in the UK, US, Canada and more.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
    title: 'Expert Mentorship',
    desc: 'Get matched with a verified Negromart power seller who can guide you through your first months on the platform.',
  },
];

const TESTIMONIALS = [
  {
    quote: "The seller community answered my shipping question in under 10 minutes. I couldn't believe how helpful everyone was.",
    name: 'Elvis T.',
    location: 'Kumasi, Ghana',
    initials: 'ET',
  },
  {
    quote: "I joined a regional group for UK-based sellers and found my best customers through connections I made there.",
    name: 'Dennis A.',
    location: 'London, UK',
    initials: 'DA',
  },
  {
    quote: "The weekly Q&A sessions taught me more in one hour than I learned in months of trial and error on my own.",
    name: 'Fatima B.',
    location: 'Accra, Ghana',
    initials: 'FB',
  },
];

function TestimonialCard({ quote, name, location, initials }) {
  return (
    <div className="nm-community-testimonial">
      <div className="nm-community-testimonial-quote">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--nm-yellow)" style={{ opacity: 0.7 }}>
          <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
          <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
        </svg>
        <p>{quote}</p>
      </div>
      <div className="nm-community-testimonial-author">
        <div className="nm-community-avatar">{initials}</div>
        <div>
          <div className="nm-community-author-name">{name}</div>
          <div className="nm-community-author-loc">{location}</div>
        </div>
      </div>
    </div>
  );
}

export default function CommunityPage() {
  return (
    <main>
      {/* Hero */}
      <section className="nm-info-hero">
        <div className="nm-info-hero-inner">
          <span className="nm-info-eyebrow">Seller Community</span>
          <h1 className="nm-info-hero-title">You're not selling alone</h1>
          <p className="nm-info-hero-subtitle">
            Join thousands of Negromart sellers connecting, learning and growing together.
            Our community is your shortcut to success.
          </p>
          <div className="nm-info-hero-actions">
            <Link href="/register" className="nm-cta-btn">Join the Community</Link>
            <Link href="/tutorials" className="nm-reg-hero-btn-outline">Explore Tutorials</Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="nm-info-stats-banner">
        <div className="nm-info-inner">
          <div className="nm-info-stats-row">
            {[
              { num: '1,000+', label: 'Active sellers' },
              { num: '2', label: 'Active markets' },
              { num: 'Weekly', label: 'Live Q&A sessions' },
              { num: 'Free', label: 'Forever for sellers' },
            ].map((s) => (
              <div key={s.label} className="nm-info-stat-box">
                <div className="nm-info-stat-num">{s.num}</div>
                <div className="nm-info-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="nm-info-section nm-info-section-light">
        <div className="nm-info-inner">
          <div className="nm-info-header">
            <span className="nm-info-section-eyebrow">What's included</span>
            <h2 className="nm-info-section-title">Everything you need to connect and grow</h2>
          </div>
          <div className="nm-info-grid-3">
            {COMMUNITY_FEATURES.map((f) => (
              <div key={f.title} className="nm-info-card">
                <div className="nm-info-card-icon">{f.icon}</div>
                <h3 className="nm-info-card-title">{f.title}</h3>
                <p className="nm-info-card-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="nm-info-section nm-info-section-dark">
        <div className="nm-info-inner">
          <div className="nm-info-header nm-info-header-white">
            <span className="nm-info-section-eyebrow nm-info-eyebrow-yellow">Seller Voices</span>
            <h2 className="nm-info-section-title nm-info-title-white">Hear from our community</h2>
          </div>
          <div className="nm-community-testimonials-grid">
            {TESTIMONIALS.map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="nm-info-cta">
        <h2 className="nm-info-cta-title">Ready to join the conversation?</h2>
        <p className="nm-info-cta-sub">
          Create your seller account today and instantly get access to the Negromart seller community.
        </p>
        <Link href="/register" className="nm-cta-btn">Join Marketplace</Link>
      </section>
    </main>
  );
}
