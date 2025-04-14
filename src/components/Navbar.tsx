"use client";
import "react-loading-skeleton/dist/skeleton.css";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  useUser,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Skeleton from "react-loading-skeleton";

const Navbar = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  if (!isLoaded) {
    return (
      <div>
        <p>
          <Skeleton height={40} />
        </p>
        <Skeleton width={1000} height={30} />
        <Skeleton width={850} height={20} />
      </div>
    );
  }

  return (
    <nav className="fixed top-0 left-0 bg-white w-full flex justify-between items-center h-[70px] px-6 shadow-lg">
      {/* For Image */}
      <div className="flex items-center text-[#1D4ED8] text-4xl font-bold">
        <Link href={"/"}>
          <h1>Meal Generator</h1>
        </Link>
      </div>

      {/* Links */}
      <div className="flex gap-6 items-center">
        <SignedIn>
          <div className="flex items-center gap-4">
            <Link
              href={"/mealplan"}
              className="text-[#1D4ED8] hover:text-[#2563EB] transition"
            >
              MealPlan
            </Link>
            {user?.imageUrl ? (
              <Link href={"/profle"} aria-label="Go to Profile">
                <Image
                  src={user?.imageUrl}
                  alt="Profile"
                  width={50}
                  height={50}
                  className="rounded-full"
                />
              </Link>
            ) : (
              <span className="w-10 h-10 rounded-full bg-gray-300"></span>
            )}
          </div>

          <SignOutButton>
            <button className="bg-[#1D4ED8] px-6 py-2 text-white rounded-xl hover:bg-[#2563EB] transition">
              Sign Out
            </button>
          </SignOutButton>
        </SignedIn>

        <SignedOut>
          <div className="flex items-center gap-3">
            <Link
              href={"/"}
              className="text-lg font-semibold text-gray-700 hover:text-[#1D4ED8] transition"
            >
              Home
            </Link>
            <Link
              href={"/subscribe"}
              className="text-lg font-semibold text-gray-700 hover:text-[#1D4ED8] transition"
            >
              Subscribe
            </Link>
            <button className="bg-[#1D4ED8] px-6 py-2 text-white rounded-xl hover:bg-[#2563EB] transition">
              <Link href={"/sign-up"}>Sign In</Link>
            </button>
          </div>
        </SignedOut>
      </div>
    </nav>
  );
};

export default Navbar;
