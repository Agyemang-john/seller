'use client';
import React, { useState, useEffect } from 'react';
import Modal from '@/components/modals/Modal';
import { useAppSelector } from '@/redux/hooks';
import { useRouter } from 'next/navigation';

const STEP_IMAGES = {
  step1: '/steps/step_1.jpg',
  step2: '/steps/step_2.jpg',
  step3: '/steps/step_3.jpg',
  step4: '/steps/step_4.jpg',
  step5: '/steps/step_5.jpg',
};

function StepImage({ src, alt, stepLabel }) {
  return (
    <div className="w-full overflow-hidden">
      <img
        src={src}
        alt={alt}
        className="w-full h-auto object-cover"
        style={{ aspectRatio: '1080 / 618' }}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextSibling.style.display = 'flex';
        }}
      />
      <div
        className="w-full items-center justify-center bg-gray-100 text-gray-400 text-sm font-medium"
        style={{ aspectRatio: '1080 / 618', display: 'none' }}
      >
        {stepLabel} — image coming soon
      </div>
    </div>
  );
}

export default function Home() {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const [activeStep, setActiveStep] = useState(null);
  const router = useRouter();

  // null = still checking, true = logged in, false = not logged in
  const [isACustomer, setIsACustomer] = useState(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_HOST}/api/v1/vendor/check`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'X-User-Type': 'customer' },
    })
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then(() => setIsACustomer(true))
      .catch(() => setIsACustomer(false));
  }, []);

  return (
    <main className="container mx-auto px-4 py-8 bg-white">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between animate-fade-in mb-10">
        <div className="w-full md:w-1/2 mb-8 md:mb-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 animate-slide-up">
            How to register as a Negromart seller
          </h1>
          <p className="text-gray-600 mb-6 animate-slide-up delay-100">
            Use our step-by-step guide to create your Negromart selling account.
            Find out what you need to register, get answers to common questions, and learn what to do after you've created an account.
            You can also <span className="font-bold">log in</span> if you have already created an account. Report any process/step issue(s) to{' '}
            <span className="font-bold">support@negromart.com</span>
          </p>
          {!isAuthenticated && (
            <button
              className="bg-black text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-gray-600 transition duration-300 animate-bounce w-full sm:w-auto"
              onClick={() => router.push('/register')}
            >
              Sign up*
            </button>
          )}
        </div>
        <div className="w-full md:w-1/2">
          <div className="bg-white p-4 sm:p-6 animate-scale-up">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Seller registration guide</h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center"><span className="mr-2"></span> Business information</li>
              <li className="flex items-center"><span className="mr-2"></span> Seller information</li>
              <li className="flex items-center"><span className="mr-2"></span> Billing/Payout information</li>
            </ul>
            <img
              src="https://i.pinimg.com/1200x/ad/74/ff/ad74ff65f9fe91d0903030b96d0b0c9d.jpg"
              alt="Seller guide"
              className="mt-4 w-full h-32 sm:h-48 object-cover"
            />
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="flex flex-col md:flex-row items-start justify-between animate-fade-in">
        {/* Sticky Sidebar Nav */}
        <div className="w-full md:w-1/4 sticky top-5 bg-white p-4 h-fit hidden sm:block">
          <ul>
            <li>
              <a
                href="#get-started"
                className={`block hover:text-dark transition duration-300 ${activeStep === 'get-started' ? 'text-dark font-bold text-2xl' : ''}`}
                onClick={() => setActiveStep('get-started')}
              >
                Get started
              </a>
            </li>
          </ul>
          <p className="text-gray-600 mb-6 animate-slide-up delay-100">5 steps to register</p>
          <ul className="space-y-2 text-gray-600">
            {[
              { id: 'step1', label: 'Step 1: Sign up and Login as a customer' },
              { id: 'step2', label: 'Step 2: Provide Basic Details' },
              { id: 'step3', label: 'Step 3: Setup Your Store' },
              { id: 'step4', label: 'Step 4: Add Payout Information/Method' },
              { id: 'step5', label: 'Step 5: Review and Submit' },
              { id: 'configure', label: 'Configure your account—and start selling' },
            ].map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className={`block hover:text-dark transition duration-300 ${activeStep === id ? 'text-dark font-bold text-2xl' : ''}`}
                  onClick={() => setActiveStep(id)}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Step Content */}
        <div className="w-full md:w-3/4 md:pl-8 space-y-10">
          {/* Get Started */}
          <div id="get-started">
            <div className="text-2xl font-bold text-gray-900 mb-4 animate-slide-up">Let's get started</div>
            <p className="text-gray-600 mb-6 animate-slide-up delay-100">
              While timelines for seller registration can vary, in many cases you'll be able to complete the process in just a few hours.
              Then you'll verify your identity as the primary contact for your business, a process that usually takes three business days or less,
              depending on the validity of the provided documents.
            </p>
            <Modal />
          </div>

          {/* Step 1 */}
          <div id="step1" className="animate-scale-up delay-100">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Step 1: Sign up and Login as a customer</h3>
            <StepImage src={STEP_IMAGES.step1} alt="Step 1 – Sign up and login" stepLabel="Step 1" />

            {/* Auth status banner */}
            <div className="mt-4">
              {/* Checking */}
              {isACustomer === null && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-full text-sm">
                  <svg className="animate-spin h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Checking your login status...
                </div>
              )}

              {/* Not logged in */}
              {isACustomer === false && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-full text-sm text-orange-700 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    You are not logged in — please log in to proceed to Step 2.
                  </div>
                  <a
                    href="https://www.negromart.com/auth/login"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-5 py-2 bg-black text-white text-sm rounded-full hover:bg-gray-700 transition duration-300 whitespace-nowrap"
                  >
                    Go to Login →
                  </a>
                </div>
              )}

              {/* Logged in */}
              {isACustomer === true && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full text-sm text-green-700 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    You're logged in! You're ready to continue to Step 2.
                  </div>
                  <a
                    href="#step2"
                    onClick={() => setActiveStep('step2')}
                    className="inline-block px-5 py-2 bg-black text-white text-sm rounded-full hover:bg-gray-700 transition duration-300 whitespace-nowrap"
                  >
                    Continue to Step 2 →
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Step 2 */}
          <div id="step2" className="animate-scale-up">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Step 2: Provide Basic Details</h3>
            <StepImage src={STEP_IMAGES.step2} alt="Step 2 – Provide basic details" stepLabel="Step 2" />
          </div>

          {/* Step 3 */}
          <div id="step3" className="animate-scale-up delay-100">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Step 3: Setup Your Store</h3>
            <StepImage src={STEP_IMAGES.step3} alt="Step 3 – Setup Your Store" stepLabel="Step 3" />
          </div>

          {/* Step 4 */}
          <div id="step4" className="animate-scale-up delay-200">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Step 4: Add Payout Information/Method</h3>
            <StepImage src={STEP_IMAGES.step4} alt="Step 4 – Add Payout Information/Method" stepLabel="Step 4" />
          </div>

          {/* Step 5 */}
          <div id="step5" className="animate-scale-up delay-400">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Step 5: Review and Submit</h3>
            <StepImage src={STEP_IMAGES.step5} alt="Step 5 – Review and Submit" stepLabel="Step 5" />
          </div>

          {/* Configure */}
          <div id="configure" className="bg-white p-4 sm:p-6 animate-scale-up delay-500">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Negromart seller on a laptop</h3>
            <p className="text-gray-600 mb-2">Configure your account—and start selling</p>
            <p className="text-gray-600 mb-4">
              After completing seller registration, you'll receive an email or SMS within 2–4 business days confirming whether you are qualified or not.
              That depends on the documents you provide.
            </p>
            <img
              src="https://i.pinimg.com/736x/23/ff/d1/23ffd17326ee13835ed1d537bff5a02a.jpg"
              alt="Video guide"
              className="w-full h-32 sm:h-48 object-cover rounded-lg"
            />
          </div>
        </div>
      </section>
    </main>
  );
}