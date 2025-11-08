"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, AlertCircle, Sparkles, Save, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { InputDialog } from "@/components/input-dialog";

interface MealPlanProps {
  dietType: string;
  calories: string;
  cuisines: string;
  allergies: string;
  snacks: string;
  days?: number;
}

type DayName =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

interface DailyMealPlan {
  Breakfast: string;
  Lunch: string;
  Dinner: string;
  Snacks?: string;
}

interface MealTypeResponse {
  error?: string;
  code?: string;
  mealPlan?: Record<DayName, DailyMealPlan>;
}

interface MealPlanError extends Error {
  code?: string;
}

const MealPlan = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.error || "Failed to generate meal plan") as MealPlanError;
      error.code = data.code;
      throw error;
    }
    return data;
  };

  const { mutate, data, isPending, error } = useMutation<MealTypeResponse, MealPlanError, MealPlanProps>({
    mutationFn: generateMealPlan,
    onSuccess: () => {
      toast.success("Meal plan generated successfully!");
    },
    onError: (error: MealPlanError) => {
      let message = error.message || "Something went wrong";
      if (error.code === "UNAUTHORIZED") {
        message = "Please sign in to continue";
        router.push("/sign-up");
      } else if (error.code === "SUBSCRIPTION_REQUIRED") {
        message = "Subscription required";
        router.push("/subscribe");
      } else if (error.code === "RATE_LIMIT_EXCEEDED") {
        message = "Service busy, try again soon";
      }
      toast.error(message);
    },
  });

  const handleSavePlan = () => {
    if (!data?.mealPlan) return;
    setSaveDialogOpen(true);
  };

  const confirmSavePlan = async (title: string) => {
    if (!data?.mealPlan || !formRef.current) return;
    
    setIsSaving(true);
    setSaveDialogOpen(false);

    try {
      const formData = new FormData(formRef.current);
      const snacksChecked = formData.get("snacks") === "on";
      const preferences = {
        dietType: formData.get("dietType") as string,
        calories: formData.get("calories") as string,
        cuisines: formData.get("cuisines") as string || "",
        allergies: formData.get("allergies") as string || "",
        snacks: snacksChecked ? "yes" : "",
      };

      const response = await fetch("/api/saved-meal-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: title.trim(), 
          mealPlan: data.mealPlan, 
          preferences 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save meal plan");
      }
      
      toast.success("Meal plan saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["saved-meal-plans"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to save meal plan");
    } finally {
      setIsSaving(false);
    }
  };

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
    const dietType = formData.get("dietType") as string;
    const calories = formData.get("calories") as string;

    if (!dietType?.trim()) {
      toast.error("Please enter a diet type");
      return;
    }

    if (!calories?.trim() || isNaN(Number(calories)) || Number(calories) < 1000 || Number(calories) > 5000) {
      toast.error("Please enter a valid calorie amount (1000-5000)");
      return;
    }

    const payload: MealPlanProps = {
      dietType: dietType.trim(),
      calories: calories.trim(),
      cuisines: (formData.get("cuisines") as string) || "",
      allergies: (formData.get("allergies") as string) || "",
      snacks: snacksChecked ? "yes" : "",
      days: 7,
    };

    mutate(payload);
  };

  const handleRegenerate = () => {
    if (formRef.current) {
      formRef.current.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    }
  };

  if (!isLoaded || isLoadingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Lock className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription className="mt-2">
              You need to be signed in to generate personalized meal plans.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/sign-up">Sign In</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Go to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!subscriptionData?.isSubscribed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <CardTitle>Subscription Required</CardTitle>
            <CardDescription className="mt-2">
              You need an active subscription to generate AI-powered meal plans.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/subscribe">View Plans</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Go to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <InputDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        onConfirm={confirmSavePlan}
        title="Save Meal Plan"
        description="Enter a title for this meal plan"
        placeholder="e.g. Weekly Keto Plan"
        confirmText="Save"
        cancelText="Cancel"
        isLoading={isSaving}
      />

      <div className="min-h-screen bg-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-1">
              <h1 className="text-2xl font-semibold mb-6 text-slate-900">Generate Meal Plan</h1>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="dietType" className="text-sm font-medium">
                        Diet Type <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="dietType"
                        name="dietType"
                        placeholder="e.g. vegetarian, vegan, keto"
                        required
                        className="h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="calories" className="text-sm font-medium">
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
                        className="h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cuisines" className="text-sm font-medium">
                        Preferred Cuisines
                      </Label>
                      <Input
                        id="cuisines"
                        name="cuisines"
                        placeholder="e.g. Italian, Indian, Mexican"
                        className="h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="allergies" className="text-sm font-medium">
                        Allergies / Exclusions
                      </Label>
                      <Input
                        id="allergies"
                        name="allergies"
                        placeholder="e.g. peanuts, gluten, dairy"
                        className="h-10"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="snacks"
                        name="snacks"
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      <Label htmlFor="snacks" className="text-sm cursor-pointer">
                        Include snacks
                      </Label>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-10" 
                      disabled={isPending}
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Plan
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            <div className="lg:col-span-2">
              {!data?.mealPlan && !isPending && !error && (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <Sparkles className="h-12 w-12 mb-4 text-slate-300" />
                  <p className="text-base text-slate-600 mb-2">Ready to get started?</p>
                  <p className="text-sm text-slate-500 max-w-md">
                    Fill out the form to generate your personalized weekly meal plan.
                  </p>
                </div>
              )}

              {isPending && (
                <div className="flex flex-col items-center justify-center h-96">
                  <Loader2 className="h-10 w-10 animate-spin text-slate-400 mb-4" />
                  <p className="text-base text-slate-600 mb-2">Generating your meal plan...</p>
                  <p className="text-sm text-slate-500">This may take a few moments</p>
                </div>
              )}

              {error && (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <AlertCircle className="h-12 w-12 mb-4 text-red-400" />
                  <p className="text-base font-semibold text-slate-900 mb-2">
                    {error.code === "RATE_LIMIT_EXCEEDED" ? "Service Busy" : "Something went wrong"}
                  </p>
                  <p className="text-sm text-slate-600 mb-4 max-w-md">
                    {error.message || "Please try again in a few moments."}
                  </p>
                  <Button onClick={() => window.location.reload()} variant="outline">
                    Try Again
                  </Button>
                </div>
              )}

              {data?.mealPlan && (
                <div className="space-y-8">
                  {/* Success Header */}
                  <div className="text-center pb-6 border-b border-slate-100">
                    <h2 className="text-3xl font-semibold mb-2 text-slate-900">
                      Your Weekly Meal Plan is Ready 🎉
                    </h2>
                    <p className="text-sm text-slate-600">
                      Your personalized meal plan has been generated successfully
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleSavePlan}
                      disabled={isSaving}
                      className="flex-1 h-10"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Plan
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleRegenerate}
                      disabled={isPending}
                      variant="outline"
                      className="flex-1 h-10"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Regenerate
                    </Button>
                  </div>

                  {/* Weekly Meal Plan */}
                  <div className="space-y-6">
                    {Object.keys(data.mealPlan).map((key) => {
                      const day = data.mealPlan![key as DayName];
                      return (
                        <Card key={key} className="border-0 shadow-sm rounded-xl">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-semibold text-slate-900">{key}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Breakfast</span>
                              <p className="text-sm text-slate-700 mt-1 leading-relaxed">{day.Breakfast}</p>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Lunch</span>
                              <p className="text-sm text-slate-700 mt-1 leading-relaxed">{day.Lunch}</p>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Dinner</span>
                              <p className="text-sm text-slate-700 mt-1 leading-relaxed">{day.Dinner}</p>
                            </div>
                            {day.Snacks && (
                              <div>
                                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Snacks</span>
                                <p className="text-sm text-slate-700 mt-1 leading-relaxed">{day.Snacks}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MealPlan;
