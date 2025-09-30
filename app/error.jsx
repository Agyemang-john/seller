"use client";
import Link from "next/link";

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6">
          {/* Illustration / Icon */}
          <div className="mb-6">
            <img src="/favicon.png" alt="Error Occurred" className="w-64 h-auto" />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-extrabold text-gray-800 mb-3">
            Something went wrong
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-6 max-w-md">
            An unexpected error occurred while loading this page.{" "}
            <span className="font-semibold text-black">Negromart</span>.
          </p>

          {/* Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => reset()}
              className="px-5 py-3 rounded-2xl bg-black text-white font-medium hover:bg-gray-800 transition"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="px-5 py-3 rounded-2xl border border-gray-400 text-gray-800 font-medium hover:bg-gray-100 transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
