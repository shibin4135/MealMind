"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, AlertCircle, Sparkles, Save, Heart, RefreshCw } from "lucide-react";
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
  const [isAddingToFavorites, setIsAddingToFavorites] = useState(false);
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

  const handleAddToFavorites = async () => {
    if (!data?.mealPlan) return;
    setIsAddingToFavorites(true);

    try {
      const response = await fetch("/api/meal-plans/add-to-favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealPlan: data.mealPlan }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to add to favorites");
      }
      
      const result = await response.json();
      toast.success(`Added ${result.addedCount || 0} meal(s) to favorites!`);
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to add to favorites");
    } finally {
      setIsAddingToFavorites(false);
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500 dark:text-slate-400" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/50">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 sm:h-10 sm:w-10 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-xl sm:text-2xl">Sign In Required</CardTitle>
              <CardDescription className="text-sm sm:text-base mt-2">
                You need to be signed in to generate personalized meal plans.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="h-10 sm:h-11">
                  <Link href="/sign-up">Sign In</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-10 sm:h-11">
                  <Link href="/">Go to Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!subscriptionData?.isSubscribed) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/50">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-xl sm:text-2xl">Subscription Required</CardTitle>
              <CardDescription className="text-sm sm:text-base mt-2">
                You need an active subscription to generate AI-powered meal plans. Choose a plan that works for you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="h-10 sm:h-11">
                  <Link href="/subscribe">View Plans</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-10 sm:h-11">
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

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-50 mb-3 sm:mb-4">
              AI Meal Plan Generator
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Create personalized weekly meal plans tailored to your dietary preferences and goals
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Form Card */}
            <Card className="lg:col-span-1 shadow-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">Your Preferences</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Tell us about your dietary needs and we&apos;ll create a custom meal plan for you.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="dietType" className="text-xs sm:text-sm font-semibold">
                      Diet Type <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="dietType"
                      name="dietType"
                      placeholder="e.g. vegetarian, vegan, keto, paleo"
                      required
                      className="h-10 sm:h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-slate-400 dark:focus:border-slate-600"
                      aria-required="true"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="calories" className="text-xs sm:text-sm font-semibold">
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
                      className="h-10 sm:h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-slate-400 dark:focus:border-slate-600"
                      aria-required="true"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cuisines" className="text-xs sm:text-sm font-semibold">
                      Preferred Cuisines
                    </Label>
                    <Input
                      id="cuisines"
                      name="cuisines"
                      placeholder="e.g. Italian, Indian, Mexican, Asian"
                      className="h-10 sm:h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-slate-400 dark:focus:border-slate-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allergies" className="text-xs sm:text-sm font-semibold">
                      Allergies / Exclusions
                    </Label>
                    <Input
                      id="allergies"
                      name="allergies"
                      placeholder="e.g. peanuts, gluten, dairy, shellfish"
                      className="h-10 sm:h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-slate-400 dark:focus:border-slate-600"
                    />
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                    <input
                      type="checkbox"
                      id="snacks"
                      name="snacks"
                      className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-slate-950 dark:focus:ring-slate-50"
                    />
                    <Label htmlFor="snacks" className="cursor-pointer text-xs sm:text-sm font-medium">
                      Include snacks in the meal plan
                    </Label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-10 sm:h-11 text-sm sm:text-base font-semibold" 
                    disabled={isPending}
                    aria-disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        Generating Plan...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Generate Meal Plan
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Results Area */}
            <div className="lg:col-span-2">
              <Card className="min-h-[500px] shadow-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl sm:text-2xl">Your Weekly Meal Plan</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {data?.mealPlan 
                      ? "Your personalized meal plan is ready!" 
                      : "Fill out the form to generate your personalized weekly meal plan."
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!data?.mealPlan && !isPending && !error && (
                    <div className="flex flex-col items-center justify-center h-96 text-center px-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-slate-400 dark:text-slate-500" />
                      </div>
                      <p className="text-base sm:text-lg font-medium text-slate-900 dark:text-slate-50 mb-2">
                        Ready to get started?
                      </p>
                      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md">
                        Fill out the form on the left with your dietary preferences and click &quot;Generate Meal Plan&quot; to create your personalized weekly meal plan.
                      </p>
                    </div>
                  )}

                  {isPending && (
                    <div className="flex flex-col items-center justify-center h-96 px-4">
                      <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-slate-400 dark:text-slate-500 mb-4" />
                      <p className="text-base sm:text-lg font-medium text-slate-900 dark:text-slate-50 mb-2">
                        Generating your meal plan...
                      </p>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        This may take a few moments
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="flex flex-col items-center justify-center h-96 text-center px-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                        <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-red-600 dark:text-red-400" />
                      </div>
                      <p className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
                        {error.code === "RATE_LIMIT_EXCEEDED" 
                          ? "Service Busy" 
                          : "Something went wrong"
                        }
                      </p>
                      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md mb-4">
                        {error.message || "Please try again in a few moments."}
                      </p>
                      <Button 
                        onClick={() => window.location.reload()} 
                        variant="outline"
                        className="h-9 sm:h-10"
                      >
                        Try Again
                      </Button>
                    </div>
                  )}

                  {data?.mealPlan && (
                    <div className="space-y-4 sm:space-y-6">
                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 sm:gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                        <Button
                          onClick={handleSavePlan}
                          disabled={isSaving}
                          variant="default"
                          className="flex items-center gap-2 h-9 sm:h-10 text-xs sm:text-sm font-medium"
                          aria-label="Save meal plan"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              Save Plan
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={handleAddToFavorites}
                          disabled={isAddingToFavorites}
                          variant="outline"
                          className="flex items-center gap-2 h-9 sm:h-10 text-xs sm:text-sm font-medium border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                          aria-label="Add all meals to favorites"
                        >
                          {isAddingToFavorites ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            <>
                              <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              Add All to Favorites
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={handleRegenerate}
                          disabled={isPending}
                          variant="outline"
                          className="flex items-center gap-2 h-9 sm:h-10 text-xs sm:text-sm font-medium border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                          aria-label="Regenerate meal plan"
                        >
                          <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          Regenerate
                        </Button>
                      </div>

                      {/* Meal Plan Display */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {Object.keys(data.mealPlan).map((key) => {
                          const day = data.mealPlan![key as DayName];
                          return (
                            <Card key={key} className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-50">{key}</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3 sm:space-y-4">
                                <div className="space-y-1.5">
                                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Breakfast</span>
                                  <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed break-words">{day.Breakfast}</p>
                                </div>
                                <div className="space-y-1.5">
                                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Lunch</span>
                                  <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed break-words">{day.Lunch}</p>
                                </div>
                                <div className="space-y-1.5">
                                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Dinner</span>
                                  <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed break-words">{day.Dinner}</p>
                                </div>
                                {day.Snacks && (
                                  <div className="space-y-1.5">
                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Snacks</span>
                                    <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed break-words">{day.Snacks}</p>
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
    </>
  );
};

export default MealPlan;
