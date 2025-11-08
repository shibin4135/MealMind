"use client";

import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Lock, Trash2, Heart, ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { MealCard } from "@/components/meal-card";
import { ConfirmationDialog } from "@/components/confirmation-dialog";

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

interface Meal {
  id: string;
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: string;
  imageUrl?: string;
}

interface Favorite {
  mealId: string;
  meal?: {
    name: string;
  };
}

const MealPlanDetail = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const planId = params?.id as string;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: planData, isLoading } = useQuery({
    queryKey: ["saved-meal-plan", planId],
    queryFn: async () => {
      const response = await fetch(`/api/saved-meal-plans/${planId}`);
      if (!response.ok) throw new Error("Failed to fetch plan");
      return response.json();
    },
    enabled: !!planId && isSignedIn && isLoaded,
  });

  const { data: favoritesData } = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const response = await fetch("/api/favorites");
      if (!response.ok) return { favorites: [] };
      return response.json();
    },
    enabled: isSignedIn && isLoaded,
  });

  const favoriteMealIds = useMemo(() => {
    return new Set(
      favoritesData?.favorites?.map((f: Favorite) => f.mealId).filter(Boolean) || []
    );
  }, [favoritesData]);

  const favoriteMealNames = useMemo(() => {
    return new Set(
      favoritesData?.favorites
        ?.map((f: Favorite) => f.meal?.name?.toLowerCase().trim())
        .filter(Boolean) || []
    );
  }, [favoritesData]);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/saved-meal-plans?id=${planId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete plan");
      return response.json();
    },
    onSuccess: () => {
      toast.success("Meal plan deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["saved-meal-plans"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      router.push("/saved-meal-plans");
    },
    onError: () => {
      toast.error("Failed to delete meal plan");
    },
  });

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate();
    setDeleteDialogOpen(false);
  };

  // Extract meals from the plan and convert them to meal objects for display
  const extractMeals = (mealPlan: Record<DayName, DailyMealPlan>): Meal[] => {
    const mealMap = new Map<string, Meal>();

    Object.values(mealPlan).forEach((day: DailyMealPlan) => {
      const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snacks"] as const;
      mealTypes.forEach((type) => {
        const mealText = day[type as keyof DailyMealPlan];
        if (mealText) {
          const cleanName = mealText.split(" - ")[0].trim();
          const caloriesMatch = mealText.match(/(\d+)\s*calories?/i);
          const calories = caloriesMatch ? parseInt(caloriesMatch[1], 10) : 0;

          // Create a unique key for each meal
          const mealKey = `${type}-${cleanName}`;
          if (!mealMap.has(mealKey)) {
            mealMap.set(mealKey, {
              id: mealKey,
              name: cleanName,
              description: mealText,
              calories,
              protein: 0,
              carbs: 0,
              fat: 0,
              category: type,
              imageUrl: undefined,
            });
          }
        }
      });
    });

    return Array.from(mealMap.values());
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/50">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-2xl">Sign In Required</CardTitle>
              <CardDescription className="text-base mt-2">
                You need to be signed in to view this meal plan.
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Card key={i} className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!planData?.savedPlan) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Card className="border-slate-200 dark:border-slate-800 max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Meal Plan Not Found</CardTitle>
              <CardDescription className="text-base mt-2">
                The meal plan you're looking for doesn't exist or has been deleted.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button asChild>
                <Link href="/saved-meal-plans">Back to Saved Plans</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const plan = planData.savedPlan;
  const createdDate = new Date(plan.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const meals = extractMeals(plan.mealPlan);

  return (
    <>
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Meal Plan"
        description="Are you sure you want to delete this meal plan? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 sm:mb-10">
            <Button
              variant="ghost"
              onClick={() => router.push("/saved-meal-plans")}
              className="mb-4 -ml-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Saved Plans
            </Button>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2 break-words">
                  {plan.title}
                </h1>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  Created on {createdDate}
                </p>
                {plan.preferences && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {plan.preferences.dietType && (
                      <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 capitalize">
                        {plan.preferences.dietType}
                      </span>
                    )}
                    {plan.preferences.calories && (
                      <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        • {plan.preferences.calories} cal/day
                      </span>
                    )}
                  </div>
                )}
              </div>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 h-10 sm:h-11 shrink-0"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Plan
                  </>
                )}
              </Button>
            </div>
          </div>

        {/* Weekly Meal Plan View */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-50 mb-4 sm:mb-6">
            Weekly Meal Plan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {Object.keys(plan.mealPlan).map((key) => {
              const day = plan.mealPlan[key as DayName];
              return (
                <Card
                  key={key}
                  className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50">
                      {key}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Breakfast
                      </span>
                      <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed break-words">
                        {day.Breakfast}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Lunch
                      </span>
                      <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed break-words">
                        {day.Lunch}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Dinner
                      </span>
                      <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed break-words">
                        {day.Dinner}
                      </p>
                    </div>
                    {day.Snacks && (
                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          Snacks
                        </span>
                        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed break-words">
                          {day.Snacks}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* All Meals Grid */}
        {meals.length > 0 && (
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-50 mb-4 sm:mb-6">
              All Meals ({meals.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {meals.map((meal) => {
                // Check if meal is favorited by name (since meal might not exist in DB yet)
                const isFavorited = favoriteMealIds.has(meal.id) || 
                  favoriteMealNames.has(meal.name.toLowerCase().trim());
                return (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    isFavorite={isFavorited}
                    createIfNotExists={true}
                  />
                );
              })}
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
};

export default MealPlanDetail;

