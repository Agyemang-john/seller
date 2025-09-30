import { useState } from 'react';

export default function Modal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition duration-300 animate-bounce"
        onClick={() => setIsOpen(true)}
      >
        Required information
      </button>

      {isOpen && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4 sm:mx-0 shadow-lg animate-scale-up">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h4 className="text-sm font-semibold text-gray-900">Before you create your selling account, make sure you have the following:</h4>
              <button
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setIsOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <ul className="text-sm list-disc pl-5 space-y-2 text-gray-600">
                <li>Government-issued ID or Student ID(if student)</li>
                <li>Business email address</li>
                <li>Bank account or Mobile Money account(If in Africa)</li>
                <li>Proof of residential address from the last 180 days, like a bank statement or electicity bill</li>
                {/* <li>Verify your identity with a valid ID.</li> */}
                <li>Provide billing or Payout information to start selling.</li>
                <li>Physical store location/Where items will be delivered from</li>
                <li>Both store logo and banner</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}