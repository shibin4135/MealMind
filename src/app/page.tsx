import Link from "next/link";
import React from "react";

const Home = () => {
  return (
    <div className="text-white flex flex-col h-screen py-14 items-center">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 w-[80%] flex flex-col gap-4 justify-center items-center py-9 rounded-lg shadow-xl mt-10">
        <h1 className="text-4xl font-semibold">Personalized AI in Meals</h1>
        <p className="text-lg text-center px-4">
          Let Our AI do the planning. You focus on cooking and enjoying.
        </p>
        <button className="mt-4 py-2 px-6 bg-white text-blue-600 rounded-md ">
          <Link href={"/mealplan"}> Get Started</Link>
        </button>
      </div>

      <div className="flex flex-col gap-3 items-center text-black mt-6">
        <h1 className="font-bold text-3xl">How it Works</h1>
        <p>Follow These Steps to get your personalized initial plan</p>

        <div className="grid md:grid-cols-3 grid-cols-1 gap-4 mt-4">
          {/* Step 1 - Create Account */}
          <div className="flex flex-col gap-3 w-[400px] items-center shadow-lg h-[300px] justify-center p-6 rounded-lg hover:shadow-xl transition">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="#3b82f6"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
            <Link href={"/sign-up"} className="text-2xl font-medium">
              Create an Account
            </Link>
            <p className="text-center">
              Sign Up or Sign in to access your personalized meal plans
            </p>
          </div>

          {/* Step 2 - Set Preferences */}
          <div className="flex flex-col gap-3 w-[400px] items-center shadow-lg h-[300px] justify-center p-6 rounded-lg hover:shadow-xl transition">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="#3b82f6"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
              />
            </svg>
            <Link href={"/sign-up"} className="text-2xl font-medium">
              Set Your Preferences
            </Link>
            <p className="text-center">
              Input your dietary preferences and goals to tailor your meal plans
            </p>
          </div>

          {/* Step 3 - Receive Meal Plan */}
          <div className="flex flex-col gap-3 w-[400px] items-center shadow-lg h-[300px] justify-center p-6 rounded-lg hover:shadow-xl transition">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="#3b82f6"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <Link href={"/sign-up"} className="text-2xl font-medium">
              Receive Your Meal Plan
            </Link>
            <p className="text-center">
              Get your customized meal plan delivered weekly to your account
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
