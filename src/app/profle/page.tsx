"use client";
import { MealPlans } from "@/lib/Plans";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface UpdateResponse {
  message: string; // Corrected 'meassage' to 'message'
}

const Profile = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [selectedOption, setSelectedOption] = useState("");

  const queryClient = useQueryClient();

  const fetchSubcriptionStatus = async () => {
    try {
      const response = await fetch("api/subscription-status");
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error fetching subscription details");
    }
  };

  const updateSubscriptionStatus = async () => {
    try {
      const response = await fetch("api/change-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPlan: selectedOption }),
      });
      const data = await response.json();
      return data.message; // Assuming the backend response has a message key
    } catch (error) {
      console.log("Error updating subscription status", error);
    }
  };

  const { data } = useQuery({
    queryKey: ["subscription"],
    queryFn: fetchSubcriptionStatus,
    staleTime: 5 * 60 * 1000,
  });

  const { data: updateMessage, isPending, mutate } = useMutation<UpdateResponse, Error, string>({
    mutationFn: updateSubscriptionStatus,

    onSuccess: (data) => {
      toast.success(data.message); // Corrected here
      queryClient.invalidateQueries({
        queryKey: ["subscription"],
      });
    },

    onError: (error: Error) => {
      toast.error("Failed to update subscription.");
    },
  });

  const handleUpdateSubscription = () => {
    if (!selectedOption) {
      alert("Please select a plan to update");
      return;
    }
    mutate(selectedOption);
  };

  const currentPlan = MealPlans.find(
    (plan) => plan.interval === data?.subscription?.subscrptionTier
  );

  const cancelSubscription = async () => {
    try {
      const response = await fetch("/api/cancel-plan", {
        method: "DELETE",
        headers: {
          "Content-type": "application/json",
        },
      });
      const data = await response.json();
      return data.message;
    } catch (error) {
      console.log("Error cancelling subscription", error);
    }
  };

  const { isPending: deleteIsPending, mutate: deleteMutation } = useMutation<UpdateResponse, Error>({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      toast.success("Subscription cancelled");
      queryClient.invalidateQueries({
        queryKey: ["subscription"],
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to cancel the subscription");
    },
  });

  useEffect(() => {
    if (currentPlan) {
      setSelectedOption(currentPlan?.interval);
    }
  }, [currentPlan]);

  if (!isLoaded)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        Loading Your Profile...
      </div>
    );

  if (!isSignedIn)
    return (
      <div className="text-center text-lg">
        Please sign in to view your profile.
      </div>
    );

  const handleDelete = () => {
    deleteMutation();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-emerald-500 max-w-7xl w-full p-6 rounded-lg shadow-lg flex justify-center items-center">
        <div className="flex flex-col lg:flex-row items-center gap-6 w-full">
          {/* Left Section: Profile Image & Info */}
          <div className="bg-emerald-800 text-white p-6 rounded-xl flex flex-col justify-center items-center gap-4 w-full lg:w-1/3">
            {user.imageUrl && (
              <Image
                src={user.imageUrl}
                alt="profile"
                width={100}
                height={100}
                className="rounded-full border-4 border-white"
              />
            )}
            <h1 className="text-3xl font-semibold">{user?.fullName}</h1>
            <p className="text-lg font-medium">{user?.emailAddresses[0].emailAddress}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md w-full lg:w-2/3">
            <h2 className="text-2xl font-semibold mb-4">Subscription Details</h2>
            <div className="flex flex-col gap-2 shadow-xl border-red-500 border rounded-lg py-3 px-2">
              {currentPlan ? (
                <>
                  <h1 className="text-xl text-emerald-700 font-bold">Current Plan</h1>
                  <span>
                    <strong>Plan</strong>: {currentPlan?.interval} Plan
                  </span>
                  <span>
                    <strong>Amount</strong>: ${currentPlan?.amount} USD
                  </span>
                  <span>
                    <strong>Status</strong>: {data?.subscription?.subcriptionIsActive ? "ACTIVE" : "INACTIVE"}
                  </span>
                </>
              ) : (
                <p className="text-red-500 font-bold">No Active Plan</p>
              )}
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg py-4 px-2">
            <h1 className="text-md font-bold text-center mb-2">Change Subscription Plan</h1>
            <select value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}>
              <option value="" disabled>Select The new Plan</option>
              {MealPlans.map((plan) => {
                return (
                  <option value={plan.interval} key={plan.name}>
                    {plan.name} - {plan.amount} / {plan.interval}
                  </option>
                );
              })}
            </select>
            <button
              className="mt-3 w-full bg-emerald-500 text-white rounded-lg shadow-md px-2 py-2"
              disabled={isPending}
              onClick={handleUpdateSubscription}
            >
              {isPending ? "Updating...." : "Save Changes"}
            </button>
            <button onClick={handleDelete} disabled={deleteIsPending}>
              {deleteIsPending ? "Cancelling..." : "Cancel Subscription"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
