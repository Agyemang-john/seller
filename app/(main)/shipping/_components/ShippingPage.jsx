import Link from 'next/link';

const SHIPPING_OPTIONS = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="3" width="15" height="13" rx="1"/>
        <path d="M16 8h4l3 3v5h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    title: 'Standard Shipping',
    desc: 'Affordable domestic delivery within 3–7 business days. Great for non-urgent orders across Ghana and Nigeria.',
    badge: 'Most Popular',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
    title: 'Express Shipping',
    desc: 'Fast 1–2 business day delivery for time-sensitive orders. Available in major cities across Ghana and Nigeria.',
    badge: 'Fastest',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    title: 'International Shipping',
    desc: 'Reach diaspora buyers in the UK, US, Canada and Europe. Competitive rates with full tracking and customs support.',
    badge: 'Global Reach',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    title: 'Free Shipping',
    desc: 'Offer free shipping on qualifying orders to boost conversion rates. Set your own minimum order threshold.',
    badge: 'Buyer Favourite',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'List your product',
    desc: 'Add your product with weight, dimensions and shipping zones. We calculate the right rate automatically.',
  },
  {
    step: '02',
    title: 'Buyer places order',
    desc: 'The buyer chooses their preferred shipping option at checkout. You get notified instantly.',
  },
  {
    step: '03',
    title: 'Print your label',
    desc: 'Generate a pre-paid shipping label directly from your dashboard with one click.',
  },
  {
    step: '04',
    title: 'Drop off or schedule pickup',
    desc: 'Drop your parcel at a partner location or schedule a courier pickup — whichever suits you.',
  },
  {
    step: '05',
    title: 'Buyer tracks delivery',
    desc: 'Real-time tracking is automatically shared with the buyer, reducing support queries.',
  },
];

const FAQS = [
  {
    q: 'Which couriers does Negromart partner with?',
    a: 'We work with leading couriers in Ghana and Nigeria including GIG Logistics, DHL, and Jumia Logistics, as well as international carriers for cross-border shipments.',
  },
  {
    q: 'Can I set different shipping rates for different products?',
    a: 'Yes. You can configure shipping rates per product, per weight category, or apply store-wide flat rates and free shipping thresholds.',
  },
  {
    q: 'What happens if a shipment is lost or damaged?',
    a: 'All orders shipped through Negromart\'s integrated couriers are covered by our seller protection policy. File a claim in your dashboard within 7 days of the expected delivery date.',
  },
  {
    q: 'Do I need to print labels or can I handwrite them?',
    a: 'We strongly recommend using our system-generated labels for accurate tracking. Handwritten labels may cause delays and void shipment protection.',
  },
  {
    q: 'Can I ship internationally as a new seller?',
    a: 'Yes, international shipping is available to all verified sellers. You\'ll need to complete identity verification and agree to our cross-border shipping terms.',
  },
];

function FaqItem({ q, a }) {
  return (
    <div className="nm-info-faq-item">
      <div className="nm-info-faq-q">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--nm-blue)" style={{ flexShrink: 0, marginTop: 2 }}>
          <path d="M9 18l6-6-6-6" fill="none" stroke="var(--nm-blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {q}
      </div>
      <p className="nm-info-faq-a">{a}</p>
    </div>
  );
}

export default function ShippingPage() {
  return (
    <main>
      {/* Hero */}
      <section className="nm-info-hero">
        <div className="nm-info-hero-inner">
          <span className="nm-info-eyebrow">Shipping Solutions</span>
          <h1 className="nm-info-hero-title">Ship smarter, sell more</h1>
          <p className="nm-info-hero-subtitle">
            Flexible shipping options, pre-paid labels, real-time tracking and competitive rates —
            everything you need to delight buyers and grow your Negromart store.
          </p>
          <div className="nm-info-hero-actions">
            <Link href="/register" className="nm-cta-btn">Start Selling</Link>
            <Link href="/tutorials" className="nm-reg-hero-btn-outline">Watch Tutorials</Link>
          </div>
        </div>
      </section>

      {/* Shipping options */}
      <section className="nm-info-section nm-info-section-light">
        <div className="nm-info-inner">
          <div className="nm-info-header">
            <span className="nm-info-section-eyebrow">Options</span>
            <h2 className="nm-info-section-title">Choose the shipping method that fits your business</h2>
          </div>
          <div className="nm-info-grid-4">
            {SHIPPING_OPTIONS.map((opt) => (
              <div key={opt.title} className="nm-info-card">
                <div className="nm-info-card-icon">{opt.icon}</div>
                {opt.badge && <span className="nm-info-card-badge">{opt.badge}</span>}
                <h3 className="nm-info-card-title">{opt.title}</h3>
                <p className="nm-info-card-desc">{opt.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="nm-info-section nm-info-section-dark">
        <div className="nm-info-inner">
          <div className="nm-info-header nm-info-header-white">
            <span className="nm-info-section-eyebrow nm-info-eyebrow-yellow">How it works</span>
            <h2 className="nm-info-section-title nm-info-title-white">From listing to doorstep in 5 steps</h2>
          </div>
          <div className="nm-info-steps">
            {HOW_IT_WORKS.map((step, i) => (
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

      {/* Stats banner */}
      <section className="nm-info-stats-banner">
        <div className="nm-info-inner">
          <div className="nm-info-stats-row">
            {[
              { num: '2 Countries', label: 'Active shipping markets' },
              { num: '3+', label: 'Courier partners' },
              { num: '98%', label: 'On-time delivery rate' },
              { num: '1-click', label: 'Label generation' },
            ].map((s) => (
              <div key={s.label} className="nm-info-stat-box">
                <div className="nm-info-stat-num">{s.num}</div>
                <div className="nm-info-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="nm-info-section nm-info-section-light">
        <div className="nm-info-inner nm-info-inner-narrow">
          <div className="nm-info-header">
            <span className="nm-info-section-eyebrow">FAQ</span>
            <h2 className="nm-info-section-title">Frequently asked questions</h2>
          </div>
          <div className="nm-info-faq">
            {FAQS.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="nm-info-cta">
        <h2 className="nm-info-cta-title">Ready to start shipping with Negromart?</h2>
        <p className="nm-info-cta-sub">Join thousands of sellers already growing their business across Africa and the diaspora.</p>
        <Link href="/register" className="nm-cta-btn">Join Marketplace</Link>
      </section>
    </main>
  );
}
