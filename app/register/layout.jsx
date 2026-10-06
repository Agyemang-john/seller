"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SellerFormProvider } from "./SellerFormContext";
import Link from "next/link";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

// The store application. The Negromart account (and its email/phone
// verification) is handled on /register before step 1.
const STEPS = [
  { label: "Business information", path: "/register/step-1" },
  { label: "Store profile",        path: "/register/step-2" },
  { label: "Payout details",       path: "/register/step-3" },
  { label: "Review and submit",    path: "/register/step-4" },
];

export default function SellerSignUpLayout({ children }) {
  const pathname = usePathname();
  const activeStep = STEPS.findIndex((s) => s.path === pathname);
  const isStepPage = activeStep >= 0;

  return (
    <SellerFormProvider>
      <div style={{ minHeight: "100vh", background: "#fff" }}>
        <Header />

        {/* ── Application header + progress (step-1…step-4 only) ── */}
        {isStepPage && (
          <div className="nm-reg-layout-banner">
            <div className="nm-reg-layout-banner-inner">
              <div className="nm-reg-layout-title">Store application</div>
              <div className="nm-reg-layout-sub">
                Step {activeStep + 1} of {STEPS.length}: {STEPS[activeStep].label}. Your answers are
                kept while this tab is open.
              </div>

              <div
                className="nm-reg-progress"
                role="progressbar"
                aria-valuemin={1}
                aria-valuemax={STEPS.length}
                aria-valuenow={activeStep + 1}
                aria-label="Application progress"
              >
                {STEPS.map((step, index) => {
                  const state = index < activeStep ? "is-done" : index === activeStep ? "is-active" : "";
                  return (
                    <div key={step.path} className={`nm-reg-progress-seg ${state}`}>
                      <div className="nm-reg-progress-bar" />
                      <span className="nm-reg-progress-label">{index + 1}. {step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Form area ── */}
        {isStepPage ? (
          <div className="nm-reg-form-area">
            <div className="nm-reg-form-area-inner">
              <div className="nm-reg-form-card">
                {children}
              </div>
              <div className="nm-reg-footer-note">
                Already registered? <Link href="/auth/login">Sign in to Seller Centre</Link>
              </div>
            </div>
          </div>
        ) : (
          /* Landing page: no extra wrapping */
          children
        )}

        <Footer />
      </div>
    </SellerFormProvider>
  );
}
