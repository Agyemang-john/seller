'use client';

import Link from 'next/link';
import { useState } from 'react';
// import { useRouter } from 'next/navigation';
import AuthButtons from './AuthButtons';


export default function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // const router = useRouter()


  return (
    <header className="bg-white shadow-sm relative">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            className="sm:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          <Link href="/" className="text-xl sm:text-2xl font-bold text-gray-900 animate-pulse">Negromart</Link>
        </div>
        <div className="hidden sm:flex items-center space-x-4">
          <Link href="/register" className="text-sm sm:text-base text-gray-600 hover:text-gray-900 transition duration-300">Start</Link>
          <Link href="/" className="text-sm sm:text-base text-gray-600 hover:text-gray-900 transition duration-300">Grow</Link>
          <Link href="https://corporate.negromart.com/services" target="_blank" rel="noopener noreferrer" className="text-sm sm:text-base text-gray-600 hover:text-gray-900 transition duration-300">Services</Link>
          <Link href="/" className="text-sm sm:text-base text-gray-600 hover:text-gray-900 transition duration-300">Resources</Link>
          <Link href="/" className="text-sm sm:text-base text-gray-600 hover:text-gray-900 transition duration-300">Pricing</Link>
        </div>
        <div className="flex items-center space-x-4">
          <AuthButtons />
        </div>
      </nav>

      {/* Sidebar for small devices */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-50 sm:hidden`}
      >
        <div className="p-4">
          <button
            className="text-gray-600 hover:text-gray-900 focus:outline-none mb-4"
            onClick={() => setIsSidebarOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <nav className="flex flex-col space-y-4">
            <Link href="/register" className="text-sm text-gray-600 hover:text-gray-900 transition duration-300" onClick={() => setIsSidebarOpen(false)}>Start</Link>
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition duration-300" onClick={() => setIsSidebarOpen(false)}>Grow</Link>
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition duration-300" onClick={() => setIsSidebarOpen(false)}>Services</Link>
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition duration-300" onClick={() => setIsSidebarOpen(false)}>Resources</Link>
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition duration-300" onClick={() => setIsSidebarOpen(false)}>Pricing</Link>
          </nav>
        </div>
      </div>

      {/* Overlay to close sidebar when clicking outside */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-transparent bg-opacity-50 shadow-md z-50 sm:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </header>
  );
}