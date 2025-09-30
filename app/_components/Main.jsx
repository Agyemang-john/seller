'use client';
import React, { useState } from 'react';
import Modal from '@/components/modals/Modal';

export default function Home() {
    const [activeStep, setActiveStep] = useState(null);
  return (
    <main className="container mx-auto px-4 py-8">
      <section className="flex flex-col md:flex-row items-center justify-between animate-fade-in">
        <div className="w-full md:w-1/2 mb-8 md:mb-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 animate-slide-up">How to register as a Negromart seller</h1>
          <p className="text-gray-600 mb-6 animate-slide-up delay-100">Use our step-by-step guide to create your Negromart selling account. 
            Find out what you need to register, get answers to common questions, and learn what to do after you’ve created an account. 
            You can also <span style={{ fontWeight: 'bold' }}>log in</span> if you have already created an account. Report any process/step issue(s) to <span style={{ fontWeight: 'bold' }}>support@negromart.com</span></p>
          <button className="bg-black text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-gray-600 transition duration-300 animate-bounce w-full sm:w-auto">Sign up*</button>
          {/* <p className="text-sm text-gray-500 mt-2 animate-slide-up delay-200">Get started with over ₵1,000 in incentives</p> */}
        </div>
        <div className="w-full md:w-1/2">
          <div className="bg-white p-4 sm:p-6 animate-scale-up">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Seller registration guide</h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center"><span className="mr-2"></span> Business information</li>
              <li className="flex items-center"><span className="mr-2"></span> Seller information</li>
              <li className="flex items-center"><span className="mr-2"></span> Billing/Payout information</li>
              {/* <li className="flex items-center"><span className="mr-2"></span> Product information</li> */}
            </ul>
            <img src="https://i.pinimg.com/1200x/ad/74/ff/ad74ff65f9fe91d0903030b96d0b0c9d.jpg" alt="Seller guide" className="mt-4 w-full h-32 sm:h-48 object-cover" />
          </div>
        </div>
      </section>

      <section className="flex flex-col md:flex-row items-start justify-between animate-fade-in">
          <div className="w-full md:w-1/4 sticky top-5 bg-white p-4 h-fit hidden sm:block">
          <ul>
            <li>
                <a href='#get-started' className={`block hover:text-dark transition duration-300 ${activeStep === 'get-started' ? 'text-dark font-bold text-2xl' : ''}`} onClick={() => setActiveStep('get-started')}>Get started</a>
            </li>
          </ul>
            <p className="text-gray-600 mb-6 animate-slide-up delay-100">5 steps to register</p>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#step1" className={`block hover:text-dark transition duration-300 ${activeStep === 'step1' ? 'text-dark font-bold text-2xl' : ''}`} onClick={() => setActiveStep('step1')} >Step 1: Provide seller information</a></li>
              <li><a href="#step2" className={`block hover:text-dark transition duration-300 ${activeStep === 'step2' ? 'text-dark font-bold text-2xl' : ''}`} onClick={() => setActiveStep('step2')}>Step 2: Provide business information</a></li>
              <li><a href="#step3" className={`block hover:text-dark transition duration-300 ${activeStep === 'step3' ? 'text-dark font-bold text-2xl' : ''}`} onClick={() => setActiveStep('step3')}>Step 3: Provide store information</a></li>
              <li><a href="#step4" className={`block hover:text-dark transition duration-300 ${activeStep === 'step4' ? 'text-dark font-bold text-2xl' : ''}`} onClick={() => setActiveStep('step4')}>Step 4: Provide billing/payout information</a></li>
              <li><a href="#step5" className={`block hover:text-dark transition duration-300 ${activeStep === 'step5' ? 'text-dark font-bold text-2xl' : ''}`} onClick={() => setActiveStep('step5')}>Step 5: Verify your identity</a></li>
              <li><a href="#configure" className={`block hover:text-dark transition duration-300 ${activeStep === 'configure' ? 'text-dark font-bold text-lg' : ''}`} onClick={() => setActiveStep('configure')}>Configure your account—and start selling</a></li>
            </ul>
          </div>
          <div className="w-full md:w-3/4 md:pl-8">
            <div id="get-started" >
                <div className="text-2xl font-bold text-gray-900 mb-4 animate-slide-up">Let’s get started</div>
            </div>
            <p className="text-gray-600 mb-6 animate-slide-up delay-100">While timelines for seller registration can vary, in many cases you’ll be able to 
              complete the process in just a few hours. Then you’ll verify your identity as the primary contact for your business, a process that usually
               takes three business days or less, depending on the validity of the provided documents.</p>
            <Modal />

            <div id="step1" className="bg-white p-4 sm:p-6 animate-scale-up delay-100 mt-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Step 1: Provide seller information</h3>
              <p className="text-gray-600 mb-2">The next information you’ll provide helps identify you as your business’s primary contact person.</p>
              <p className="text-gray-600 mb-2">Note: In step 3, you’ll provide information about the bank account your business 
                will use to receive payments from Amazon. That bank account must be in your name or the name of your business.</p>
              <p className="text-gray-600 mb-2">Use a government-issued ID like a passport to enter the following information:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li><strong>Full legal name (including middle name)</strong></li>
                <li><strong>Country of citizenship</strong></li>
                <li><strong>Country of birth</strong></li>
                <li><strong>Date of birth</strong></li>
                <li><strong>Residential address</strong></li>
              </ul>
              <p className="text-gray-600 mb-2">Next, provide your phone number.</p>
              <p style={{ fontWeight: 'bold' }} className="text-gray-600 mb-2">You must register and log in as a customer on the platform(negromart.com) and fill these information on your dashboard before going to the next step</p>
              {/* <p className="text-gray-600 mb-2">Finally, indicate whether you are a beneficial owner of the business, a legal representative of the business, or both.</p> */}
              <div className="mt-2">
                <h4 className="text-md font-semibold text-gray-700">Frequently Asked Questions</h4>
                <div className="space-y-2">
                  <details className="bg-gray-50 p-2 rounded">
                    <summary className="text-sm font-medium text-gray-800 cursor-pointer">How do I complete step one?</summary>
                    <p className="text-gray-600 mt-1">You must be a verified user(registered and logged-in user) before you create a seller account(negromart.com)</p>
                  </details>
                  {/* <details className="bg-gray-50 p-2 rounded">
                    <summary className="text-sm font-medium text-gray-800 cursor-pointer">How do I know if I’m a beneficial owner?</summary>
                    <p className="text-gray-600 mt-1">A beneficial owner is someone who owns 25% or more of the business or has significant control over it.</p>
                  </details>
                  <details className="bg-gray-50 p-2 rounded">
                    <summary className="text-sm font-medium text-gray-800 cursor-pointer">How do I know if I’m a legal representative?</summary>
                    <p className="text-gray-600 mt-1">A legal representative is authorized to act on behalf of the business, often with legal documentation.</p>
                  </details> */}
                </div>
              </div>
            </div>

            <div id="step2" className="bg-white p-4 sm:p-6 animate-scale-up mt-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Step 2: Provide business information</h3>
              <p className="text-gray-600 mb-2">The first type of information you’ll provide during registration helps us understand your business.</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li><strong>Business name:</strong> Enter the exact name used to register your business with the relevant government office(if any) for intance, Adepa Market.</li>
                <li><strong>Business type:</strong> Select the option that best describes your business, whether it’s sole proprietor, partnership, corporation, limited liability company (LLC), or non-profit. If you’re operating as an individual or your business isn’t otherwise incorporated, select Other.</li>
                {/* <li><strong>Company registration number:</strong> Enter the number you were issued when you registered your business. This unique identifier isn’t the same as your Employer Identification Number (EIN).</li> */}
                {/* <li><strong>Registered business address:</strong> Enter the address that appears on your business license.</li> */}
                <li><strong>Business email:</strong> Enter your business email, which customers can reach you</li>
                <li><strong>Phone number:</strong> Enter your phone number, including your country code.</li>
                <li><strong>Student ID(if student):</strong> Upload your student id.</li>
                <li><strong>Government issued ID(non student):</strong> Upload any government issued id(Passport, ID Card, Driver Licence).</li>
                <li><strong>Proof of address:</strong> Upload any of these(Electricity bill, bank statement)</li>
              </ul>
              <div className="mt-2">
                <h4 className="text-md font-semibold text-gray-700">Frequently Asked Questions(FAQs)</h4>
                <div className="space-y-2">
                  <details className="bg-gray-50 p-2 rounded">
                    <summary className="text-sm font-medium text-gray-800 cursor-pointer">Do I need an LLC to sell with Negromart?</summary>
                    <p className="text-gray-600 mt-1">No, an LLC is not required. You can sell as an individual or under any registered business entity.</p>
                  </details>
                  {/* <details className="bg-gray-50 p-2 rounded">
                    <summary className="text-sm font-medium text-gray-800 cursor-pointer">What if I want to sell with Negromart in other countries?</summary>
                    <p className="text-gray-600 mt-1">You can expand to other countries by registering in each market separately through Seller Central.</p>
                  </details> */}
                </div>
              </div>
            </div>

            <div id="step3" className="bg-white p-4 sm:p-6 animate-scale-up delay-100 mt-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Step 3: Provide Store information</h3>
              <p className="text-gray-600 mb-2">The next information you’ll provide helps identify you as your business’s primary contact person.</p>
              <p className="text-gray-600 mb-2">Note: In step 4, you’ll provide information about the payout/billing account your business 
                will use to receive payments from Negromart. That bank account must be in your name or the name of your business.</p>
              {/* <p className="text-gray-600 mb-2">Use a government-issued ID like a passport to enter the following information:</p> */}
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li><strong>Business address/location</strong></li>
                <li><strong>Business Logo</strong></li>
                <li><strong>Cover image</strong></li>
                <li><strong>Bio/About(tell your customers about your store)</strong></li>
                <li><strong>Facebook link(optional)</strong></li>
                <li><strong>Instagram link(optional)</strong></li>
                <li><strong>Twitter link(optional)</strong></li>
                <li><strong>Linkedin link(optional)</strong></li>
              </ul>
              <p className="text-gray-600 mb-2">Next, provide your phone number. Add an additional phone number, if necessary.</p>
              <p className="text-gray-600 mb-2">Finally, indicate whether you are a beneficial owner of the business, a legal representative of the business, or both.</p>
              {/* <div className="mt-2">
                <h4 className="text-md font-semibold text-gray-700">Frequently Asked Questions</h4>
                <div className="space-y-2">
                  <details className="bg-gray-50 p-2 rounded">
                    <summary className="text-sm font-medium text-gray-800 cursor-pointer">How do I know if I’m a beneficial owner?</summary>
                    <p className="text-gray-600 mt-1">A beneficial owner is someone who owns 25% or more of the business or has significant control over it.</p>
                  </details>
                  <details className="bg-gray-50 p-2 rounded">
                    <summary className="text-sm font-medium text-gray-800 cursor-pointer">How do I know if I’m a legal representative?</summary>
                    <p className="text-gray-600 mt-1">A legal representative is authorized to act on behalf of the business, often with legal documentation.</p>
                  </details>
                </div>
              </div> */}
            </div>

            <div id="step4" className="bg-white p-4 sm:p-6 animate-scale-up delay-200 mt-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Step 4: Provide billing/payout information</h3>
              <p className="text-gray-600 mb-2">Next, you’ll enter banking and credit card information. We use these details to process payments and expenses.</p>
              <div className="mt-2">
                <h4 className="text-md font-semibold text-gray-700">Frequently Asked Questions</h4>
                <div className="space-y-2">
                  <details className="bg-gray-50 p-2 rounded">
                    <summary className="text-sm font-medium text-gray-800 cursor-pointer">What bank account holder name should I use?</summary>
                    <p className="text-gray-600 mt-1">Use the name of the business or your personal name if operating as an individual.</p>
                  </details>
                  <details className="bg-gray-50 p-2 rounded">
                    <summary className="text-sm font-medium text-gray-800 cursor-pointer">Do I need only a bank account?</summary>
                    <p className="text-gray-600 mt-1">You can use Mobile money if you are in Africa</p>
                  </details>
                  <details className="bg-gray-50 p-2 rounded">
                    <summary className="text-sm font-medium text-gray-800 cursor-pointer">What credit card types can I use?</summary>
                    <p className="text-gray-600 mt-1">Visa and MasterCard</p>
                  </details>
                </div>
              </div>
            </div>

            {/* <div id="step5" className="bg-white p-4 sm:p-6 animate-scale-up delay-300 mt-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Step 5: Provide store and product information</h3>
              <p className="text-gray-600 mb-2">After providing payment information, you’ll enter the name of your business as you’d like it to appear on Amazon.com. We call this your "store." It will appear to customers in each of your offers and in your public seller profile.</p>
              <p className="text-gray-600 mb-2">You’ll also be prompted to provide information about your:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Product codes</li>
                <li>Business certifications</li>
                <li>Manufacturer or brand status</li>
              </ul>
              <div className="mt-2">
                <h4 className="text-md font-semibold text-gray-700">Frequently Asked Questions</h4>
                <div className="space-y-2">
                  <details className="bg-gray-50 p-2 rounded">
                    <summary className="text-sm font-medium text-gray-800 cursor-pointer">What if my store name is already being used by another seller?</summary>
                    <p className="text-gray-600 mt-1">Choose a unique variation or contact support to resolve conflicts.</p>
                  </details>
                  <details className="bg-gray-50 p-2 rounded">
                    <summary className="text-sm font-medium text-gray-800 cursor-pointer">What are product IDs—and how do I find or obtain them?</summary>
                    <p className="text-gray-600 mt-1">Product IDs (e.g., UPC, EAN) are unique codes; obtain them from manufacturers or barcode services.</p>
                  </details>
                  <details className="bg-gray-50 p-2 rounded">
                    <summary className="text-sm font-medium text-gray-800 cursor-pointer">What is Amazon Brand Registry?</summary>
                    <p className="text-gray-600 mt-1">A program to protect and manage your brand on Amazon.</p>
                  </details>
                </div>
              </div>
            </div> */}

            <div id="step5" className="bg-white p-4 sm:p-6 animate-scale-up delay-400 mt-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Step 5: Verify your identity</h3>
              <p className="text-gray-600 mb-2">After submitting store information, you’ll be prompted to upload the following documents:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Government-issued ID</li>
                <li>Proof of residential business address dated from the last 180 days, like a electricity bill or credit card or bank statement</li>
              </ul>
              <p className="text-gray-600 mb-2">Next, you’ll be prompted to do one of the following:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Take a photo of your face and government-issued ID.</li>
                <li>Join or schedule a video call with an Negromart associate. You should bring your government-issued ID and proof of residential address to the call.</li>
              </ul>
              <p className="text-gray-600 mb-2">Learn more about <a href="#" className="text-orange-500 hover:underline">identity verification</a></p>
              <p className="text-gray-600 mb-2">Prepare to sell during your verification period</p>
              <div className="mt-2">
                <h4 className="text-md font-semibold text-gray-700">Frequently Asked Questions</h4>
                <div className="space-y-2">
                  <details className="bg-gray-50 p-2 rounded">
                    <summary className="text-sm font-medium text-gray-800 cursor-pointer">What are the requirements for uploading documents?</summary>
                    <p className="text-gray-600 mt-1">Documents must be clear, valid, and within the last 180 days.</p>
                  </details>
                </div>
              </div>
            </div>

            <div id="configure" className="mt-6 sm:mt-12 bg-white p-4 sm:p-6 animate-scale-up delay-500">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Negromart seller on a laptop</h3>
              <p className="text-gray-600 mb-2">Configure your account—and start selling</p>
              <p className="text-gray-600 mb-2">After completing seller registration, you’ll receive an email or SMS withing 2-3 business days if qualified or not. 
                  And that depends on the documents you provide</p>
              {/* <p className="text-gray-600 mb-2">Before you start selling, make sure you configure your selling account for your business. Consider adding other users if you’d like help with certain tasks.</p>
              <p className="text-gray-600 mb-2">After configuring your account, you can use Seller Central to list and price products, manage inventory, fulfill customer orders, and much more.</p> */}
              <img src="https://i.pinimg.com/736x/23/ff/d1/23ffd17326ee13835ed1d537bff5a02a.jpg" alt="Video guide" className="mt-4 w-full h-32 sm:h-48 object-cover rounded-lg" />
            </div>
          </div>
        </section>
    </main>
  );
}