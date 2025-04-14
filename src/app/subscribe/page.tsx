"use client";

import { MealPlans } from "@/lib/Plans";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React from "react";
import toast from "react-hot-toast";

type SubscribeResponse = {
  url: string;
  message?: string;
};

export const subscribe = async (planType: string, userId: string, email: string): Promise<SubscribeResponse> => {
  try {
    const response = await fetch("http://localhost:3000/api/checkout", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ planType, userId, email }),
    });
    const data = await response.json();
    return data as SubscribeResponse;
  } catch (error: any) {
    toast.error(error.message)
    throw new Error(error.message)
  }
};

const Subscribe = () => {
  const { user } = useUser();
  const userId = user?.id;
  const email = user?.emailAddresses[0]?.emailAddress;

  const { isPending, mutate } = useMutation<SubscribeResponse, Error, { planType: string; userId: string; email: string }>({
    mutationFn: ({ planType, userId, email }) => subscribe(planType, userId, email),
    onSuccess: (data) => {
      window.location.href = data.url;
    },
  });

  const handleSubscribe = (planType: string) => {
    if (userId && email) {
      mutate({ planType, userId, email });
    }
  };

  return (
    <div className="flex justify-center items-center py-32 flex-col">
      <h1 className="text-3xl font-bold text-center mb-5">Pricing</h1>
      <p className="text-center text-lg mb-10">
        Get started with our weekly plan or upgrade to monthly or yearly when
        you’re ready.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl w-full">
        {MealPlans.map((meal) => {
          return (
            <div
              key={meal.amount}
              className={`${meal.isPopular
                ? "bg-yellow-50 border-2 border-yellow-500"
                : "bg-white"
                } shadow-xl p-6 rounded-xl space-y-5 transition-all duration-300 hover:shadow-2xl hover:scale-105 relative`}
            >
              {/* Most Popular Badge */}
              {meal.isPopular && (
                <div className="absolute top-3 right-3 bg-yellow-500 text-white py-1 px-4 rounded-lg text-xs font-semibold">
                  Most Popular
                </div>
              )}

              <h2 className="font-bold text-xl text-center">{meal.name}</h2>
              <h3 className="text-2xl font-bold text-center">
                ${meal.amount}
                <span className="text-sm text-gray-500">/{meal.interval}</span>
              </h3>
              <p className="text-center text-gray-700">{meal.description}</p>

              <ul className="space-y-2">
                {meal.features.map((m, index) => {
                  return (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 text-emerald-500"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                      {m}
                    </li>
                  );
                })}
              </ul>

              {/* Subscribe Button */}
              <button
                className={`${meal.interval === "month"
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  } mt-6 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium transition-colors duration-300`}
                onClick={() => handleSubscribe(meal.interval)} // Pass plan type to the function
              >
                {isPending ? "Processing" : (meal.isPopular
                  ? "Choose a Plan"
                  : `Subscribe to ${meal.name}`)}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Subscribe;
