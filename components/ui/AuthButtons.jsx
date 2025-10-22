'use client';

import React from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useRouter } from 'next/navigation';

export default function AuthButtons() {
  const router = useRouter();
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  return (
    <div className="flex items-center gap-3">
      {isAuthenticated ? (
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-black text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full hover:bg-gray-700 transition duration-300"
        >
          Dashboard
        </button>
      ) : (
        <>
          <button
            onClick={() => router.push('/auth/login')}
            className="text-sm sm:text-base text-gray-600 hover:text-gray-900 transition duration-300"
          >
            Log in
          </button>
          <button
            onClick={() => router.push('/register')}
            className="bg-black text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full hover:bg-gray-600 transition duration-300 animate-bounce"
          >
            Sign up
          </button>
        </>
      )}
    </div>
  );
}
