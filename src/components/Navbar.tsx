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
    <nav className="fixed top-0 left-0 w-full backdrop-blur-md bg-white/75 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={"/"} className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform duration-200">
                <span className="text-white text-xl font-bold">M</span>
              </div>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-indigo-600 group-hover:to-blue-600 transition-all duration-300">
                Meal Generator
              </h1>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <SignedIn>
              <div className="flex items-center space-x-6">
                <Link
                  href={"/mealplan"}
                  className="relative text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium group"
                >
                  <span>Meal Plan</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
                </Link>
                <div className="flex items-center space-x-4">
                  <Link href={"/profle"} aria-label="Go to Profile" className="relative group">
                    {user?.imageUrl ? (
                      <div className="relative">
                        <Image
                          src={user.imageUrl}
                          alt="Profile"
                          width={40}
                          height={40}
                          className="rounded-full ring-2 ring-gray-200 transform group-hover:scale-105 transition-all duration-200"
                        />
                        <div className="absolute inset-0 rounded-full bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <span className="text-gray-600 text-sm font-medium">
                          {user?.firstName?.[0] || "U"}
                        </span>
                      </div>
                    )}
                  </Link>
                  <SignOutButton>
                    <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-indigo-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg">
                      Sign Out
                    </button>
                  </SignOutButton>
                </div>
              </div>
            </SignedIn>

            <SignedOut>
              <div className="flex items-center space-x-6">
                <Link
                  href={"/"}
                  className="relative text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium group"
                >
                  <span>Home</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
                </Link>
                <Link
                  href={"/subscribe"}
                  className="relative text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium group"
                >
                  <span>Subscribe</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
                </Link>
                <Link href={"/sign-up"}>
                  <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-indigo-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg">
                    Sign In
                  </button>
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
