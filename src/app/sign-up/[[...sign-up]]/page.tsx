import { SignUp } from "@clerk/nextjs";
import React from "react";

const Signup = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
      <SignUp signInFallbackRedirectUrl={"/create-profile"} />
    </div>
  );
};

export default Signup;
