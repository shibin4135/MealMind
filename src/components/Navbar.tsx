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
import { ThemeToggle } from "@/components/theme-toggle";

const Navbar = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  
  if (!isLoaded) {
    return (
      <nav className="fixed top-0 left-0 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-50">
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
    <nav className="fixed top-0 left-0 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-slate-900 dark:bg-slate-50 rounded-md flex items-center justify-center">
              <span className="text-white dark:text-slate-900 text-sm font-semibold">M</span>
            </div>
            <span className="text-lg font-semibold text-slate-900 dark:text-slate-50">MealMind</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2 sm:gap-4">
            <SignedIn>
              <div className="hidden md:flex items-center gap-3 lg:gap-4">
                <Link
                  href="/dashboard"
                  className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/meals"
                  className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
                >
                  Meals
                </Link>
                <Link
                  href="/mealplan"
                  className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
                >
                  Meal Plan
                </Link>
                <Link
                  href="/favorites"
                  className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
                >
                  Favorites
                </Link>
                <Link
                  href="/saved-meal-plans"
                  className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
                >
                  Saved Plans
                </Link>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <ThemeToggle />
                <Link href="/profle" aria-label="Go to Profile" className="shrink-0">
                  {user?.imageUrl ? (
                    <Image
                      src={user.imageUrl}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="rounded-full border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                      <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">
                        {user?.firstName?.[0] || "U"}
                      </span>
                    </div>
                  )}
                </Link>
                <SignOutButton>
                  <Button variant="ghost" size="sm" className="h-8 sm:h-9 text-xs sm:text-sm">
                    Sign Out
                  </Button>
                </SignOutButton>
              </div>
            </SignedIn>

            <SignedOut>
              <div className="flex items-center gap-2 sm:gap-4">
                <Link
                  href="/"
                  className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
                >
                  Home
                </Link>
                <Link href="/subscribe">
                  <Button variant="ghost" size="sm" className="h-8 sm:h-9 text-xs sm:text-sm">
                    Pricing
                  </Button>
                </Link>
                <ThemeToggle />
                <Link href="/sign-up">
                  <Button size="sm" className="h-8 sm:h-9 text-xs sm:text-sm">Sign In</Button>
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
