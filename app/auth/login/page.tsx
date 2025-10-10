
import { Metadata } from "next";
import { Suspense } from 'react';
import LoginForm from "@/components/forms/LoginForm";
import { generateMetadata } from "@/utils/metadata";

export const metadata: Metadata = generateMetadata("Login", "");



const Login = () => {
  return (
    <Suspense fallback={<div>...</div>}>
      <LoginForm />
    </Suspense>
  )
  
};

export default Login;