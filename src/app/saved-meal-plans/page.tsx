"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Lock, Search, Eye, Trash2, Calendar, FileText } from "lucide-react";
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

const SavedMealPlans = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
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

    Object.values(mealPlan as Record<DayName, DailyMealPlan>).forEach((day) => {
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-10 text-center max-w-md">
          <CardTitle>Please Sign In</CardTitle>
          <CardDescription className="mt-2">You need to be signed in to view your saved meal plans.</CardDescription>
          <Button asChild className="mt-4">
            <Link href="/sign-up">Sign In</Link>
          </Button>
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

      <div className="max-w-7xl mx-auto py-12 px-4">

        <h1 className="text-4xl font-bold mb-6">Saved Meal Plans</h1>

        <div className="relative max-w-md mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search meal plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </Card>
            ))}
          </div>
        ) : savedPlans.length === 0 ? (
          <Card className="p-10 text-center max-w-md mx-auto">
            <FileText className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <CardTitle>No Saved Meal Plans</CardTitle>
            <CardDescription className="mt-2">Generate and save a meal plan to see it here.</CardDescription>
            <Button asChild className="mt-4">
              <Link href="/mealplan">Generate Meal Plan</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {savedPlans.map((plan) => {
              const nutrition = calculateNutrition(plan.mealPlan);
              const createdDate = new Date(plan.createdAt).toLocaleDateString("en-US");

              return (
                <Card key={plan.id} className="p-4 hover:shadow-lg transition">
                  <CardHeader className="pb-3">
                    <CardTitle className="line-clamp-2">{plan.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1 text-sm">
                      <Calendar className="h-4 w-4" />
                      {createdDate}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <p className="text-sm">Meals: <span className="font-semibold">{nutrition.mealCount}</span></p>
                    <p className="text-sm">Calories: <span className="font-semibold">{nutrition.totalCalories}</span></p>

                    <div className="flex gap-2 pt-2">
                      <Button asChild className="flex-1">
                        <Link href={`/saved-meal-plans/${plan.id}`}>
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Link>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => handleDelete(plan.id)}
                        disabled={deleteMutation.isPending}
                        className="flex-1">
                        {deleteMutation.isPending && planToDelete === plan.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
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
    </>
  );
};

export default SavedMealPlans;
