'use client';

import { Suspense } from 'react';
import LoginForm from "@/components/forms/LoginForm";
import useRedirectIfAuthenticated from '@/hooks/useRedirectIfAuthenticated';

function LoginContent() {
  useRedirectIfAuthenticated();
  return <LoginForm />;
}

export default function Login() {
  return (
    <Suspense fallback={<div>...</div>}>
      <LoginContent />
    </Suspense>
  );
}