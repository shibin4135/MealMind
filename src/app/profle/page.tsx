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
import { ConfirmationDialog } from "@/components/confirmation-dialog";

interface UpdateResponse {
  message: string;
}

const Profile = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [selectedOption, setSelectedOption] = useState("");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

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

  const deleteMutation = useMutation<UpdateResponse, Error>({
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
      <div className="flex justify-center items-center h-screen bg-background pt-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );

  if (!isSignedIn)
    return (
      <div className="flex justify-center items-center h-screen bg-background text-foreground pt-20 px-4">
        <Card className="max-w-md border border-border bg-muted/10">
          <CardHeader>
            <CardTitle className="text-foreground">Sign In Required</CardTitle>
            <CardDescription className="text-muted-foreground">Please sign in to view your profile.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );

  const handleDelete = () => {
    setCancelDialogOpen(true);
  };

  const confirmCancel = () => {
    deleteMutation.mutate();
    setCancelDialogOpen(false);
  };

  return (
    <>
      <ConfirmationDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={confirmCancel}
        title="Cancel Subscription"
        description="Are you sure you want to cancel your subscription? You'll continue to have access until the end of your billing period."
        confirmText="Cancel Subscription"
        cancelText="Keep Subscription"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          {/* Profile Header */}
          <Card className="border border-border bg-muted/10 hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4 sm:gap-6">
                {user?.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    alt="Profile"
                    width={80}
                    height={80}
                    className="rounded-full border-2 border-border shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted flex items-center justify-center border-2 border-border shrink-0">
                    <span className="text-xl sm:text-2xl font-semibold text-muted-foreground">
                      {user?.firstName?.[0] || "U"}
                    </span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-foreground break-words">
                    {user?.fullName}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base mt-1 break-words text-muted-foreground">
                    {user?.emailAddresses[0]?.emailAddress}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

        {/* Subscription Details */}
        <Card className="border border-border bg-muted/10 hover:shadow-lg transition-all duration-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl text-foreground">Subscription Details</CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground">Manage your subscription and billing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentPlan ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Plan</p>
                    <p className="text-xl font-semibold text-foreground mt-1">
                      {currentPlan.name}
                    </p>
                  </div>
                  <Badge variant={data?.isSubscribed ? "default" : "secondary"}>
                    {data?.isSubscribed ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <Separator className="bg-border" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="text-lg font-semibold text-foreground mt-1">
                      ${currentPlan.amount} / {currentPlan.interval}
                    </p>
                  </div>
                  {data?.subscription?.stripeSubscriptionId && (
                    <div>
                      <p className="text-sm text-muted-foreground">Subscription ID</p>
                      <p className="text-sm font-mono text-foreground mt-1 truncate">
                        {data.subscription.stripeSubscriptionId}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No active subscription</p>
                <Button className="mt-4 rounded-xl" asChild>
                  <a href="/subscribe">View Plans</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Change Plan */}
        {currentPlan && (
          <Card className="border border-border bg-muted/10 hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl text-foreground">Change Subscription Plan</CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground">Upgrade or downgrade your plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-foreground">Select Plan</label>
                <Select value={selectedOption} onValueChange={setSelectedOption}>
                  <SelectTrigger className="h-10 sm:h-11 bg-background border-border rounded-xl">
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border rounded-xl">
                    {MealPlans.map((plan) => (
                      <SelectItem key={plan.name} value={plan.interval} className="text-sm rounded-lg">
                        {plan.name} - ${plan.amount} / {plan.interval}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleUpdateSubscription}
                disabled={isPending || !selectedOption}
                className="w-full h-10 sm:h-11 text-sm sm:text-base font-medium rounded-xl"
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
          <Card className="border border-destructive/50 bg-destructive/10 hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl text-destructive">Cancel Subscription</CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                Cancel your subscription at any time. You'll continue to have access until the end of your billing period.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="w-full h-10 sm:h-11 text-sm sm:text-base font-medium rounded-xl"
              >
                {deleteMutation.isPending ? (
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
    </>
  );
};

export default Profile;
