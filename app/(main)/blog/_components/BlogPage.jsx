'use client';

import { useState } from 'react';
import Link from 'next/link';

const CATEGORIES = ['All', 'Seller Tips', 'Platform News', 'Growth', 'Shipping', 'Success Stories'];

const POSTS = [
  {
    id: 1,
    category: 'Seller Tips',
    title: 'How to Write Product Titles That Actually Convert',
    excerpt: 'Your product title is the first thing buyers see. Learn the formula that top Negromart sellers use to rank higher and win more clicks.',
    author: 'Negromart Team',
    date: 'May 15, 2026',
    readTime: '5 min read',
    featured: true,
  },
  {
    id: 2,
    category: 'Platform News',
    title: 'Introducing Bulk Upload 2.0: Faster, Smarter Listings',
    excerpt: 'We\'ve rebuilt our bulk upload tool from the ground up. Upload up to 1,000 products at once with our improved CSV template and real-time validation.',
    author: 'Product Team',
    date: 'May 10, 2026',
    readTime: '3 min read',
    featured: false,
  },
  {
    id: 3,
    category: 'Growth',
    title: '7 Proven Strategies to Boost Your Store\'s Sales This Quarter',
    excerpt: 'From flash promotions to cross-selling bundles, these data-backed tactics are helping Negromart sellers grow revenue by 40% or more.',
    author: 'Negromart Team',
    date: 'May 5, 2026',
    readTime: '8 min read',
    featured: false,
  },
  {
    id: 4,
    category: 'Success Stories',
    title: 'From Side Hustle to Full-Time: Adaeze\'s Negromart Story',
    excerpt: 'Adaeze started selling handmade jewellery from Lagos on Negromart in 2025. Today she ships to 12 countries and employs three full-time staff.',
    author: 'Negromart Team',
    date: 'Apr 28, 2026',
    readTime: '6 min read',
    featured: false,
  },
  {
    id: 5,
    category: 'Shipping',
    title: 'The Complete Guide to Shipping Internationally from Ghana',
    excerpt: 'Everything you need to know about customs forms, prohibited items, packaging requirements, and choosing the right courier for diaspora orders.',
    author: 'Operations Team',
    date: 'Apr 20, 2026',
    readTime: '10 min read',
    featured: false,
  },
  {
    id: 6,
    category: 'Seller Tips',
    title: 'Photography on a Budget: Great Product Photos with Just Your Phone',
    excerpt: 'Professional product photos don\'t require an expensive studio. Follow these 8 steps to take scroll-stopping images with your smartphone.',
    author: 'Negromart Team',
    date: 'Apr 12, 2026',
    readTime: '7 min read',
    featured: false,
  },
  {
    id: 7,
    category: 'Growth',
    title: 'Understanding Your Analytics Dashboard: A Seller\'s Deep Dive',
    excerpt: 'Revenue trends, conversion rates, traffic sources — learn what each metric means and how to act on it to grow your Negromart store.',
    author: 'Negromart Team',
    date: 'Apr 5, 2026',
    readTime: '9 min read',
    featured: false,
  },
  {
    id: 8,
    category: 'Platform News',
    title: 'New Payment Methods Now Available for Sellers',
    excerpt: 'We\'ve added mobile money payouts for Ghana and Nigeria, giving sellers faster access to their earnings. Here\'s how to set it up.',
    author: 'Finance Team',
    date: 'Mar 28, 2026',
    readTime: '4 min read',
    featured: false,
  },
  {
    id: 9,
    category: 'Success Stories',
    title: 'Kofi\'s Clothing Brand Now Ships to the UK and US',
    excerpt: 'Using Negromart\'s international shipping tools, Kofi expanded his Accra-based fashion label to diaspora buyers in just three months.',
    author: 'Negromart Team',
    date: 'Mar 18, 2026',
    readTime: '5 min read',
    featured: false,
  },
];

const CATEGORY_COLORS = {
  'Seller Tips': { bg: '#eef4ff', color: '#0071ce' },
  'Platform News': { bg: '#fff7ed', color: '#c2410c' },
  'Growth': { bg: '#f0fdf4', color: '#15803d' },
  'Shipping': { bg: '#faf5ff', color: '#7e22ce' },
  'Success Stories': { bg: '#fefce8', color: '#a16207' },
};

function CategoryBadge({ category }) {
  const style = CATEGORY_COLORS[category] || { bg: '#f3f4f6', color: '#374151' };
  return (
    <span
      className="nm-blog-badge"
      style={{ background: style.bg, color: style.color }}
    >
      {category}
    </span>
  );
}

function FeaturedPost({ post }) {
  return (
    <article className="nm-blog-featured">
      <div className="nm-blog-featured-thumb">
        <div className="nm-blog-featured-thumb-inner">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <div className="nm-blog-featured-label">Featured Post</div>
      </div>
      <div className="nm-blog-featured-body">
        <CategoryBadge category={post.category} />
        <h2 className="nm-blog-featured-title">{post.title}</h2>
        <p className="nm-blog-featured-excerpt">{post.excerpt}</p>
        <div className="nm-blog-post-meta">
          <span>{post.author}</span>
          <span className="nm-blog-dot" />
          <span>{post.date}</span>
          <span className="nm-blog-dot" />
          <span>{post.readTime}</span>
        </div>
        <Link href="/register" className="nm-blog-read-btn">
          Read article
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </Link>
      </div>
    </article>
  );
}

function PostCard({ post }) {
  return (
    <article className="nm-blog-card">
      <div className="nm-blog-card-thumb">
        <div className="nm-blog-card-thumb-inner" data-cat={post.category}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
      </div>
      <div className="nm-blog-card-body">
        <CategoryBadge category={post.category} />
        <h3 className="nm-blog-card-title">{post.title}</h3>
        <p className="nm-blog-card-excerpt">{post.excerpt}</p>
        <div className="nm-blog-post-meta nm-blog-post-meta-sm">
          <span>{post.date}</span>
          <span className="nm-blog-dot" />
          <span>{post.readTime}</span>
        </div>
      </div>
    </article>
  );
}

export default function BlogPage() {
  const [activeTab, setActiveTab] = useState('All');

  const featured = POSTS.find((p) => p.featured);
  const filtered = activeTab === 'All'
    ? POSTS.filter((p) => !p.featured)
    : POSTS.filter((p) => p.category === activeTab && !p.featured);

  return (
    <main>
      {/* Hero */}
      <section className="nm-blog-hero">
        <div className="nm-blog-hero-inner">
          <span className="nm-blog-hero-eyebrow">Sell Better Blog</span>
          <h1 className="nm-blog-hero-title">Insights to grow your business</h1>
          <p className="nm-blog-hero-subtitle">
            Seller tips, platform news, success stories and growth strategies — straight from the
            Negromart Marketplace team.
          </p>
        </div>
      </section>

      {/* Category tabs */}
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

      {/* Content */}
      <section className="nm-blog-content">
        <div className="nm-blog-content-inner">

          {/* Featured post — only show on All tab */}
          {activeTab === 'All' && featured && <FeaturedPost post={featured} />}

          {/* Grid */}
          <div className="nm-blog-section-label">
            {activeTab === 'All' ? 'Latest Articles' : activeTab}
            &nbsp;·&nbsp;{filtered.length} article{filtered.length !== 1 ? 's' : ''}
          </div>
          <div className="nm-blog-grid">
            {filtered.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="nm-blog-empty">
              <p>No articles in this category yet. Check back soon!</p>
            </div>
          )}

          {/* Newsletter CTA */}
          <div className="nm-blog-newsletter">
            <div className="nm-blog-newsletter-inner">
              <h2 className="nm-blog-newsletter-title">Never miss an update</h2>
              <p className="nm-blog-newsletter-sub">
                Get the latest seller tips and platform news delivered to your inbox.
              </p>
              <div className="nm-blog-newsletter-form">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="nm-blog-newsletter-input"
                />
                <button className="nm-blog-newsletter-btn">Subscribe</button>
              </div>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
