import Link from 'next/link';

const POLICY_POINTS = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'Seller Protection',
    desc: 'Our returns policy is built to be fair. Fraudulent return claims are flagged automatically and investigated before any charge is applied to your account.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: '7-Day Return Window',
    desc: 'Buyers have 7 days from delivery to request a return. After the window closes, no return requests can be opened for that order.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    title: 'Fast Refund Processing',
    desc: 'Once a return is accepted and the item confirmed, refunds are processed within 2–3 business days directly to the buyer\'s original payment method.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    title: 'Return Shipping Labels',
    desc: 'Generate a pre-paid return shipping label from your dashboard for the buyer. The return shipping cost is deducted from the refund amount.',
  },
];

const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Buyer submits a return request',
    desc: 'The buyer opens a return request in their order history, selects a reason and uploads photos if the item is damaged or incorrect.',
  },
  {
    step: '02',
    title: 'You review the request',
    desc: 'You have 48 hours to review the request in your dashboard. You can approve, decline with a reason, or escalate to Negromart Support.',
  },
  {
    step: '03',
    title: 'Generate a return label',
    desc: 'Once approved, generate a prepaid return shipping label directly from your dashboard. The buyer prints and attaches it.',
  },
  {
    step: '04',
    title: 'Receive and inspect the item',
    desc: 'Once the returned item arrives, inspect its condition and confirm receipt in your dashboard within 2 business days.',
  },
  {
    step: '05',
    title: 'Refund is issued',
    desc: 'The refund is automatically processed to the buyer and your payout is adjusted. A full report is logged in your order history.',
  },
];

const TIPS = [
  'Write detailed, accurate product descriptions to reduce "not as described" returns.',
  'Include clear size charts and measurements for clothing and accessories.',
  'Use high-quality photos showing all angles, including any flaws or variations.',
  'Pack items securely — damage in transit is still the seller\'s responsibility.',
  'Respond to return requests within 24 hours to maintain your seller rating.',
];

export default function ReturnsPage() {
  return (
    <main>
      {/* Hero */}
      <section className="nm-info-hero">
        <div className="nm-info-hero-inner">
          <span className="nm-info-eyebrow">Returns Management</span>
          <h1 className="nm-info-hero-title">Returns made simple and fair</h1>
          <p className="nm-info-hero-subtitle">
            Our returns process is designed to protect sellers while keeping buyers confident.
            Handle every return with one click from your dashboard.
          </p>
          <div className="nm-info-hero-actions">
            <Link href="/register" className="nm-cta-btn">Start Selling</Link>
            <Link href="/tutorials" className="nm-reg-hero-btn-outline">Watch Tutorials</Link>
          </div>
        </div>
      </section>

      {/* Policy highlights */}
      <section className="nm-info-section nm-info-section-light">
        <div className="nm-info-inner">
          <div className="nm-info-header">
            <span className="nm-info-section-eyebrow">Policy</span>
            <h2 className="nm-info-section-title">What you need to know about our returns policy</h2>
          </div>
          <div className="nm-info-grid-4">
            {POLICY_POINTS.map((p) => (
              <div key={p.title} className="nm-info-card">
                <div className="nm-info-card-icon">{p.icon}</div>
                <h3 className="nm-info-card-title">{p.title}</h3>
                <p className="nm-info-card-desc">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="nm-info-section nm-info-section-dark">
        <div className="nm-info-inner">
          <div className="nm-info-header nm-info-header-white">
            <span className="nm-info-section-eyebrow nm-info-eyebrow-yellow">The Process</span>
            <h2 className="nm-info-section-title nm-info-title-white">How returns work, step by step</h2>
          </div>
          <div className="nm-info-steps">
            {PROCESS_STEPS.map((step, i) => (
              <div key={i} className="nm-info-step">
                <div className="nm-info-step-num">{step.step}</div>
                <div className="nm-info-step-body">
                  <h3 className="nm-info-step-title">{step.title}</h3>
                  <p className="nm-info-step-desc">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips to reduce returns */}
      <section className="nm-info-section nm-info-section-white">
        <div className="nm-info-inner nm-info-inner-narrow">
          <div className="nm-info-header">
            <span className="nm-info-section-eyebrow">Pro Tips</span>
            <h2 className="nm-info-section-title">How to reduce returns before they happen</h2>
            <p className="nm-info-section-sub">
              The best return is the one that never happens. Follow these seller best practices.
            </p>
          </div>
          <ul className="nm-info-tips-list">
            {TIPS.map((tip, i) => (
              <li key={i} className="nm-info-tip-item">
                <div className="nm-info-tip-check">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--nm-blue)" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="nm-info-cta">
        <h2 className="nm-info-cta-title">Manage your returns with confidence</h2>
        <p className="nm-info-cta-sub">
          Join Negromart Marketplace and access full returns management tools from day one.
        </p>
        <Link href="/register" className="nm-cta-btn">Join Marketplace</Link>
      </section>
    </main>
  );
}
