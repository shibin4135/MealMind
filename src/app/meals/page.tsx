"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MealCard } from "@/components/meal-card";
import { Search } from "lucide-react";
import toast from "react-hot-toast";

const categories = ["Breakfast", "Vegetarian", "High Protein", "Quick Meal"];

const Meals = () => {
  const queryClient = useQueryClient();
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

  const meals = mealsData?.meals || [];

  const handleSeedMeals = async () => {
    try {
      const response = await fetch("/api/seed-meals", { method: "POST" });
      if (response.ok) {
        toast.success("Meals seeded successfully!");
        queryClient.invalidateQueries({ queryKey: ["meals"] });
      } else {
        toast.error("Failed to seed meals");
      }
    } catch (error) {
      toast.error("Failed to seed meals");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center md:text-left space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold">
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              Browse Meals
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium max-w-2xl">
            Discover delicious meals, filter by your preferences, and add favorites to build your perfect meal plan.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
          <CardContent className="py-8 space-y-6">
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
              <Input
                placeholder="Search meals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base border-2 border-slate-200 dark:border-slate-800 focus-visible:ring-0 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl shadow-sm focus:shadow-md transition-all duration-200 bg-white/90 dark:bg-slate-900/80"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {categories.map((category) => {
                const isSelected = selectedCategory === category;
                return (
                  <Badge
                    key={category}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer px-5 py-2 text-sm font-semibold transition-all duration-200 rounded-full border-2 ${
                      isSelected
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:from-emerald-600 hover:to-teal-600"
                        : "bg-white/80 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-emerald-400 dark:hover:border-emerald-400 hover:text-slate-900 dark:hover:text-slate-100"
                    }`}
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
                  className="cursor-pointer px-5 py-2 text-sm font-semibold transition-all duration-200 rounded-full border-2 bg-white/80 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-red-300 dark:hover:border-red-500 hover:text-red-500 dark:hover:text-red-400"
                  onClick={() => setSelectedCategory(null)}
                >
                  Clear filters
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Meals Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border-0 shadow-xl rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
                <Skeleton className="h-48 w-full rounded-t-2xl" />
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
          <Card className="max-w-3xl mx-auto border-0 shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
            <CardContent className="py-16 text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-xl text-4xl">
                🍽️
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50">No meals found</h3>
                <p className="text-base text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                  {searchQuery || selectedCategory
                    ? "Try adjusting your search or filters to discover more options."
                    : "No meals available yet. Generate sample meals to get started."}
                </p>
              </div>
              {!searchQuery && !selectedCategory && (
                <Button onClick={handleSeedMeals} size="lg" className="font-semibold shadow-lg hover:shadow-xl">
                  Generate Sample Meals
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {meals.map((meal: any) => (
              <MealCard
                key={meal.id}
                meal={meal}
                isFavorite={meal.isFavorite || false}
                onFavoriteChange={() => {
                  queryClient.invalidateQueries({ queryKey: ["meals"] });
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Meals;
