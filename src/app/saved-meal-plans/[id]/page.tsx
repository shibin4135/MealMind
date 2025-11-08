"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Lock, Trash2, Heart, ArrowLeft, Calendar } from "lucide-react";
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

const MealPlanDetail = () => {
  const { user, isLoaded, isSignedIn } = useUser();
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
            <p className="text-sm text-slate-600 mt-2">
              You need to be signed in to view this meal plan.
            </p>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="space-y-6">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Card key={i} className="border-0 shadow-sm">
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
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle>Meal Plan Not Found</CardTitle>
            <p className="text-sm text-slate-600 mt-2">
              The meal plan you're looking for doesn't exist or has been deleted.
            </p>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild variant="outline">
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
      <div className="min-h-screen bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <Button
              variant="ghost"
              onClick={() => router.push("/saved-meal-plans")}
              className="mb-6 -ml-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Saved Plans
            </Button>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-semibold mb-3 text-slate-900 break-words">
                  {plan.title}
                </h1>
                <p className="text-sm text-slate-600 flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4" />
                  Created on {createdDate}
                </p>
                {plan.preferences && (
                  <div className="flex flex-wrap gap-2 text-sm text-slate-500">
                    {plan.preferences.dietType && (
                      <span className="capitalize">{plan.preferences.dietType}</span>
                    )}
                    {plan.preferences.calories && (
                      <span>• {plan.preferences.calories} cal/day</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleToggleFavorite}
                  disabled={isTogglingFavorite || toggleFavoriteMutation.isPending}
                  variant={isFavorite ? "default" : "outline"}
                  className="h-10"
                >
                  {isTogglingFavorite || toggleFavoriteMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isFavorite ? (
                    <>
                      <Heart className="h-4 w-4 mr-2 fill-current" />
                      Remove from Favorites
                    </>
                  ) : (
                    <>
                      <Heart className="h-4 w-4 mr-2" />
                      Add to Favorites
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="h-10"
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Weekly Meal Plan */}
          <div className="space-y-6">
            {Object.keys(plan.mealPlan).map((key) => {
              const day = plan.mealPlan[key as DayName];
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
      </div>
    </>
  );
};

export default MealPlanDetail;
