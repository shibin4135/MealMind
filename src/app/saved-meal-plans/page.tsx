"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  Lock,
  Search,
  Eye,
  Trash2,
  Calendar,
  FileText,
  Activity,
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

interface SavedPlan {
  id: string;
  title: string;
  mealPlan: Record<DayName, DailyMealPlan>;
  preferences?: {
    dietType?: string;
    calories?: string;
    cuisines?: string;
    allergies?: string;
    snacks?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const gradientPalette = [
  "from-emerald-500 to-teal-500",
  "from-violet-500 to-purple-500",
  "from-amber-500 to-orange-500",
  "from-cyan-500 to-blue-500",
  "from-pink-500 to-rose-500",
  "from-indigo-500 to-sky-500",
];

const SavedMealPlans = () => {
  const { isLoaded, isSignedIn } = useUser();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);

  const { data: savedPlansData, isLoading } = useQuery({
    queryKey: ["saved-meal-plans", searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      const response = await fetch(`/api/saved-meal-plans?${params.toString()}`);
      if (!response.ok) return { savedPlans: [] };
      return response.json();
    },
    enabled: isSignedIn && isLoaded,
  });

  const deleteMutation = useMutation({
    mutationFn: async (planId: string) => {
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
    },
    onError: () => {
      toast.error("Failed to delete meal plan");
    },
  });

  const handleDelete = (planId: string) => {
    setPlanToDelete(planId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (planToDelete) {
      deleteMutation.mutate(planToDelete);
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
    }
  };

  const calculateNutrition = (mealPlan: Record<DayName, DailyMealPlan>) => {
    let totalCalories = 0;
    let mealCount = 0;

    Object.values(mealPlan).forEach((day) => {
      ["Breakfast", "Lunch", "Dinner", "Snacks"].forEach((type) => {
        const mealText = (day as any)[type];
        if (mealText) {
          const match = mealText.match(/(\d+)\s*calories?/i);
          if (match) totalCalories += parseInt(match[1], 10);
          mealCount++;
        }
      });
    });

    return { totalCalories, mealCount };
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground transition-colors duration-300">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="relative min-h-screen bg-background text-foreground transition-colors duration-300 flex items-center justify-center px-4">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-60 dark:opacity-40"
        >
          <div className="absolute -top-32 -left-28 h-72 w-72 rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur-3xl" />
        </div>
        <Card className="max-w-md w-full border-0 shadow-xl bg-card/90 backdrop-blur">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Please Sign In</CardTitle>
            <CardDescription className="mt-2 text-base text-muted-foreground">
              You need to be signed in to view your saved meal plans.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full font-semibold">
              <Link href="/sign-up">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const savedPlans: SavedPlan[] = savedPlansData?.savedPlans || [];

  return (
    <>
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Meal Plan"
        description="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />

      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-foreground transition-colors duration-300">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-70 dark:opacity-40"
        >
          <div className="absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 blur-3xl" />
          <div className="absolute top-1/2 -right-40 h-[26rem] w-[26rem] rounded-full bg-gradient-to-br from-violet-500/25 to-purple-500/25 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-[30rem] w-[30rem] rounded-full bg-gradient-to-br from-cyan-500/25 to-blue-500/25 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="mb-10 text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-3">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                Saved Meal Plans
              </span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Revisit your AI-crafted meal plans, keep track of nutrition goals, and manage favorites effortlessly.
            </p>
          </div>

          <div className="relative max-w-xl mx-auto mb-12">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search meal plans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-12 text-base border-2 border-input focus-visible:ring-0 focus:border-primary rounded-xl shadow-sm focus:shadow-lg transition-all duration-200 bg-card/80 backdrop-blur"
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-0 shadow-lg rounded-2xl">
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : savedPlans.length === 0 ? (
            <Card className="max-w-2xl mx-auto border-0 shadow-2xl bg-card/90 backdrop-blur rounded-2xl">
              <CardContent className="py-16 px-8 text-center space-y-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center mx-auto shadow-xl">
                  <FileText className="h-10 w-10 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold mb-2">No Saved Meal Plans Yet</CardTitle>
                  <CardDescription className="text-base text-muted-foreground max-w-md mx-auto">
                    Generate your first plan to start building a personalized collection tailored to your goals.
                  </CardDescription>
                </div>
                <Button asChild size="lg" className="font-semibold shadow-lg hover:shadow-xl">
                  <Link href="/mealplan">Generate a Meal Plan</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedPlans.map((plan, index) => {
                const { totalCalories, mealCount } = calculateNutrition(plan.mealPlan);
                const createdDate = new Date(plan.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });
                const gradient = gradientPalette[index % gradientPalette.length];

                return (
                  <Card
                    key={plan.id}
                    className="group relative border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl bg-card/90 backdrop-blur overflow-hidden"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                    <CardHeader className="relative z-10 pb-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-lg font-semibold leading-tight text-foreground line-clamp-2">
                            {plan.title}
                          </CardTitle>
                          <CardDescription className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {createdDate}
                          </CardDescription>
                        </div>
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
                          <Activity className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="relative z-10 space-y-5">
                      <div className="rounded-xl border border-border bg-background/60 backdrop-blur-sm px-4 py-3 text-sm text-muted-foreground shadow-inner">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">{mealCount} meals logged</span>
                          <span>{totalCalories} total cal</span>
                        </div>
                        {plan.preferences?.calories && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Target: {plan.preferences.calories} cal/day
                          </p>
                        )}
                      </div>

                      {plan.preferences?.dietType && (
                        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <span className="rounded-lg bg-primary/10 px-3 py-1 text-primary">
                            {plan.preferences.dietType}
                          </span>
                          {plan.preferences.cuisines && (
                            <span className="rounded-lg bg-muted px-3 py-1">
                              {plan.preferences.cuisines}
                            </span>
                          )}
                          {plan.preferences.allergies && (
                            <span className="rounded-lg bg-muted px-3 py-1">
                              Excludes: {plan.preferences.allergies}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex gap-3 pt-1">
                        <Button
                          asChild
                          variant="outline"
                          className="flex-1 h-10 font-semibold shadow-sm hover:shadow-lg"
                        >
                          <Link href={`/saved-meal-plans/${plan.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View plan
                          </Link>
                        </Button>

                        <Button
                          variant="ghost"
                          onClick={() => handleDelete(plan.id)}
                          disabled={deleteMutation.isPending}
                          className="h-10 w-12 shadow-sm hover:shadow-lg"
                          aria-label="Delete plan"
                        >
                          {deleteMutation.isPending && planToDelete === plan.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SavedMealPlans;
