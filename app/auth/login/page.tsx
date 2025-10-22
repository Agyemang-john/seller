'use client';

import { Suspense } from 'react';
import LoginForm from "@/components/forms/LoginForm";
import useRedirectIfAuthenticated from '@/hooks/useRedirectIfAuthenticated';


const Login = () => {
  useRedirectIfAuthenticated();

  return (
    <Suspense fallback={<div>...</div>}>
      <LoginForm />
    </Suspense>
  )
  
};

export default Login;