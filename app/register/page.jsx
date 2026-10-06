"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AccountPanel from "@/components/account/AccountPanel";
import PhoneVerifyPanel from "@/components/account/PhoneVerifyPanel";

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

// Selling uses the same Negromart account as shopping (one identity, like
// Amazon). People without an account create one right here; customers sign in
// here. Nobody is sent to www.negromart.com and back any more.
const scrollToAccount = () =>
  document.getElementById("account")?.scrollIntoView({ behavior: "smooth", block: "start" });

export default function SellerRegisterPage() {
  const [authState, setAuthState] = useState(null); // null=checking, true=logged in, false=not
  const [customer, setCustomer] = useState(null);   // /vendor/check payload (verification flags)
  const [vendorApp, setVendorApp] = useState(null); // existing vendor application (if any)
  const router = useRouter();

  const checkAccount = useCallback(() => {
    const HOST = process.env.NEXT_PUBLIC_HOST;
    const checkOpts = {
      method: "GET",
      credentials: "include",
      headers: { "X-User-Type": "customer" },
    };

    const run = async () => {
      // 1. Verify the customer access cookie. If it has expired, try a single
      //    refresh before concluding the user is logged out — otherwise a
      //    logged-in user with a stale 1h access token is wrongly told to sign up.
      let res = await fetch(`${HOST}/api/v1/vendor/check`, checkOpts);
      if (res.status === 401) {
        const refreshed = await fetch(`${HOST}/api/jwt/refresh/`, {
          method: "POST",
          credentials: "include",
        });
        if (refreshed.ok) {
          res = await fetch(`${HOST}/api/v1/vendor/check`, checkOpts);
        }
      }
      if (!res.ok) {
        setAuthState(false);
        return;
      }
      setCustomer(await res.json().catch(() => null));
      setAuthState(true);

      // 2. Logged in — detect an existing application so we don't send a
      //    pending applicant back through the whole 4-step form.
      try {
        const statusRes = await fetch(`${HOST}/api/v1/vendor/my-status/`, checkOpts);
        if (statusRes.ok) {
          const data = await statusRes.json();
          if (data?.is_vendor && data?.vendor_status) setVendorApp(data);
        }
      } catch {
        /* non-critical — fall through to the normal setup CTA */
      }
    };

    run().catch(() => setAuthState(false));
  }, []);

  useEffect(() => { checkAccount(); }, [checkAccount]);

  // Older accounts were never asked for a phone code; applying requires one.
  const needsPhone = authState === true && !vendorApp && customer && !customer.phone_verified;

  const handleCTA = () => {
    if (authState === null) return;
    if (!authState || needsPhone) {
      scrollToAccount();
      return;
    }
    if (vendorApp) {
      router.push(vendorApp.vendor_status === "VERIFIED" ? "/auth/login" : "/not-verified");
      return;
    }
    router.push("/register/step-1");
  };

  const ctaLabel =
    authState === null ? "Checking your account…" :
    !authState         ? "Create account or sign in →" :
    vendorApp          ? (vendorApp.vendor_status === "VERIFIED" ? "Go to seller login →" : "View application status →") :
    needsPhone         ? "Verify your phone to continue →" :
                         "Continue to vendor setup →";

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
        {/* Info: one account for shopping and selling */}
        <div className="nm-reg-notice nm-reg-notice-info">
          <div className="nm-reg-notice-icon nm-reg-notice-icon-info">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div>
            <div className="nm-reg-notice-title">One Negromart account for shopping and selling</div>
            <div className="nm-reg-notice-body">
              Already shop on Negromart? Sign in with that account. New here? Create one below. We'll
              confirm your email and phone with one-time codes, then you can set up your store.
            </div>
          </div>
        </div>

        {/* Not signed in, or signed in but phone never verified → inline account step */}
        {(authState === false || needsPhone) && (
          <section id="account" className="nm-reg-account">
            <div className="nm-reg-account-title">
              {authState === false ? "Your Negromart account" : "One more check"}
            </div>
            {authState === false ? (
              <AccountPanel onAuthenticated={checkAccount} />
            ) : (
              <PhoneVerifyPanel maskedPhone={customer?.masked_phone} onVerified={checkAccount} />
            )}
          </section>
        )}

        {/* Signed in and verified → ready to apply */}
        {authState === true && !vendorApp && !needsPhone && (
          <div className="nm-reg-notice nm-reg-notice-info">
            <div className="nm-reg-notice-icon nm-reg-notice-icon-info">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div>
              <div className="nm-reg-notice-title">
                You're signed in{customer?.first_name ? ` as ${customer.first_name}` : ""}
              </div>
              <div className="nm-reg-notice-body">
                Your account is verified{customer?.email ? ` (${customer.email})` : ""}. Continue to set up your store.
              </div>
            </div>
          </div>
        )}

        {/* Info: an application is already on file */}
        {authState === true && vendorApp && (
          <div className="nm-reg-notice nm-reg-notice-warn">
            <div className="nm-reg-notice-icon nm-reg-notice-icon-warn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div>
              <div className="nm-reg-notice-title">
                {vendorApp.vendor_status === "VERIFIED"
                  ? "Your vendor account is approved"
                  : "You already have an application under review"}
              </div>
              <div className="nm-reg-notice-body">
                {vendorApp.vendor_status === "VERIFIED"
                  ? "Head to the seller login to access your dashboard."
                  : "We're reviewing your details — you'll be notified by email within 24–48 hours. You don't need to submit again."}
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
