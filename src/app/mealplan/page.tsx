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
      <div className="min-h-screen bg-background flex items-center justify-center pt-20 transition-colors duration-300">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 pt-20 transition-colors duration-300">
        <Card className="max-w-md w-full border border-border bg-muted/10">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Sign In Required</CardTitle>
            <CardDescription className="mt-2 text-base text-muted-foreground">
              You need to be signed in to generate personalized meal plans.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full font-semibold rounded-xl">
              <Link href="/sign-up">Sign In</Link>
            </Button>
            <Button asChild variant="outline" className="w-full font-semibold rounded-xl">
              <Link href="/">Go to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!subscriptionData?.isSubscribed) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 pt-20 transition-colors duration-300">
        <Card className="max-w-md w-full border border-border bg-muted/10">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Subscription Required</CardTitle>
            <CardDescription className="mt-2 text-base text-muted-foreground">
              You need an active subscription to generate AI-powered meal plans.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full font-semibold rounded-xl">
              <Link href="/subscribe">View Plans</Link>
            </Button>
            <Button asChild variant="outline" className="w-full font-semibold rounded-xl">
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

      <div className="min-h-screen bg-background text-foreground transition-colors duration-300 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          {/* Header */}
          <header className="space-y-4 text-center">
            <div className="inline-flex items-center rounded-full bg-muted/40 px-4 py-1 text-sm font-medium text-muted-foreground">
              Generate
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-semibold">
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  Generate Meal Plan
                </span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Create your personalized weekly meal plan with AI-powered recommendations
              </p>
            </div>
          </header>

          <Separator className="bg-border" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Form */}
            <div className="lg:col-span-1">
              <Card className="border border-border bg-muted/10 hover:shadow-lg transition-all duration-500">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    Preferences
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Tell us about your dietary needs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="dietType" className="text-sm font-semibold text-foreground">
                        Diet Type <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="dietType"
                        name="dietType"
                        placeholder="e.g. vegetarian, vegan, keto"
                        required
                        className="h-11 text-base border border-border rounded-xl bg-background transition-all duration-200 focus-visible:border-primary focus-visible:ring-0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="calories" className="text-sm font-semibold text-foreground">
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
                        className="h-11 text-base border border-border rounded-xl bg-background transition-all duration-200 focus-visible:border-primary focus-visible:ring-0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cuisines" className="text-sm font-semibold text-foreground">
                        Preferred Cuisines
                      </Label>
                      <Input
                        id="cuisines"
                        name="cuisines"
                        placeholder="e.g. Italian, Indian, Mexican"
                        className="h-11 text-base border border-border rounded-xl bg-background transition-all duration-200 focus-visible:border-primary focus-visible:ring-0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="allergies" className="text-sm font-semibold text-foreground">
                        Allergies / Exclusions
                      </Label>
                      <Input
                        id="allergies"
                        name="allergies"
                        placeholder="e.g. peanuts, gluten, dairy"
                        className="h-11 text-base border border-border rounded-xl bg-background transition-all duration-200 focus-visible:border-primary focus-visible:ring-0"
                      />
                    </div>

                    <div className="flex items-center space-x-3 pt-2">
                      <input
                        type="checkbox"
                        id="snacks"
                        name="snacks"
                        className="h-4 w-4 rounded border-2 border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200"
                      />
                      <Label htmlFor="snacks" className="text-sm font-medium text-muted-foreground cursor-pointer">
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
                  <h3 className="text-xl font-bold text-foreground mb-2">Ready to get started?</h3>
                  <p className="text-base text-muted-foreground max-w-md">
                    Fill out the form to generate your personalized weekly meal plan.
                  </p>
                </div>
              )}

              {isPending && (
                <div className="flex flex-col items-center justify-center h-96">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-2">Generating your meal plan...</h3>
                  <p className="text-base text-muted-foreground">This may take a few moments</p>
                </div>
              )}

              {error && (
                <Card className="border border-border bg-muted/10">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center mb-4 shadow-lg">
                      <AlertCircle className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {error.code === "RATE_LIMIT_EXCEEDED" ? "Service Busy" : "Something went wrong"}
                    </h3>
                    <p className="text-base text-muted-foreground mb-6 max-w-md">
                      {error.message || "Please try again in a few moments."}
                    </p>
                    <Button onClick={() => window.location.reload()} variant="outline" className="font-semibold rounded-xl">
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              )}

              {data?.mealPlan && (
                <div className="space-y-8">
                  {/* Success Header */}
                  <div className="text-center pb-8 border-b border-border">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-xl">
                      <Calendar className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">
                      <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                        Your Weekly Meal Plan is Ready
                      </span>
                      <span className="ml-2">🎉</span>
                    </h2>
                    <p className="text-base text-muted-foreground font-medium">
                      Your personalized meal plan has been generated successfully
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleSavePlan}
                      disabled={isSaving}
                      className="flex-1 h-11 font-semibold rounded-xl"
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
                      className="flex-1 h-11 font-semibold rounded-xl"
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
                          className="group relative border border-border bg-card/80 hover:shadow-lg transition-all duration-500 overflow-hidden"
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                          <CardHeader className="pb-3 relative z-10">
                            <CardTitle className="text-xl font-bold text-foreground flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                                <span className="text-white font-bold text-sm">{index + 1}</span>
                              </div>
                              {key}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-5 relative z-10">
                            <div className="p-4 rounded-xl bg-muted/40 border border-border">
                              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Breakfast</span>
                              <p className="text-sm text-foreground leading-relaxed font-medium">{day.Breakfast}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-muted/40 border border-border">
                              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Lunch</span>
                              <p className="text-sm text-foreground leading-relaxed font-medium">{day.Lunch}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-muted/40 border border-border">
                              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Dinner</span>
                              <p className="text-sm text-foreground leading-relaxed font-medium">{day.Dinner}</p>
                            </div>
                            {day.Snacks && (
                              <div className="p-4 rounded-xl bg-muted/40 border border-border">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Snacks</span>
                                <p className="text-sm text-foreground leading-relaxed font-medium">{day.Snacks}</p>
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
