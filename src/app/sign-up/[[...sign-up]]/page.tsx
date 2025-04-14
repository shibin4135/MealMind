import { SignUp } from "@clerk/nextjs";
import React from "react";

const Signup = () => {
  return (
    <div className="flex justify-center items-center mt-17">
      <SignUp signInFallbackRedirectUrl={"/create-profile"} />
    </div>
  );
};

export default Signup;
