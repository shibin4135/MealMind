"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MealCard } from "@/components/meal-card";
import { Search, Loader2 } from "lucide-react";

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            Browse Meals
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Discover and save your favorite meals
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search meals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer px-4 py-1.5"
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
                className="cursor-pointer px-4 py-1.5"
                onClick={() => setSelectedCategory(null)}
              >
                Clear
              </Badge>
            )}
          </div>
        </div>

        {/* Meals Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : meals.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
              No meals found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
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
                      window.location.reload();
                    } else {
                      alert("Failed to seed meals");
                    }
                  } catch (error) {
                    alert("Failed to seed meals");
                  }
                }}
              >
                Seed Sample Meals
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

