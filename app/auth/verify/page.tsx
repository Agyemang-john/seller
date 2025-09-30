
import { Metadata } from "next";
import { Suspense } from 'react';
import OtpForm from "@/components/forms/OtpForm";
import { generateMetadata } from "@/utils/metadata";

export const metadata: Metadata = generateMetadata("Verify", "");



const Login = () => {
  return (
    <Suspense fallback={<div>Loading verify...</div>}>
      <OtpForm />
    </Suspense>
  )
  
};

export default Login;