"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const TRUST_BADGES = [
  "Free to join",
  "No monthly fees",
  "Setup in 5 minutes",
];

const HOW_IT_WORKS = [
  { num: "1", name: "Business information", hint: "Store name, email, phone & legal documents" },
  { num: "2", name: "Store profile",        hint: "Logo, banner and store description" },
  { num: "3", name: "Payment setup",        hint: "Mobile Money, bank or PayPal — your choice" },
  { num: "4", name: "Review & submit",      hint: "Confirm details and launch your storefront" },
];

const BENEFITS = [
  {
    title: "Your own storefront",
    desc:  "A dedicated page with your logo, cover photo, and business description — fully yours.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    title: "Grow your sales",
    desc:  "Reach thousands of active Negromart shoppers across Africa and the diaspora from day one.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
        <polyline points="17 6 23 6 23 12"/>
      </svg>
    ),
  },
  {
    title: "Student-friendly",
    desc:  "Simplified verification for student vendors with a dedicated onboarding path.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    ),
  },
  {
    title: "Secure payouts",
    desc:  "Mobile Money, bank transfer or PayPal — get paid your way, on time, every time.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
];

export default function SellerRegisterPage() {
  const [authState, setAuthState] = useState(null); // null=checking, true=logged in, false=not
  const router = useRouter();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_HOST}/api/v1/vendor/check`, {
      method: "GET",
      credentials: "include",
      headers: { "X-User-Type": "customer" },
    })
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then(() => setAuthState(true))
      .catch(() => setAuthState(false));
  }, []);

  const handleCTA = () => {
    if (!authState) {
      window.location.href = "https://www.negromart.com/auth/register";
    } else {
      router.push("/register/step-1");
    }
  };

  const ctaLabel =
    authState === null ? "Checking your account…" :
    authState          ? "Continue to vendor setup →" :
                         "Create account to continue →";

  return (
    <div>
      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="nm-reg-hero">
        <div className="nm-reg-hero-inner">

          {/* Left: copy + CTA */}
          <div>
            <span className="nm-reg-hero-eyebrow">Negromart · Vendor Programme</span>
            <h1 className="nm-reg-hero-title">
              Ready to grow<br />your business?
            </h1>
            <p className="nm-reg-hero-subtitle">
              Join thousands of vendors on Negromart's trusted marketplace.
              Set up your storefront in under 5 minutes — free to join, no monthly fees.
            </p>

            {/* Trust badges */}
            <div className="nm-reg-trust-row">
              {TRUST_BADGES.map((badge) => (
                <div key={badge} className="nm-reg-trust-item">
                  <div className="nm-reg-trust-check">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  {badge}
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
              <button
                className="nm-reg-hero-btn"
                onClick={handleCTA}
                disabled={authState === null}
              >
                {ctaLabel}
              </button>
              <Link href="/auth/login" className="nm-reg-hero-btn-outline">
                Log in
              </Link>
            </div>
          </div>

          {/* Right: "How it works" card */}
          <div className="nm-reg-steps-card">
            <div className="nm-reg-steps-card-title">How it works</div>
            <ul className="nm-reg-step-list">
              {HOW_IT_WORKS.map((s) => (
                <li key={s.num} className="nm-reg-step-row">
                  <div className="nm-reg-step-num">{s.num}</div>
                  <div className="nm-reg-step-text">
                    <div className="nm-reg-step-name">{s.name}</div>
                    <div className="nm-reg-step-hint">{s.hint}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </section>

      {/* ── NOTICES ─────────────────────────────────────────── */}
      <div className="nm-reg-notices">
        {/* Info: must be a registered user */}
        <div className="nm-reg-notice nm-reg-notice-info">
          <div className="nm-reg-notice-icon nm-reg-notice-icon-info">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div>
            <div className="nm-reg-notice-title">You must be a registered Negromart user before selling</div>
            <div className="nm-reg-notice-body">
              If you don't have an account yet, sign up at{" "}
              <a href="https://www.negromart.com" target="_blank" rel="noopener noreferrer" className="nm-reg-notice-link">
                www.negromart.com
              </a>{" "}
              first, then return here to create your vendor account.
            </div>
          </div>
        </div>

        {/* Warning: not logged in */}
        {authState === false && (
          <div className="nm-reg-notice nm-reg-notice-warn">
            <div className="nm-reg-notice-icon nm-reg-notice-icon-warn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <div className="nm-reg-notice-title">You need a Negromart account first</div>
              <div className="nm-reg-notice-body">
                Log in or sign up at{" "}
                <a href="https://www.negromart.com/auth/register" className="nm-reg-notice-link">
                  negromart.com
                </a>{" "}
                then return here to set up your vendor account.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── BENEFITS ─────────────────────────────────────────── */}
      <section className="nm-reg-benefits">
        <div className="nm-reg-benefits-inner">
          <div className="nm-reg-benefits-eyebrow">Why sell on Negromart</div>
          <h2 className="nm-reg-benefits-title">Everything you need to start and scale</h2>
          <div className="nm-reg-benefits-grid">
            {BENEFITS.map((b) => (
              <div key={b.title} className="nm-reg-feature-card">
                <div className="nm-reg-feature-icon">{b.icon}</div>
                <div className="nm-reg-feature-title">{b.title}</div>
                <div className="nm-reg-feature-desc">{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────────────── */}
      <section className="nm-reg-bottom-cta">
        <h2 className="nm-reg-bottom-cta-title">Start your seller journey today</h2>
        <p className="nm-reg-bottom-cta-sub">
          Join Negromart's growing marketplace. Setup takes under 5 minutes — free forever.
        </p>
        <button
          className="nm-reg-hero-btn"
          onClick={handleCTA}
          disabled={authState === null}
        >
          {ctaLabel}
        </button>
      </section>
    </div>
  );
}
