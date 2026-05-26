"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SellerFormProvider } from "./SellerFormContext";
import Link from "next/link";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

const STEPS = [
  { label: "Business" },
  { label: "Profile"  },
  { label: "Payment"  },
  { label: "Review"   },
];

const STEP_PATHS = [
  "/register/step-1",
  "/register/step-2",
  "/register/step-3",
  "/register/step-4",
];

/* Check icon */
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function SellerSignUpLayout({ children }) {
  const pathname = usePathname();
  const activeStep = STEP_PATHS.indexOf(pathname);
  const isStepPage = activeStep >= 0;

  return (
    <SellerFormProvider>
      <div style={{ minHeight: "100vh", background: "#fff" }}>
        <Header />

        {/* ── Step banner (shown only on step-1…step-4) ── */}
        {isStepPage && (
          <div className="nm-reg-layout-banner">
            <div className="nm-reg-layout-banner-inner">
              <div className="nm-reg-layout-title">Start Selling on Negromart</div>
              <div className="nm-reg-layout-sub">
                Join thousands of vendors on Negromart's marketplace
              </div>

              {/* Progress indicator */}
              <div className="nm-reg-progress">
                {STEPS.map((step, index) => {
                  const isDone   = index < activeStep;
                  const isActive = index === activeStep;
                  const circleClass = isDone   ? "nm-reg-progress-circle nm-done"
                                    : isActive ? "nm-reg-progress-circle nm-active"
                                    :             "nm-reg-progress-circle nm-pending";
                  const labelClass  = isDone   ? "nm-reg-progress-label nm-label-done"
                                    : isActive ? "nm-reg-progress-label nm-label-active"
                                    :             "nm-reg-progress-label nm-label-pending";

                  return (
                    <React.Fragment key={step.label}>
                      <div className="nm-reg-progress-step">
                        <div className={circleClass}>
                          {isDone ? <CheckIcon /> : index + 1}
                        </div>
                        <span className={labelClass}>{step.label}</span>
                      </div>

                      {index < STEPS.length - 1 && (
                        <div
                          className={`nm-reg-progress-line ${
                            index < activeStep ? "nm-line-done" : "nm-line-pending"
                          }`}
                        />
                      )}
                    </React.Fragment>
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
                Already have a seller account?{" "}
                <Link href="/auth/login">Log in here</Link>
              </div>
            </div>
          </div>
        ) : (
          /* Landing page — no extra wrapping */
          children
        )}

        <Footer />
      </div>
    </SellerFormProvider>
  );
}
