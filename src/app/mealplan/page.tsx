"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, AlertCircle, Sparkles, Save, RefreshCw, Calendar } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center transition-colors duration-300">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500 dark:text-emerald-400" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-4 transition-colors duration-300">
        <Card className="max-w-md w-full border-0 shadow-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-50">Sign In Required</CardTitle>
            <CardDescription className="mt-2 text-base text-slate-600 dark:text-slate-300">
              You need to be signed in to generate personalized meal plans.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full font-semibold">
              <Link href="/sign-up">Sign In</Link>
            </Button>
            <Button asChild variant="outline" className="w-full font-semibold">
              <Link href="/">Go to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!subscriptionData?.isSubscribed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-4 transition-colors duration-300">
        <Card className="max-w-md w-full border-0 shadow-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-50">Subscription Required</CardTitle>
            <CardDescription className="mt-2 text-base text-slate-600 dark:text-slate-300">
              You need an active subscription to generate AI-powered meal plans.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full font-semibold">
              <Link href="/subscribe">View Plans</Link>
            </Button>
            <Button asChild variant="outline" className="w-full font-semibold">
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

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 sm:mb-12 text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-3">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                Generate Meal Plan
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium max-w-2xl mx-auto">
              Create your personalized weekly meal plan with AI-powered recommendations
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Form */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    Preferences
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600 dark:text-slate-300">
                    Tell us about your dietary needs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="dietType" className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                        Diet Type <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="dietType"
                        name="dietType"
                        placeholder="e.g. vegetarian, vegan, keto"
                        required
                        className="h-11 text-base border-2 border-slate-200 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl shadow-sm focus:shadow-md transition-all duration-200 bg-white dark:bg-slate-900"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="calories" className="text-sm font-semibold text-slate-900 dark:text-slate-50">
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
                        className="h-11 text-base border-2 border-slate-200 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl shadow-sm focus:shadow-md transition-all duration-200 bg-white dark:bg-slate-900"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cuisines" className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                        Preferred Cuisines
                      </Label>
                      <Input
                        id="cuisines"
                        name="cuisines"
                        placeholder="e.g. Italian, Indian, Mexican"
                        className="h-11 text-base border-2 border-slate-200 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl shadow-sm focus:shadow-md transition-all duration-200 bg-white dark:bg-slate-900"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="allergies" className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                        Allergies / Exclusions
                      </Label>
                      <Input
                        id="allergies"
                        name="allergies"
                        placeholder="e.g. peanuts, gluten, dairy"
                        className="h-11 text-base border-2 border-slate-200 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl shadow-sm focus:shadow-md transition-all duration-200 bg-white dark:bg-slate-900"
                      />
                    </div>

                    <div className="flex items-center space-x-3 pt-2">
                      <input
                        type="checkbox"
                        id="snacks"
                        name="snacks"
                        className="h-4 w-4 rounded border-2 border-slate-300 dark:border-slate-700 text-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors duration-200"
                      />
                      <Label htmlFor="snacks" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                        Include snacks
                      </Label>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-11 font-semibold shadow-lg hover:shadow-xl" 
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
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center mb-6 shadow-xl">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">Ready to get started?</h3>
                  <p className="text-base text-slate-600 dark:text-slate-300 max-w-md">
                    Fill out the form to generate your personalized weekly meal plan.
                  </p>
                </div>
              )}

              {isPending && (
                <div className="flex flex-col items-center justify-center h-96">
                  <Loader2 className="h-12 w-12 animate-spin text-emerald-500 dark:text-emerald-400 mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">Generating your meal plan...</h3>
                  <p className="text-base text-slate-600 dark:text-slate-300">This may take a few moments</p>
                </div>
              )}

              {error && (
                <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center mb-4 shadow-lg">
                      <AlertCircle className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                      {error.code === "RATE_LIMIT_EXCEEDED" ? "Service Busy" : "Something went wrong"}
                    </h3>
                    <p className="text-base text-slate-600 dark:text-slate-300 mb-6 max-w-md">
                      {error.message || "Please try again in a few moments."}
                    </p>
                    <Button onClick={() => window.location.reload()} variant="outline" className="font-semibold">
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              )}

              {data?.mealPlan && (
                <div className="space-y-8">
                  {/* Success Header */}
                  <div className="text-center pb-8 border-b-2 border-slate-200 dark:border-slate-800">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-xl">
                      <Calendar className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">
                      <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                        Your Weekly Meal Plan is Ready
                      </span>
                      <span className="ml-2">🎉</span>
                    </h2>
                    <p className="text-base text-slate-600 dark:text-slate-300 font-medium">
                      Your personalized meal plan has been generated successfully
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleSavePlan}
                      disabled={isSaving}
                      className="flex-1 h-11 font-semibold shadow-lg hover:shadow-xl"
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
                      className="flex-1 h-11 font-semibold shadow-md hover:shadow-lg"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Regenerate
                    </Button>
                  </div>

                  {/* Weekly Meal Plan */}
                  <div className="space-y-6">
                    {Object.keys(data.mealPlan).map((key, index) => {
                      const day = data.mealPlan![key as DayName];
                      const dayColors = [
                        "from-emerald-500 to-teal-500",
                        "from-violet-500 to-purple-500",
                        "from-pink-500 to-rose-500",
                        "from-amber-500 to-orange-500",
                        "from-cyan-500 to-blue-500",
                        "from-indigo-500 to-purple-500",
                        "from-emerald-500 to-cyan-500",
                      ];
                      const gradient = dayColors[index % dayColors.length];
                      
                      return (
                        <Card 
                          key={key} 
                          className="group relative border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm overflow-hidden transform hover:-translate-y-1"
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                          <CardHeader className="pb-3 relative z-10">
                            <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                                <span className="text-white font-bold text-sm">{index + 1}</span>
                              </div>
                              {key}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-5 relative z-10">
                            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/50 dark:border-amber-800/50">
                              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2 block">Breakfast</span>
                              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{day.Breakfast}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border border-violet-200/50 dark:border-violet-800/50">
                              <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-2 block">Lunch</span>
                              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{day.Lunch}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border border-cyan-200/50 dark:border-cyan-800/50">
                              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-2 block">Dinner</span>
                              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{day.Dinner}</p>
                            </div>
                            {day.Snacks && (
                              <div className="p-4 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 border border-pink-200/50 dark:border-pink-800/50">
                                <span className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider mb-2 block">Snacks</span>
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{day.Snacks}</p>
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
