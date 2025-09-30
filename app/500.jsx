import Link from "next/link";

export default function Custom500() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6">
      {/* Illustration / Icon */}
      <div className="mb-6">
        <img src="/favicon.png" alt="Server Error" className="w-64 h-auto" />
      </div>

      {/* Title */}
      <h1 className="text-4xl font-extrabold text-gray-800 mb-3">
        Oops! Server Error
      </h1>

      {/* Message */}
      <p className="text-gray-600 mb-6 max-w-md">
        Something went wrong on our end. Please try again later or continue exploring{" "}
        <span className="font-semibold text-black">Negromart</span>.
      </p>

      {/* Buttons */}
      <div className="flex space-x-4">
        <Link
          href="/"
          className="px-5 py-3 rounded-2xl bg-black text-white font-medium hover:bg-gray-800 transition"
        >
          Back to Home
        </Link>
        <Link
          href="/"
          className="px-5 py-3 rounded-2xl border border-gray-400 text-gray-800 font-medium hover:bg-gray-100 transition"
        >
          Shop Now
        </Link>
      </div>
    </div>
  );
}
