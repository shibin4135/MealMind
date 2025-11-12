"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MealCard } from "@/components/meal-card";
import { MealScheduleDialog, MealOption } from "@/components/meal-schedule-dialog";
import { usePersistentSchedule } from "@/hooks/usePersistentSchedule";
import { DayName, MealSlot } from "@/lib/schedule";

const categories = ["Breakfast", "Vegetarian", "High Protein", "Quick Meal"];

interface MealsResponse {
  meals: MealOption[];
}

interface ScheduleDialogState {
  open: boolean;
  mealId?: string;
  defaultDay?: DayName;
  defaultSlot?: MealSlot;
  restrictMealSelection?: boolean;
  lockDayToDefault?: boolean;
}

const BrowseMealsPage = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dialogState, setDialogState] = useState<ScheduleDialogState>({ open: false });

  const { updateSchedule } = usePersistentSchedule();

  useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.classList.add("dark");
  }, []);

  const { data: mealsData, isLoading } = useQuery<MealsResponse>({
    queryKey: ["browse-meals", searchQuery, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory) params.append("category", selectedCategory);
      const response = await fetch(`/api/meals?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to load meals");
      }
      return response.json();
    },
  });

  const meals = useMemo(() => mealsData?.meals ?? [], [mealsData]);

  const handleSeedMeals = async () => {
    try {
      const response = await fetch("/api/seed-meals", { method: "POST" });
      if (response.ok) {
        toast.success("Meals seeded successfully");
        queryClient.invalidateQueries({ queryKey: ["browse-meals"] });
      } else {
        toast.error("Unable to seed meals");
      }
    } catch {
      toast.error("Unable to seed meals");
    }
  };

  const handleOpenScheduleDialog = (meal: MealOption) => {
    setDialogState({
      open: true,
      mealId: meal.id,
      defaultDay: "Monday",
      defaultSlot: "Breakfast",
      restrictMealSelection: true,
      lockDayToDefault: false,
    });
  };

  const handleScheduleSubmit = ({ day, slot, mealId }: { day: DayName; slot: MealSlot; mealId: string }) => {
    const selectedMeal = meals.find((meal) => meal.id === mealId);
    if (!selectedMeal) {
      toast.error("Meal not found");
      return;
    }

    updateSchedule((previous) => {
      const next = structuredClone(previous);
      next[day] = {
        ...next[day],
        [slot]: {
          mealId: selectedMeal.id,
          meal: {
            id: selectedMeal.id,
            name: selectedMeal.name,
            calories: selectedMeal.calories,
            protein: selectedMeal.protein,
            carbs: selectedMeal.carbs,
            fat: selectedMeal.fat,
          },
        },
      };
      return next;
    });

    toast.success("Meal added to your schedule");
  };

  return (
    <div className="dark">
      <MealScheduleDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState((prev) => ({ ...prev, open }))}
        meals={meals}
        defaultMealId={dialogState.mealId}
        defaultDay={dialogState.defaultDay}
        defaultSlot={dialogState.defaultSlot}
        restrictMealSelection={dialogState.restrictMealSelection}
        lockDayToDefault={dialogState.lockDayToDefault}
        onSubmit={handleScheduleSubmit}
      />

      <div className="min-h-screen bg-background text-foreground transition-colors duration-300 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          <header className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center rounded-full bg-muted/40 px-4 py-1 text-sm font-medium text-muted-foreground">
              Browse
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-semibold">
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  Browse Meals
                </span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
                Explore curated meals, discover new favorites, and add them to your weekly schedule.
              </p>
            </div>
          </header>

          <Separator className="bg-border" />

          <Card className="border border-border bg-muted/10">
            <CardContent className="py-8 space-y-6">
              <div className="relative max-w-2xl mx-auto md:mx-0">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search meals..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="h-12 rounded-xl border border-border bg-background/90 pl-12 text-base transition-colors duration-200 focus-visible:border-primary focus-visible:ring-0"
                />
              </div>

              <Separator className="bg-border" />

              <div className="flex flex-wrap gap-3">
                {categories.map((category) => {
                  const isSelected = selectedCategory === category;

                  return (
                    <Badge
                      key={category}
                      variant={isSelected ? "default" : "outline"}
                      className="cursor-pointer rounded-full border border-border px-5 py-2 text-sm font-semibold transition-all duration-200 hover:bg-muted/60"
                      onClick={() =>
                        setSelectedCategory(isSelected ? null : category)
                      }
                    >
                      {category}
                    </Badge>
                  );
                })}
                {selectedCategory && (
                  <Badge
                    variant="outline"
                    className="cursor-pointer rounded-full border border-border px-5 py-2 text-sm font-semibold text-muted-foreground transition-all duration-200 hover:bg-muted/60"
                    onClick={() => setSelectedCategory(null)}
                  >
                    Clear filters
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                <Card key={index} className="border border-border bg-muted/10">
                  <Skeleton className="h-48 w-full rounded-t-xl" />
                  <CardHeader className="space-y-4">
                    <Skeleton className="h-5 w-3/4 rounded-lg" />
                    <Skeleton className="h-4 w-1/2 rounded-lg" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full rounded-lg" />
                    <Skeleton className="h-4 w-2/3 rounded-lg" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : meals.length === 0 ? (
            <Card className="border border-border bg-muted/10">
              <CardContent className="space-y-6 py-16 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-muted text-3xl">
                  🍽️
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold text-foreground">
                    No meals found
                  </h3>
                  <p className="mx-auto max-w-md text-base text-muted-foreground">
                    {searchQuery || selectedCategory
                      ? "Try adjusting your search or filters to discover more options."
                      : "No meals available yet. Generate sample meals to get started."}
                  </p>
                </div>
                {!searchQuery && !selectedCategory && (
                  <Button onClick={handleSeedMeals} size="lg" className="rounded-xl">
                    Generate Sample Meals
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {meals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  isFavorite={meal["isFavorite" as keyof MealOption] as boolean | undefined}
                  onFavoriteChange={() => {
                    queryClient.invalidateQueries({ queryKey: ["browse-meals"] });
                    queryClient.invalidateQueries({ queryKey: ["favorites"] });
                  }}
                  showScheduleAction
                  onAddToSchedule={handleOpenScheduleDialog}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseMealsPage;

