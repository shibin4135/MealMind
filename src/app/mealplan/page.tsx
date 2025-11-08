"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, AlertCircle, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

interface MealPlanProps {
  dietType: string;
  calories: string;
  cuisines: string;
  allergies: string;
  snacks: string;
  days?: number;
}

type dayType = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface DailyMealPlan {
  Breakfast: string;
  Lunch: string;
  Dinner: string;
  Snacks?: string;
}

interface MealTypeResponse {
  error?: string;
  code?: string;
  mealPlan?: { [days in dayType[number]]: DailyMealPlan }
}

const MealPlan = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  // Check subscription status
  const { data: subscriptionData, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await fetch(`/api/check-subscription?userId=${user.id}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!user?.id && isLoaded,
    staleTime: 5 * 60 * 1000,
  });

  const generateMealPlan = async (payload: MealPlanProps): Promise<MealTypeResponse> => {
    const response = await fetch("/api/meal-plan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const error: any = new Error(data.error || "Failed to generate meal plan");
      error.code = data.code;
      error.response = response;
      throw error;
    }

    return data;
  };

  const { mutate, data, isPending, error } = useMutation<MealTypeResponse, any, MealPlanProps>({
    mutationFn: generateMealPlan,
    onSuccess: (data) => {
      toast.success("Meal plan generated successfully!");
    },
    onError: (error: any) => {
      let errorMessage = "Failed to generate meal plan";
      
      if (error.code === "UNAUTHORIZED") {
        errorMessage = "Please sign in to generate a meal plan";
        router.push("/sign-up");
      } else if (error.code === "SUBSCRIPTION_REQUIRED") {
        errorMessage = "You need an active subscription to generate meal plans";
        router.push("/subscribe");
      } else if (error.code === "RATE_LIMIT_EXCEEDED") {
        errorMessage = "Service is busy. Please try again in a few moments.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!isSignedIn) {
      toast.error("Please sign in to generate a meal plan");
      router.push("/sign-up");
      return;
    }

    if (!subscriptionData?.isSubscribed) {
      toast.error("You need an active subscription to generate meal plans");
      router.push("/subscribe");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const snacksChecked = formData.get("snacks") === "on";
    const payload: MealPlanProps = {
      dietType: formData.get("dietType") as string,
      calories: formData.get("calories") as string,
      cuisines: formData.get("cuisines") as string,
      allergies: formData.get("allergies") as string,
      snacks: snacksChecked ? "yes" : "",
      days: 7,
    };
    mutate(payload);
  };

  // Loading state
  if (!isLoaded || isLoadingSubscription) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-amber-600" />
              </div>
              <CardTitle className="text-2xl">Sign In Required</CardTitle>
              <CardDescription className="text-base mt-2">
                You need to be signed in to generate personalized meal plans.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg">
                  <Link href="/sign-up">Sign In</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/">Go to Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // No active subscription
  if (!subscriptionData?.isSubscribed) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Subscription Required</CardTitle>
              <CardDescription className="text-base mt-2">
                You need an active subscription to generate AI-powered meal plans. Choose a plan that works for you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg">
                  <Link href="/subscribe">View Plans</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/">Go to Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            AI Meal Plan Generator
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Create personalized weekly meal plans tailored to your dietary preferences and goals
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Card */}
          <Card className="lg:col-span-1 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Your Preferences</CardTitle>
              <CardDescription>
                Tell us about your dietary needs and we'll create a custom meal plan for you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="dietType" className="text-sm font-semibold">
                    Diet Type <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dietType"
                    name="dietType"
                    placeholder="e.g. vegetarian, vegan, keto, paleo"
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calories" className="text-sm font-semibold">
                    Daily Calories <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="calories"
                    name="calories"
                    type="number"
                    placeholder="e.g. 2000"
                    required
                    min="1000"
                    max="5000"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cuisines" className="text-sm font-semibold">
                    Preferred Cuisines
                  </Label>
                  <Input
                    id="cuisines"
                    name="cuisines"
                    placeholder="e.g. Italian, Indian, Mexican, Asian"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergies" className="text-sm font-semibold">
                    Allergies / Exclusions
                  </Label>
                  <Input
                    id="allergies"
                    name="allergies"
                    placeholder="e.g. peanuts, gluten, dairy, shellfish"
                    className="h-11"
                  />
                </div>

                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="snacks"
                    name="snacks"
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-950"
                  />
                  <Label htmlFor="snacks" className="cursor-pointer text-sm font-medium">
                    Include snacks in the meal plan
                  </Label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-semibold" 
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Plan...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Meal Plan
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results Area */}
          <div className="lg:col-span-2">
            <Card className="min-h-[500px] shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Your Weekly Meal Plan</CardTitle>
                <CardDescription>
                  {data?.mealPlan 
                    ? "Your personalized meal plan is ready!" 
                    : "Fill out the form to generate your personalized weekly meal plan."
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!data?.mealPlan && !isPending && !error && (
                  <div className="flex flex-col items-center justify-center h-96 text-center">
                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                      <Sparkles className="h-10 w-10 text-slate-400" />
                    </div>
                    <p className="text-lg font-medium text-slate-900 mb-2">
                      Ready to get started?
                    </p>
                    <p className="text-slate-600 max-w-md">
                      Fill out the form on the left with your dietary preferences and click "Generate Meal Plan" to create your personalized weekly meal plan.
                    </p>
                  </div>
                )}

                {isPending && (
                  <div className="flex flex-col items-center justify-center h-96">
                    <Loader2 className="h-12 w-12 animate-spin text-slate-400 mb-4" />
                    <p className="text-lg font-medium text-slate-900 mb-2">
                      Generating your meal plan...
                    </p>
                    <p className="text-sm text-slate-500">
                      This may take a few moments
                    </p>
                  </div>
                )}

                {error && (
                  <div className="flex flex-col items-center justify-center h-96 text-center">
                    <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
                      <AlertCircle className="h-10 w-10 text-red-600" />
                    </div>
                    <p className="text-lg font-semibold text-slate-900 mb-2">
                      {error.code === "RATE_LIMIT_EXCEEDED" 
                        ? "Service Busy" 
                        : "Something went wrong"
                      }
                    </p>
                    <p className="text-slate-600 max-w-md mb-4">
                      {error.message || "Please try again in a few moments."}
                    </p>
                    <Button 
                      onClick={() => window.location.reload()} 
                      variant="outline"
                    >
                      Try Again
                    </Button>
                  </div>
                )}

                {data?.mealPlan && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.keys(data.mealPlan).map((key) => {
                        const day = data.mealPlan![key as dayType[number]];
                        return (
                          <Card key={key} className="border-slate-200 hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg font-bold text-slate-900">{key}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="space-y-1">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Breakfast</span>
                                <p className="text-sm text-slate-700 leading-relaxed">{day.Breakfast}</p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Lunch</span>
                                <p className="text-sm text-slate-700 leading-relaxed">{day.Lunch}</p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Dinner</span>
                                <p className="text-sm text-slate-700 leading-relaxed">{day.Dinner}</p>
                              </div>
                              {day.Snacks && (
                                <div className="space-y-1">
                                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Snacks</span>
                                  <p className="text-sm text-slate-700 leading-relaxed">{day.Snacks}</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealPlan;
