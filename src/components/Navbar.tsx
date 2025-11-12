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
      <nav className="fixed top-0 left-0 w-full border-b border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl z-50 shadow-sm">
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
    <nav className="fixed top-0 left-0 w-full border-b border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative w-9 h-9 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 shadow-lg">
                <span className="text-white text-sm font-bold">M</span>
              </div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent group-hover:from-emerald-500 group-hover:to-teal-500 transition-all duration-300">
              MealMind
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2 sm:gap-4">
            <SignedIn>
              <div className="hidden md:flex items-center gap-1 lg:gap-2">
                <Link
                  href="/dashboard"
                  className="px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg transition-all duration-200"
                >
                  Dashboard
                </Link>
                <Link
                  href="/meals"
                  className="px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg transition-all duration-200"
                >
                  Meals
                </Link>
                <Link
                  href="/mealplan"
                  className="px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg transition-all duration-200"
                >
                  Meal Plan
                </Link>
                <Link
                  href="/favorites"
                  className="px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg transition-all duration-200"
                >
                  Favorites
                </Link>
                <Link
                  href="/saved-meal-plans"
                  className="px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg transition-all duration-200"
                >
                  Saved Plans
                </Link>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Link href="/profle" aria-label="Go to Profile" className="shrink-0 group">
                  {user?.imageUrl ? (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                      <Image
                        src={user.imageUrl}
                        alt="Profile"
                        width={36}
                        height={36}
                        className="relative rounded-full border-2 border-slate-200 dark:border-slate-800 group-hover:border-emerald-500 dark:group-hover:border-emerald-400 transition-all duration-300 transform group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                      <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center border-2 border-slate-200 dark:border-slate-800 group-hover:border-emerald-500 dark:group-hover:border-emerald-400 transition-all duration-300 transform group-hover:scale-105 shadow-md">
                        <span className="text-white text-xs font-semibold">
                          {user?.firstName?.[0] || "U"}
                        </span>
                      </div>
                    </div>
                  )}
                </Link>
                <SignOutButton>
                  <Button variant="ghost" size="sm" className="h-9 text-xs sm:text-sm hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20">
                    Sign Out
                  </Button>
                </SignOutButton>
              </div>
            </SignedIn>

            <SignedOut>
              <div className="flex items-center gap-2 sm:gap-4">
                <Link
                  href="/"
                  className="px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg transition-all duration-200"
                >
                  Home
                </Link>
                <Link href="/subscribe">
                  <Button variant="ghost" size="sm" className="h-9 text-xs sm:text-sm hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20">
                    Pricing
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm" className="h-9 text-xs sm:text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                    Sign In
                  </Button>
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
