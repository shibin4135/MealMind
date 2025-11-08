"use client";
import { MealPlans } from "@/lib/Plans";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

interface UpdateResponse {
  message: string;
}

const Profile = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [selectedOption, setSelectedOption] = useState("");

  const queryClient = useQueryClient();

  const fetchSubcriptionStatus = async () => {
    try {
      if (!user?.id) return null;
      const response = await fetch(`/api/check-subscription?userId=${user.id}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error fetching subscription details");
    }
  };

  const updateSubscriptionStatus = async (newPlan: string) => {
    const response = await fetch(`/api/change-plan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newPlan }),
    });

    const data = await response.json();

    if (!response.ok) {
      const error: any = new Error(data.message || "Failed to update subscription");
      error.response = response;
      throw error;
    }

    return data;
  };

  const { data } = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: fetchSubcriptionStatus,
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { isPending, mutate } = useMutation<UpdateResponse, Error, string>({
    mutationFn: updateSubscriptionStatus,
    onSuccess: (data) => {
      toast.success(data.message || "Plan updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["subscription"],
      });
    },
    onError: async (error: any) => {
      let errorMessage = "Failed to update subscription";
      try {
        if (error.response) {
          const errorData = await error.response.json();
          errorMessage = errorData.message || errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }
      } catch (e) {
        // If parsing fails, use default message
      }
      toast.error(errorMessage);
    },
  });

  const handleUpdateSubscription = () => {
    if (!selectedOption) {
      toast.error("Please select a plan to update to");
      return;
    }
    if (selectedOption === currentPlan?.interval) {
      toast.error("You are already on this plan");
      return;
    }
    mutate(selectedOption);
  };

  const currentPlan = MealPlans.find(
    (plan) => plan.interval === data?.subscription?.tier
  );

  const cancelSubscription = async () => {
    const response = await fetch("/api/cancel-plan", {
      method: "DELETE",
      headers: {
        "Content-type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const error: any = new Error(data.message || "Failed to cancel subscription");
      error.response = response;
      throw error;
    }

    return data;
  };

  const { isPending: deleteIsPending, mutate: deleteMutation } = useMutation<UpdateResponse, Error>({
    mutationFn: cancelSubscription,
    onSuccess: (data) => {
      toast.success(data.message || "Subscription cancelled successfully");
      queryClient.invalidateQueries({
        queryKey: ["subscription"],
      });
    },
    onError: async (error: any) => {
      let errorMessage = "Failed to cancel the subscription";
      try {
        if (error.response) {
          const errorData = await error.response.json();
          errorMessage = errorData.message || errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }
      } catch (e) {
        // If parsing fails, use default message
      }
      toast.error(errorMessage);
    },
  });

  useEffect(() => {
    if (currentPlan) {
      setSelectedOption(currentPlan?.interval);
    }
  }, [currentPlan]);

  if (!isLoaded)
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );

  if (!isSignedIn)
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-slate-950">
        <Card className="max-w-md border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to view your profile.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );

  const handleDelete = () => {
    if (confirm("Are you sure you want to cancel your subscription? You'll continue to have access until the end of your billing period.")) {
      deleteMutation();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <div className="flex items-center gap-4">
              {user?.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="rounded-full border-2 border-slate-200 dark:border-slate-800"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-slate-200 dark:border-slate-800">
                  <span className="text-2xl font-semibold text-slate-600 dark:text-slate-400">
                    {user?.firstName?.[0] || "U"}
                  </span>
                </div>
              )}
              <div>
                <CardTitle className="text-2xl">{user?.fullName}</CardTitle>
                <CardDescription className="text-base mt-1">
                  {user?.emailAddresses[0]?.emailAddress}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Subscription Details */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
            <CardDescription>Manage your subscription and billing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentPlan ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Current Plan</p>
                    <p className="text-xl font-semibold text-slate-900 dark:text-slate-50 mt-1">
                      {currentPlan.name}
                    </p>
                  </div>
                  <Badge variant={data?.isSubscribed ? "default" : "secondary"}>
                    {data?.isSubscribed ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Amount</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-1">
                      ${currentPlan.amount} / {currentPlan.interval}
                    </p>
                  </div>
                  {data?.subscription?.stripeSubscriptionId && (
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Subscription ID</p>
                      <p className="text-sm font-mono text-slate-900 dark:text-slate-50 mt-1 truncate">
                        {data.subscription.stripeSubscriptionId}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-600 dark:text-slate-400">No active subscription</p>
                <Button className="mt-4" asChild>
                  <a href="/subscribe">View Plans</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Change Plan */}
        {currentPlan && (
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle>Change Subscription Plan</CardTitle>
              <CardDescription>Upgrade or downgrade your plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900 dark:text-slate-50">Select Plan</label>
                <Select value={selectedOption} onValueChange={setSelectedOption}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {MealPlans.map((plan) => (
                      <SelectItem key={plan.name} value={plan.interval}>
                        {plan.name} - ${plan.amount} / {plan.interval}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleUpdateSubscription}
                disabled={isPending || !selectedOption}
                className="w-full"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Plan"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Cancel Subscription */}
        {currentPlan && data?.isSubscribed && (
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader>
              <CardTitle className="text-red-900 dark:text-red-400">Cancel Subscription</CardTitle>
              <CardDescription>
                Cancel your subscription at any time. You'll continue to have access until the end of your billing period.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteIsPending}
                className="w-full"
              >
                {deleteIsPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Cancel Subscription"
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Profile;
