"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  Lock,
  Trash2,
  Heart,
  ArrowLeft,
  Calendar,
  Sparkles,
  BookmarkCheck,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
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

const dayPalette = [
  "from-emerald-500 to-teal-500",
  "from-violet-500 to-purple-500",
  "from-amber-500 to-orange-500",
  "from-cyan-500 to-blue-500",
  "from-pink-500 to-rose-500",
  "from-indigo-500 to-sky-500",
  "from-lime-500 to-emerald-500",
];

const MealPlanDetail = () => {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const planId = params?.id as string;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  const { data: planData, isLoading } = useQuery({
    queryKey: ["saved-meal-plan", planId],
    queryFn: async () => {
      const response = await fetch(`/api/saved-meal-plans/${planId}`);
      if (!response.ok) throw new Error("Failed to fetch plan");
      return response.json();
    },
    enabled: !!planId && isSignedIn && isLoaded,
  });

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

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/favorite-plans/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      if (!response.ok) throw new Error("Failed to toggle favorite");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["saved-meal-plan", planId] });
      queryClient.invalidateQueries({ queryKey: ["saved-meal-plans"] });
      toast.success(data.isFavorite ? "Added to favorites" : "Removed from favorites");
    },
    onError: () => {
      toast.error("Failed to update favorite status");
    },
  });

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate();
    setDeleteDialogOpen(false);
  };

  const handleToggleFavorite = () => {
    setIsTogglingFavorite(true);
    toggleFavoriteMutation.mutate();
    setTimeout(() => setIsTogglingFavorite(false), 500);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground transition-colors duration-300 pt-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex items-center justify-center px-4 pt-20">
        <Card className="max-w-md w-full border border-border bg-muted/10">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Sign In Required</CardTitle>
            <CardDescription className="mt-2 text-base text-muted-foreground">
              You need to be signed in to view this meal plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button asChild size="lg" className="font-semibold rounded-xl">
              <Link href="/sign-up">Sign In</Link>
            </Button>
            <Button asChild variant="outline" className="font-semibold rounded-xl">
              <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <Skeleton className="h-12 w-64 rounded-xl" />
          <div className="space-y-6">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Card key={i} className="border border-border bg-muted/10">
                <CardHeader className="pb-3">
                  <Skeleton className="h-6 w-40 rounded-lg" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full rounded-lg" />
                  <Skeleton className="h-4 w-4/5 rounded-lg" />
                  <Skeleton className="h-4 w-2/3 rounded-lg" />
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
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex items-center justify-center px-4 pt-20">
        <Card className="max-w-lg w-full border border-border bg-muted/10">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto shadow-xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Meal Plan Not Found</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              The meal plan you're looking for doesn't exist or has been deleted. Try generating a new plan or return to your saved plans.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button asChild className="font-semibold rounded-xl">
              <Link href="/mealplan">Generate Meal Plan</Link>
            </Button>
            <Button asChild variant="outline" className="font-semibold rounded-xl">
              <Link href="/saved-meal-plans">Back to Saved Plans</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const plan = planData.savedPlan;
  const isFavorite = planData.isFavorite || false;
  const createdDate = new Date(plan.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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

      <div className="min-h-screen bg-background text-foreground transition-colors duration-300 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          {/* Header */}
          <div className="space-y-6 text-center sm:text-left">
            <Button
              variant="ghost"
              onClick={() => router.push("/saved-meal-plans")}
              className="w-fit sm:-ml-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Saved Plans
            </Button>

            <Card className="border border-border bg-muted/10 rounded-xl">
              <CardContent className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 p-6 sm:p-8">
                <div className="flex-1 space-y-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg">
                      <BookmarkCheck className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-widest text-muted-foreground font-semibold">Meal Plan</p>
                      <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground break-words">
                        {plan.title}
                      </h1>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Created on {createdDate}
                    </span>
                    {plan.preferences?.dietType && (
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                        {plan.preferences.dietType}
                      </span>
                    )}
                    {plan.preferences?.calories && (
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                        {plan.preferences.calories} cal/day
                      </span>
                    )}
                  </div>

                  {(plan.preferences?.cuisines || plan.preferences?.allergies) && (
                    <div className="grid gap-2 text-sm text-muted-foreground">
                      {plan.preferences.cuisines && (
                        <p>
                          <span className="font-semibold text-foreground">Cuisines:</span> {plan.preferences.cuisines}
                        </p>
                      )}
                      {plan.preferences.allergies && (
                        <p>
                          <span className="font-semibold text-foreground">Allergies:</span> {plan.preferences.allergies}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Button
                    onClick={handleToggleFavorite}
                    disabled={isTogglingFavorite || toggleFavoriteMutation.isPending}
                    variant={isFavorite ? "default" : "outline"}
                    className="h-11 font-semibold rounded-xl"
                  >
                    {isTogglingFavorite || toggleFavoriteMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isFavorite ? (
                      <>
                        <Heart className="h-4 w-4 mr-2 fill-current" />
                        Remove Favorite
                      </>
                    ) : (
                      <>
                        <Heart className="h-4 w-4 mr-2" />
                        Add to Favorites
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="h-11 font-semibold rounded-xl"
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                        Delete Plan
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Meal Plan */}
          <div className="space-y-6">
            {Object.keys(plan.mealPlan).map((key, index) => {
              const day = plan.mealPlan[key as DayName];
              const gradient = dayPalette[index % dayPalette.length];

              return (
                <Card
                  key={key}
                  className="group relative border border-border bg-card/80 hover:shadow-lg transition-all duration-500 rounded-xl overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  <CardHeader className="relative z-10 pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                        <span className="text-white font-semibold text-sm">{index + 1}</span>
                      </div>
                      <CardTitle className="text-xl font-bold text-foreground">{key}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-border bg-muted/40 px-4 py-3">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Breakfast</span>
                      <p className="mt-2 text-sm leading-relaxed text-foreground">{day.Breakfast}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/40 px-4 py-3">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Lunch</span>
                      <p className="mt-2 text-sm leading-relaxed text-foreground">{day.Lunch}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/40 px-4 py-3">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Dinner</span>
                      <p className="mt-2 text-sm leading-relaxed text-foreground">{day.Dinner}</p>
                    </div>
                    {day.Snacks && (
                      <div className="rounded-xl border border-border bg-muted/40 px-4 py-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Snacks</span>
                        <p className="mt-2 text-sm leading-relaxed text-foreground">{day.Snacks}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default MealPlanDetail;
