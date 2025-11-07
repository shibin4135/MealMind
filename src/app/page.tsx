import Link from "next/link";
import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-[70px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <div className="relative z-10">
            <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-6">
              Personalized AI-Powered
              <br />
              Meal Planning
            </h1>
            <p className="mt-3 max-w-md mx-auto text-xl text-gray-600 sm:text-2xl md:mt-5 md:max-w-3xl">
              Let Our AI handle the meal planning while you focus on cooking and enjoying delicious, personalized meals.
            </p>
            <div className="mt-10 max-w-md mx-auto sm:flex sm:justify-center md:mt-12">
              <div className="rounded-md shadow">
                <Link href="/mealplan">
                  <button className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 md:py-4 md:text-lg md:px-10">
                    Get Started
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Background Effects */}
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-blue-50 to-transparent"></div>
        <div className="absolute -top-40 left-0 w-72 h-72 bg-blue-50 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -top-40 right-0 w-72 h-72 bg-indigo-50 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      {/* How it Works Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">How it Works</h2>
          <p className="text-xl text-gray-600">Three simple steps to get your personalized meal plan</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Step 1 - Create Account */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white px-6 py-8 rounded-lg shadow-lg transform group-hover:scale-[1.01] transition-all duration-200">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 text-center mb-4">Create an Account</h3>
              <p className="text-gray-600 text-center">Sign up to unlock personalized meal plans tailored just for you</p>
            </div>
          </div>

          {/* Step 2 - Set Preferences */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white px-6 py-8 rounded-lg shadow-lg transform group-hover:scale-[1.01] transition-all duration-200">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c1.657 0 3-1.567 3-3.5S13.657 1 12 1 9 2.567 9 4.5 10.343 8 12 8z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 text-center mb-4">Set Preferences</h3>
              <p className="text-gray-600 text-center">Tell us your dietary preferences and requirements</p>
            </div>
          </div>

          {/* Step 3 - Get Your Plans */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white px-6 py-8 rounded-lg shadow-lg transform group-hover:scale-[1.01] transition-all duration-200">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 16h6M9 8h6" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 text-center mb-4">Get Your Plans</h3>
              <p className="text-gray-600 text-center">Receive AI-generated meal plans customized to your needs</p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-gradient-to-b from-gray-50 to-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">
                Why Choose Our AI Meal Planner?
              </h2>
              <p className="text-xl text-gray-600">Smart features to make your meal planning effortless</p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="feature-card">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Personalized Plans</h3>
                <p className="text-gray-600">Get meal plans tailored to your dietary preferences and restrictions</p>
              </div>

              {/* Feature 2 */}
              <div className="feature-card">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Smart AI Technology</h3>
                <p className="text-gray-600">Leverage advanced AI to create balanced and nutritious meal combinations</p>
              </div>

              {/* Feature 3 */}
              <div className="feature-card">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Time-Saving</h3>
                <p className="text-gray-600">Save hours of meal planning with instant AI-generated suggestions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
