'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';

/* ─────────────────────────────────────────────────────────────
   TUTORIAL DATA
   Replace `src` values with your real video paths or YouTube IDs.
   Set `type: 'youtube'` and `src: 'VIDEO_ID'` for YouTube embeds.
   Set `type: 'local'`   and `src: '/video/your-file.mp4'` for local files.
───────────────────────────────────────────────────────────── */
const TUTORIALS = [
  /* ── Getting Started ── */
  {
    id: 1,
    category: 'Getting Started',
    title: 'How to Create Your Seller Account',
    desc: 'A complete walkthrough of the Negromart seller registration process, from sign-up to your first product listing.',
    duration: '4:32',
    type: 'local',
    src: '/video/warehouse1.mp4',
  },
  {
    id: 2,
    category: 'Getting Started',
    title: 'Understanding Your Seller Dashboard',
    desc: 'Get familiar with every section of your dashboard: orders, analytics, products, payouts and more.',
    duration: '6:14',
    type: 'local',
    src: '/video/warehouse1.mp4',
  },
  {
    id: 3,
    category: 'Getting Started',
    title: 'Setting Up Your Store Profile',
    desc: 'Learn how to add your store logo, banner, description and contact details to build buyer trust.',
    duration: '3:50',
    type: 'local',
    src: '/video/warehouse1.mp4',
  },
  /* ── Product Management ── */
  {
    id: 4,
    category: 'Product Management',
    title: 'Adding Your First Product Listing',
    desc: 'Step-by-step guide to creating a product: photos, pricing, inventory, categories and attributes.',
    duration: '7:22',
    type: 'local',
    src: '/video/warehouse1.mp4',
  },
  {
    id: 5,
    category: 'Product Management',
    title: 'Bulk Upload with CSV Templates',
    desc: 'Save time by uploading hundreds of products at once using our downloadable CSV template.',
    duration: '5:08',
    type: 'local',
    src: '/video/warehouse1.mp4',
  },
  {
    id: 6,
    category: 'Product Management',
    title: 'Managing Inventory & Stock Alerts',
    desc: 'Keep your stock levels accurate and never miss a sale with real-time inventory tracking.',
    duration: '4:45',
    type: 'local',
    src: '/video/warehouse1.mp4',
  },
  /* ── Shipping ── */
  {
    id: 7,
    category: 'Shipping',
    title: 'Setting Up Shipping Rates & Zones',
    desc: 'Configure flat-rate, weight-based and free shipping options for Nigeria, Ghana, Kenya and beyond.',
    duration: '6:00',
    type: 'local',
    src: '/video/warehouse1.mp4',
  },
  {
    id: 8,
    category: 'Shipping',
    title: 'Printing & Tracking Shipping Labels',
    desc: 'Generate and print shipping labels directly from your dashboard and share tracking with buyers.',
    duration: '3:20',
    type: 'local',
    src: '/video/warehouse1.mp4',
  },
  {
    id: 9,
    category: 'Shipping',
    title: 'Handling Returns & Refunds',
    desc: 'Learn how to accept return requests, inspect items and issue refunds quickly to protect your rating.',
    duration: '5:55',
    type: 'local',
    src: '/video/warehouse1.mp4',
  },
  /* ── Grow Sales ── */
  {
    id: 10,
    category: 'Grow Sales',
    title: 'Running Promotions & Discounts',
    desc: 'Create flash sales, coupon codes and bundle deals to drive traffic and boost conversion rates.',
    duration: '4:10',
    type: 'local',
    src: '/video/warehouse1.mp4',
  },
  {
    id: 11,
    category: 'Grow Sales',
    title: 'Reading Your Sales Analytics',
    desc: 'Understand revenue trends, top-selling products and customer behaviour using the analytics dashboard.',
    duration: '7:48',
    type: 'local',
    src: '/video/warehouse1.mp4',
  },
  {
    id: 12,
    category: 'Grow Sales',
    title: 'Getting More 5-Star Reviews',
    desc: 'Proven strategies to delight customers, earn positive reviews and respond professionally to feedback.',
    duration: '5:30',
    type: 'local',
    src: '/video/warehouse1.mp4',
  },
  /* ── Brand & Marketing ── */
  {
    id: 13,
    category: 'Brand & Marketing',
    title: 'Building a Strong Brand on Negromart',
    desc: 'Learn how consistent visuals, messaging and tone of voice grow buyer loyalty and repeat purchases.',
    duration: '6:25',
    type: 'local',
    src: '/video/warehouse1.mp4',
  },
  {
    id: 14,
    category: 'Brand & Marketing',
    title: 'Social Media for Negromart Sellers',
    desc: 'Drive external traffic to your Negromart store using Instagram, TikTok, Pinterest and Facebook.',
    duration: '8:00',
    type: 'local',
    src: '/video/warehouse1.mp4',
  },
  {
    id: 15,
    category: 'Brand & Marketing',
    title: 'Using Marketplace Advertising',
    desc: 'Set up sponsored product ads within Negromart to appear at the top of search results.',
    duration: '5:40',
    type: 'local',
    src: '/video/warehouse1.mp4',
  },
];

const CATEGORIES = ['All', ...Array.from(new Set(TUTORIALS.map((t) => t.category)))];

/* ── Thumbnail component ── */
function ThumbnailBg({ category, children }) {
  return (
    <div className="nm-tut-thumb-bg" data-cat={category}>
      {children}
    </div>
  );
}

/* ── Playlist item ── */
function PlaylistItem({ tutorial, isPlaying, onSelect }) {
  return (
    <button
      className={`nm-playlist-item${isPlaying ? ' nm-playing' : ''}`}
      onClick={() => onSelect(tutorial)}
      aria-current={isPlaying ? 'true' : undefined}
    >
      <div className="nm-playlist-thumb">
        <ThumbnailBg category={tutorial.category}>
          <div className="nm-playlist-play-dot">
            {isPlaying ? (
              /* animated bars icon when playing */
              <svg width="10" height="12" viewBox="0 0 10 12" fill="white">
                <rect x="0" y="0" width="3" height="12" rx="1" />
                <rect x="7" y="0" width="3" height="12" rx="1" />
              </svg>
            ) : (
              <svg width="9" height="10" viewBox="0 0 9 10" fill="white">
                <polygon points="0,0 9,5 0,10" />
              </svg>
            )}
          </div>
        </ThumbnailBg>
      </div>
      <div className="nm-playlist-info">
        <div className="nm-playlist-item-title">{tutorial.title}</div>
        <div className="nm-playlist-item-meta">
          <span>{tutorial.category}</span>
        </div>
      </div>
      <span className="nm-playlist-duration">{tutorial.duration}</span>
    </button>
  );
}

/* ── Tutorial card ── */
function TutCard({ tutorial, isActive, onSelect }) {
  return (
    <button
      className={`nm-tut-card${isActive ? ' nm-tut-card-active' : ''}`}
      onClick={() => onSelect(tutorial)}
    >
      <div className="nm-tut-thumb">
        <ThumbnailBg category={tutorial.category}>
          <div className="nm-tut-thumb-play">
            <svg width="18" height="20" viewBox="0 0 18 20" fill="white">
              <polygon points="0,0 18,10 0,20" />
            </svg>
          </div>
        </ThumbnailBg>
        <span className="nm-tut-duration">{tutorial.duration}</span>
      </div>
      <div className="nm-tut-card-body">
        <span className="nm-tut-card-cat">{tutorial.category}</span>
        <div className="nm-tut-card-title">{tutorial.title}</div>
        <div className="nm-tut-card-desc">{tutorial.desc}</div>
        {isActive && (
          <div className="nm-tut-now-playing">
            <span className="nm-tut-now-dot" />
            Now Playing
          </div>
        )}
      </div>
    </button>
  );
}

/* ── Main page component ── */
export default function TutorialsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [selected, setSelected] = useState(TUTORIALS[0]);
  const videoRef = useRef(null);
  const playerSectionRef = useRef(null);

  const filtered = activeTab === 'All'
    ? TUTORIALS
    : TUTORIALS.filter((t) => t.category === activeTab);

  const handleSelect = useCallback((tutorial) => {
    setSelected(tutorial);
    /* scroll to player on mobile */
    playerSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  /* ── Player renderer ── */
  const renderPlayer = () => {
    if (!selected) {
      return (
        <div className="nm-player-empty">
          <div className="nm-player-empty-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>
          <span className="nm-player-empty-text">Select a tutorial to start watching</span>
        </div>
      );
    }

    if (selected.type === 'youtube') {
      return (
        <iframe
          key={selected.id}
          src={`https://www.youtube.com/embed/${selected.src}?autoplay=1&rel=0&modestbranding=1`}
          title={selected.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
        />
      );
    }

    /* local / mp4 — native controls give full user control */
    return (
      <video
        key={selected.id}
        ref={videoRef}
        src={selected.src}
        controls
        autoPlay
        playsInline
        preload="metadata"
        style={{ width: '100%', height: '100%', display: 'block', background: '#000' }}
      >
        Your browser does not support the video tag.
      </video>
    );
  };

  return (
    <main>
      {/* ── Hero ── */}
      <section className="nm-tut-hero">
        <span className="nm-tut-hero-eyebrow">Seller Education Hub</span>
        <h1 className="nm-tut-hero-title">Master selling on Negromart</h1>
        <p className="nm-tut-hero-subtitle">
          Step-by-step video tutorials to help you launch, grow and scale your Negromart
          Marketplace business — at your own pace.
        </p>
      </section>

      {/* ── Player + Playlist ── */}
      <section className="nm-tut-player-section" ref={playerSectionRef}>
        <div className="nm-tut-player-inner">

          {/* Left: player + meta */}
          <div>
            {/* Responsive 16:9 player box */}
            <div className="nm-player-wrap">
              {renderPlayer()}
            </div>

            {/* Info below player */}
            {selected && (
              <div className="nm-player-meta">
                <span className="nm-player-badge">{selected.category}</span>
                <div className="nm-player-title">{selected.title}</div>
                <div className="nm-player-desc">{selected.desc}</div>
              </div>
            )}
          </div>

          {/* Right: scrollable playlist */}
          <div className="nm-playlist" aria-label="Tutorial playlist">
            <div className="nm-playlist-header">
              Up next · {TUTORIALS.length} tutorials
            </div>
            {TUTORIALS.map((t) => (
              <PlaylistItem
                key={t.id}
                tutorial={t}
                isPlaying={selected?.id === t.id}
                onSelect={handleSelect}
              />
            ))}
          </div>

        </div>
      </section>

      {/* ── Category tabs ── */}
      <div className="nm-tut-tabs-section">
        <div className="nm-tut-tabs-inner" role="tablist">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={activeTab === cat}
              className={`nm-tab-btn${activeTab === cat ? ' nm-tab-active' : ''}`}
              onClick={() => setActiveTab(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tutorial grid ── */}
      <section className="nm-tut-grid-section">
        <div className="nm-tut-grid-inner">
          <div className="nm-tut-section-label">
            {activeTab === 'All' ? 'All Tutorials' : activeTab} &nbsp;·&nbsp; {filtered.length} video{filtered.length !== 1 ? 's' : ''}
          </div>
          <div className="nm-tut-grid">
            {filtered.map((t) => (
              <TutCard
                key={t.id}
                tutorial={t}
                isActive={selected?.id === t.id}
                onSelect={handleSelect}
              />
            ))}
          </div>

          {/* Bottom CTA */}
          <div style={{ textAlign: 'center', paddingTop: '16px' }}>
            <p style={{ fontSize: '16px', color: 'var(--nm-text-mid)', marginBottom: '20px' }}>
              Ready to start selling?
            </p>
            <Link href="/register" className="nm-cta-btn">
              Join Marketplace
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
