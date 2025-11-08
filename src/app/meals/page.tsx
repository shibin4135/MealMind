"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MealCard } from "@/components/meal-card";
import { Search, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const categories = ["Breakfast", "Vegetarian", "High Protein", "Quick Meal"];

const Meals = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: mealsData, isLoading } = useQuery({
    queryKey: ["meals", searchQuery, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory) params.append("category", selectedCategory);
      const response = await fetch(`/api/meals?${params.toString()}`);
      if (!response.ok) return { meals: [] };
      return response.json();
    },
  });

  const { data: favoritesData } = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const response = await fetch("/api/favorites");
      if (!response.ok) return { favorites: [] };
      return response.json();
    },
  });

  const favoriteMealIds = useMemo(() => {
    return new Set(favoritesData?.favorites?.map((f: any) => f.mealId) || []);
  }, [favoritesData]);

  const meals = mealsData?.meals || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            Browse Meals
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Discover and save your favorite meals
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 sm:mb-10 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input
              placeholder="Search meals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-slate-400 dark:focus:border-slate-600"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() =>
                  setSelectedCategory(selectedCategory === category ? null : category)
                }
              >
                {category}
              </Badge>
            ))}
            {selectedCategory && (
              <Badge
                variant="outline"
                className="cursor-pointer px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setSelectedCategory(null)}
              >
                Clear
              </Badge>
            )}
          </div>
        </div>

        {/* Meals Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <Skeleton className="h-48 w-full rounded-t-lg" />
                <CardHeader>
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : meals.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="text-5xl sm:text-6xl mb-4">🍽️</div>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
              No meals found
            </h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              {searchQuery || selectedCategory
                ? "Try adjusting your search or filters"
                : "No meals available yet. Seed sample meals to get started."}
            </p>
            {!searchQuery && !selectedCategory && (
              <Button
                onClick={async () => {
                  try {
                    const response = await fetch("/api/seed-meals", { method: "POST" });
                    if (response.ok) {
                      toast.success("Meals seeded successfully!");
                      setTimeout(() => window.location.reload(), 1000);
                    } else {
                      toast.error("Failed to seed meals");
                    }
                  } catch (error) {
                    toast.error("Failed to seed meals");
                  }
                }}
              >
                Seed Sample Meals
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {meals.map((meal: any) => (
              <MealCard
                key={meal.id}
                meal={meal}
                isFavorite={favoriteMealIds.has(meal.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Meals;

