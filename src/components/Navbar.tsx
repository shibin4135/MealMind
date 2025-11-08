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
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  
  if (!isLoaded) {
    return (
      <nav className="fixed top-0 left-0 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Skeleton height={24} width={120} />
            <Skeleton height={40} width={100} />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-slate-900 rounded-md flex items-center justify-center">
              <span className="text-white text-sm font-semibold">M</span>
            </div>
            <span className="text-lg font-semibold text-slate-900">MealPlanner</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <SignedIn>
              <div className="flex items-center space-x-4">
                <Link
                  href="/mealplan"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Meal Plan
                </Link>
                <Link href="/profle" aria-label="Go to Profile">
                  {user?.imageUrl ? (
                    <Image
                      src={user.imageUrl}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="rounded-full border border-slate-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                      <span className="text-slate-600 text-xs font-medium">
                        {user?.firstName?.[0] || "U"}
                      </span>
                    </div>
                  )}
                </Link>
                <SignOutButton>
                  <Button variant="ghost" size="sm">
                    Sign Out
                  </Button>
                </SignOutButton>
              </div>
            </SignedIn>

            <SignedOut>
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Home
                </Link>
                <Link href="/subscribe">
                  <Button variant="ghost" size="sm">
                    Pricing
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm">Sign In</Button>
                </Link>
              </div>
            </SignedOut>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
