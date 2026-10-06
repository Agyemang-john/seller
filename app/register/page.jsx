"use client";

/**
 * /register: seller registration landing page.
 *
 * Registration flow (backend: userauths/seller_signup_views.py, vendor/views.py):
 *   0. Negromart account: sign in, or create one here (email code + SMS code).
 *      Existing customers whose phone was never verified confirm it here.
 *   1–4. Store application: business & ID → store profile → payout → review.
 *   Then Negromart reviews the application before the store goes live.
 *
 * Selling uses the same account as shopping, so nobody is sent to
 * www.negromart.com and back.
 */

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AccountPanel from "@/components/account/AccountPanel";
import PhoneVerifyPanel from "@/components/account/PhoneVerifyPanel";

const STEPS = [
  {
    name: "Negromart account",
    detail: "Sign in, or create an account. We confirm your email and mobile number with one-time codes.",
  },
  {
    name: "Business information",
    detail: "Store name, business contact details, business type and identity documents.",
  },
  {
    name: "Store profile",
    detail: "Logo, cover image, store location and a short description for customers.",
  },
  {
    name: "Payout details",
    detail: "The Mobile Money, bank or PayPal account your earnings are paid into.",
  },
  {
    name: "Review",
    detail: "Submit your application. We review it, usually within 24–48 hours, and email you the decision.",
  },
];

const REQUIREMENTS = [
  {
    item: "Identity document",
    detail: "Government-issued ID (Ghana Card, passport or driver's licence). Students may use a valid student ID instead.",
  },
  {
    item: "Proof of address",
    detail: "A utility bill, bank statement or similar document dated within the last 180 days.",
  },
  {
    item: "Mobile number and email",
    detail: "Both must be able to receive one-time verification codes.",
  },
  {
    item: "Payout account",
    detail: "A Mobile Money wallet, bank account or PayPal account in your name or your business's name.",
  },
  {
    item: "Store images",
    detail: "A logo and a cover image for your storefront (JPG or PNG).",
  },
];

const FAQS = [
  {
    q: "Do I need a separate account to sell?",
    a: "No. Selling uses your normal Negromart account. If you already shop on Negromart, sign in with that account. Your purchases and your store stay under one login.",
  },
  {
    q: "How long does the review take?",
    a: "Most applications are reviewed within 24–48 hours. You will receive an email and SMS once a decision is made. You cannot list products until the store is approved.",
  },
  {
    q: "Is there a fee to register?",
    a: "Registration is free, and a free selling plan is available. Paid plans add features such as bulk product upload and advanced analytics. You can change plans at any time from Seller Centre.",
  },
  {
    q: "Can other people help me run my store?",
    a: "Yes. Once your store is approved, you can invite team members from Seller Centre. Each person signs in with their own Negromart account and is given an Admin or Staff role; nobody needs your password.",
  },
  {
    q: "Why do you need my documents?",
    a: "We verify every seller to protect customers and keep the marketplace trustworthy. Documents are used only for verification and are not shown on your storefront.",
  },
];

// Wording for an application that is already on file, by status.
const APPLICATION_STATUS = {
  PENDING: {
    title: "Your application is under review",
    body: "We have received your application and will email you once it has been reviewed. You do not need to submit it again.",
    action: { label: "View application status", href: "/not-verified" },
  },
  VERIFIED: {
    title: "Your store is approved",
    body: "Sign in to Seller Centre to manage your store.",
    action: { label: "Sign in to Seller Centre", href: "/auth/login" },
  },
  REJECTED: {
    title: "Your application was not approved",
    body: "Please check the email we sent you for the reason. For help, contact support@negromart.com.",
    action: { label: "View application status", href: "/not-verified" },
  },
  SUSPENDED: {
    title: "Your store is suspended",
    body: "Contact support@negromart.com for details about your account.",
    action: null,
  },
};

const scrollToAccount = () =>
  document.getElementById("account")?.scrollIntoView({ behavior: "smooth", block: "start" });

export default function SellerRegisterPage() {
  const [authState, setAuthState] = useState(null); // null=checking, true=signed in, false=not
  const [customer, setCustomer] = useState(null);   // /vendor/check payload (verification flags)
  const [vendorApp, setVendorApp] = useState(null); // existing application or team membership
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
      //    refresh before concluding the user is signed out; otherwise a
      //    signed-in user with a stale 1h access token is wrongly told to sign up.
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

      // 2. Signed in: detect an existing application (or team membership) so a
      //    pending applicant isn't sent back through the whole form.
      try {
        const statusRes = await fetch(`${HOST}/api/v1/vendor/my-status/`, checkOpts);
        if (statusRes.ok) {
          const data = await statusRes.json();
          if (data?.is_vendor && data?.vendor_status) setVendorApp(data);
        }
      } catch {
        /* non-critical: fall through to the normal flow */
      }
    };

    run().catch(() => setAuthState(false));
  }, []);

  useEffect(() => { checkAccount(); }, [checkAccount]);

  // Older accounts were never asked for a phone code; applying requires one.
  const needsPhone = authState === true && !vendorApp && customer && !customer.phone_verified;
  const ready = authState === true && !vendorApp && !needsPhone;

  const handlePrimary = () => {
    if (authState === null) return;
    if (ready) router.push("/register/step-1");
    else scrollToAccount();
  };

  const primaryLabel =
    authState === null ? "Checking your account…" :
    ready              ? "Continue to store application" :
    vendorApp          ? "View your account status" :
                         "Start registration";

  return (
    <div className="nm-reg">
      {/* ── Page header ─────────────────────────────────────── */}
      <header className="nm-reg-head">
        <div className="nm-reg-wrap nm-reg-head-grid">
          <div>
            <p className="nm-reg-kicker">Negromart Seller Centre</p>
            <h1 className="nm-reg-title">Register as a seller</h1>
            <p className="nm-reg-lead">
              Open a store on Negromart and sell to customers who shop on www.negromart.com.
              Registration is free. Every store is reviewed before it goes live.
            </p>
            <div className="nm-reg-actions">
              <button className="nm-btn nm-btn-primary" onClick={handlePrimary} disabled={authState === null}>
                {primaryLabel}
              </button>
              <Link href="/auth/login" className="nm-btn nm-btn-secondary">
                Seller sign in
              </Link>
            </div>
          </div>

          <aside className="nm-reg-facts" aria-label="Registration at a glance">
            <dl>
              <div><dt>Cost to register</dt><dd>Free</dd></div>
              <div><dt>Documents</dt><dd>ID and proof of address</dd></div>
              <div><dt>Review</dt><dd>Usually 24–48 hours</dd></div>
              <div><dt>Account</dt><dd>Your existing Negromart account</dd></div>
            </dl>
          </aside>
        </div>
      </header>

      {/* ── Account + process ───────────────────────────────── */}
      <section className="nm-reg-section">
        <div className="nm-reg-wrap nm-reg-two-col">
          <div id="account" className="nm-reg-panel">
            <h2 className="nm-reg-h2">Your account</h2>
            <AccountSection
              authState={authState}
              customer={customer}
              vendorApp={vendorApp}
              needsPhone={needsPhone}
              onChanged={checkAccount}
              onContinue={() => router.push("/register/step-1")}
            />
          </div>

          <div>
            <h2 className="nm-reg-h2">How registration works</h2>
            <ol className="nm-reg-steps">
              {STEPS.map((step, i) => (
                <li key={step.name}>
                  <span className="nm-reg-step-index">{i === 0 ? "Account" : `Step ${i}`}</span>
                  <div>
                    <div className="nm-reg-step-name">{step.name}</div>
                    <div className="nm-reg-step-detail">{step.detail}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── Requirements ────────────────────────────────────── */}
      <section className="nm-reg-section nm-reg-section-muted">
        <div className="nm-reg-wrap">
          <h2 className="nm-reg-h2">What you will need</h2>
          <p className="nm-reg-section-intro">
            Have these ready before you start. You can go back and change any step before you submit.
          </p>
          <table className="nm-reg-table">
            <tbody>
              {REQUIREMENTS.map((r) => (
                <tr key={r.item}>
                  <th scope="row">{r.item}</th>
                  <td>{r.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section className="nm-reg-section">
        <div className="nm-reg-wrap nm-reg-narrow">
          <h2 className="nm-reg-h2">Common questions</h2>
          <div className="nm-reg-faq">
            {FAQS.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
          <p className="nm-reg-help">
            Still have a question? Email{" "}
            <a href="mailto:support@negromart.com">support@negromart.com</a>.
          </p>
        </div>
      </section>
    </div>
  );
}

/** The "Your account" panel: what the visitor needs to do next. */
function AccountSection({ authState, customer, vendorApp, needsPhone, onChanged, onContinue }) {
  if (authState === null) {
    return <p className="nm-reg-muted">Checking whether you are signed in…</p>;
  }

  if (authState === false) {
    return (
      <>
        <p className="nm-reg-muted nm-reg-panel-intro">
          Sign in with the account you use on www.negromart.com, or create one now.
        </p>
        <AccountPanel onAuthenticated={onChanged} />
      </>
    );
  }

  if (vendorApp) {
    const isTeamMember = vendorApp.vendor_role && vendorApp.vendor_role !== "owner";
    const info = isTeamMember
      ? {
          title: "Your account belongs to a store team",
          body: "You were added to an existing store, so you cannot register a separate one with this account. Sign in to Seller Centre to work on that store.",
          action: { label: "Sign in to Seller Centre", href: "/auth/login" },
        }
      : APPLICATION_STATUS[vendorApp.vendor_status] || APPLICATION_STATUS.PENDING;
    return (
      <div className="nm-reg-status">
        <div className="nm-reg-status-title">{info.title}</div>
        <p>{info.body}</p>
        {info.action && (
          <Link href={info.action.href} className="nm-btn nm-btn-primary">{info.action.label}</Link>
        )}
      </div>
    );
  }

  if (needsPhone) {
    return (
      <>
        <SignedInAs customer={customer} />
        <PhoneVerifyPanel maskedPhone={customer?.masked_phone} onVerified={onChanged} />
      </>
    );
  }

  return (
    <>
      <SignedInAs customer={customer} />
      <ul className="nm-reg-checks">
        <li>Email address verified</li>
        <li>Mobile number verified</li>
      </ul>
      <button className="nm-btn nm-btn-primary nm-btn-block" onClick={onContinue}>
        Continue to store application
      </button>
    </>
  );
}

function SignedInAs({ customer }) {
  return (
    <p className="nm-reg-signed-in">
      Signed in as <strong>{customer?.email}</strong>
    </p>
  );
}
