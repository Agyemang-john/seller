'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

/* ── HERO CAROUSEL DATA ─────────────────────────────────── */
const SLIDES = [
  {
    title: "Let's grow together!",
    subtitle:
      'Get up to USD100 in new-seller savings when you sign up to sell on Negromart Marketplace.',
    btnLabel: 'Learn more',
    btnHref: '/register',
    note: '*Conditions apply.',
  },
  {
    title: 'Build your brand globally.',
    subtitle:
      'Connect with millions of buyers across Africa and the diaspora through the Negromart Marketplace platform.',
    btnLabel: 'Get started',
    btnHref: '/register',
    note: null,
  },
  {
    title: 'Scale your business faster.',
    subtitle:
      'Access powerful tools for catalog management, shipping, returns, and brand growth — all in one place.',
    btnLabel: 'Discover tools',
    btnHref: '#programs',
    note: null,
  },
];

/* ── STATS DATA ─────────────────────────────────────────── */
const STATS = [
  {
    number: '1000 +',
    desc: 'Customers and members across Africa and the diaspora shop on Negromart online each week.',
    note: '*Negromart first-party data, 2026',
    link: null,
  },
  {
    number: '45%',
    desc: 'Year-on-year growth in Negromart Marketplace seller revenue.',
    note: '*Negromart FY24 earnings',
    link: null,
  },
  {
    number: 'Zero',
    desc: 'Monthly or set-up fees — only pay for what you sell with our',
    note: null,
    link: { label: 'competitive referral rates', href: '/register' },
  },
  {
    number: '2 markets',
    desc: 'Tap into any, or all, of our markets: Ghana, Nigeria, and more on the way.',
    note: null,
    link: null,
  },
];

/* ── PROGRAMS DATA ──────────────────────────────────────── */
const PROGRAMS = [
  {
    title: 'Stay ahead with our Blog',
    desc: 'Get the latest Marketplace news, seller tips, and product launch updates on our blog.',
    href: '/blog',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
  {
    title: 'Learn with Video Tutorials',
    desc: 'Access step-by-step video tutorials on our learning platform to master selling on Negromart.',
    href: '/tutorials',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="23 7 16 12 23 17 23 7"/>
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
      </svg>
    ),
  },
  {
    title: 'Community Support',
    desc: "Join our growing community of sellers and connect with experts who can answer your questions.",
    href: '/community',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
];

/* ── HERO CAROUSEL COMPONENT ────────────────────────────── */
function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  const goTo = useCallback((idx) => {
    setCurrent((idx + SLIDES.length) % SLIDES.length);
  }, []);

  const restart = useCallback(
    (idx) => {
      clearInterval(timerRef.current);
      goTo(idx);
      timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % SLIDES.length), 5500);
    },
    [goTo],
  );

  useEffect(() => {
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % SLIDES.length), 5500);
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <section className="nm-hero" aria-label="Hero carousel">
      {/*
        Single landscape background video shared by all slides.
        Put your video file at:  public/video/hero-bg.mp4
        Optionally add a poster image at: public/video/hero-bg-poster.jpg
      */}
      <video
        className="nm-hero-video"
        autoPlay
        muted
        loop
        playsInline
        poster="/video/warehouse1.mp4"
        aria-hidden="true"
      >
        <source src="/video/warehouse1.mp4" type="video/mp4" />
        <source src="/video/warehouse1.mp4" type="video/mp4" />
      </video>

      {/* Dark navy overlay on top of video */}
      <div className="nm-hero-overlay" aria-hidden="true" />

      {/* Slides track — sits above the overlay */}
      <div
        className="nm-hero-track"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {SLIDES.map((slide, i) => (
          <div key={i} className="nm-hero-slide">
            <div className="nm-hero-content">
              <h1 className="nm-hero-title">{slide.title}</h1>
              <p className="nm-hero-subtitle">{slide.subtitle}</p>
              <Link href={slide.btnHref} className="nm-hero-btn">
                {slide.btnLabel}
              </Link>
              {slide.note && <p className="nm-hero-note">{slide.note}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Prev / Next */}
      <button
        className="nm-carousel-prev"
        onClick={() => restart(current - 1)}
        aria-label="Previous slide"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        className="nm-carousel-next"
        onClick={() => restart(current + 1)}
        aria-label="Next slide"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Dots */}
      <div className="nm-carousel-dots" role="tablist">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === current}
            aria-label={`Go to slide ${i + 1}`}
            className={`nm-dot${i === current ? ' nm-active' : ''}`}
            onClick={() => restart(i)}
          />
        ))}
      </div>
    </section>
  );
}

/* ── STATS SECTION ──────────────────────────────────────── */
function StatsSection() {
  return (
    <section className="nm-stats" id="stats">
      <div className="nm-stats-inner">
        <h2 className="nm-stats-heading">Tap into endless opportunities with Negromart</h2>

        <div className="nm-stats-layout">
          {/* Person image in blue circle */}
          <div className="nm-stats-img-wrap">
            <img src="/girl.png" alt="Successful Negromart seller" />
            {/* Trophy badge */}
            <div className="nm-stats-badge nm-stats-badge-trophy">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--nm-navy)" stroke="none">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                <path d="M4 22h16"/>
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
              </svg>
            </div>
            {/* Chart badge */}
            <div className="nm-stats-badge nm-stats-badge-chart">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--nm-navy)" stroke="none">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeWidth="2" stroke="var(--nm-navy)" fill="none"/>
              </svg>
            </div>
          </div>

          {/* Stats grid */}
          <div className="nm-stats-grid">
            {STATS.map((s, i) => (
              <div key={i} className="nm-stat">
                <div className="nm-stat-number">{s.number}</div>
                <p className="nm-stat-desc">
                  {s.desc}
                  {s.link && (
                    <>
                      {' '}
                      <Link href={s.link.href} className="nm-stat-link">
                        {s.link.label}
                      </Link>
                    </>
                  )}
                </p>
                {s.note && <span className="nm-stat-note">{s.note}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── PROGRAMS SECTION ───────────────────────────────────── */
function ProgramsSection() {
  return (
    <section className="nm-programs" id="programs">
      <div className="nm-programs-inner">
        <div className="nm-programs-header">
          <h2 className="nm-programs-title">Discover our programs designed to help you scale</h2>
          <p className="nm-programs-subtitle">
            Access powerful tools for pricing, catalog management, shipping, returns, brand management
            and more through Seller Center, API solutions and Solution Providers.
          </p>
        </div>

        <div className="nm-programs-grid">
          {PROGRAMS.map((p, i) => (
            <div key={i} className="nm-program-card">
              <div className="nm-program-icon-wrap">{p.icon}</div>
              <h3 className="nm-program-title">{p.title}</h3>
              <p className="nm-program-desc">{p.desc}</p>
              <Link href={p.href} className="nm-program-link">Learn more</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── VIDEO SECTION ──────────────────────────────────────── */
function VideoSection() {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="nm-video-section" id="video">
      <div className="nm-video-inner">
        <div className="nm-video-heading">
          <h2 className="nm-video-title">See how Negromart Marketplace works</h2>
          <p className="nm-video-subtitle">
            Watch real sellers share how selling on Negromart transformed their business.
          </p>
        </div>

        <div className="nm-video-frame">
          {playing ? (
            /* Replace VIDEO_ID below with your actual YouTube video ID */
            <iframe
              src="https://youtube.com/shorts/SeerndGsrL8?si=sikBSVbosqo1fVfS"
              title="Negromart Marketplace overview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="nm-video-placeholder">
              <button
                className="nm-video-play-btn"
                onClick={() => setPlaying(true)}
                aria-label="Play video"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </button>
              <span className="nm-video-play-text">Watch our marketplace overview</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ── CTA SECTION ────────────────────────────────────────── */
function CtaSection() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <section className="nm-cta" id="join">
      {/* Triangle / spark icon */}
      {/* <div className="nm-cta-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </div> */}

      <h2 className="nm-cta-title">
        Are you ready to join our community of Negromart sellers?
      </h2>

      <Link href="/register" className="nm-cta-btn">Join us today</Link>

      {/* Scroll to top */}
      <div className="nm-cta-scroll">
        <button
          className="nm-cta-scroll-btn"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      </div>
    </section>
  );
}

/* ── PAGE ROOT ──────────────────────────────────────────── */
export default function Home() {
  return (
    <main>
      <HeroCarousel />
      <StatsSection />
      <ProgramsSection />
      <VideoSection />
      <CtaSection />
    </main>
  );
}
