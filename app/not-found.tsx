'use client';

import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6">
      {/* Illustration / Icon */}
      <div className="mb-6">
        <img
          src="/favicon.png"
          alt="Page Not Found"
          className="w-64 h-auto animate-pulse-rotate"
        />
      </div>

      {/* Title */}
      <h1 className="text-4xl font-extrabold text-gray-800 mb-3">
        Oops! Page Not Found
      </h1>

      {/* Message */}
      <p className="text-gray-600 mb-6 max-w-md">
        Looks like this page doesn’t exist. You might want to head back to the
        homepage and start fresh at{" "}
        <span className="font-semibold text-black">Negromart</span>.
      </p>

      {/* Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={() => router.back()}
          className="px-5 py-3 rounded-2xl border border-gray-400 text-gray-800 font-medium hover:bg-gray-100 transition"
        >
          Back
        </button>
      </div>
    </div>
  );
}
