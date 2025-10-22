'use client';

import { Metadata } from "next";
import { Suspense } from 'react';
import LoginForm from "@/components/forms/LoginForm";
import { generateMetadata } from "@/utils/metadata";
import useRedirectIfAuthenticated from '@/hooks/useRedirectIfAuthenticated';

export const metadata: Metadata = generateMetadata("Login", "");

const Login = () => {
  useRedirectIfAuthenticated();

  return (
    <Suspense fallback={<div>...</div>}>
      <LoginForm />
    </Suspense>
  )
  
};

export default Login;