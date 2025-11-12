"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-foreground transition-colors duration-300">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-70 dark:opacity-40"
      >
        <div className="absolute -top-40 -left-32 h-[26rem] w-[26rem] rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 blur-3xl" />
        <div className="absolute top-1/2 -right-40 h-[24rem] w-[24rem] rounded-full bg-gradient-to-br from-violet-500/25 to-purple-500/25 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-cyan-500/25 to-blue-500/25 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Header */}
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3">
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              Browse Meals
            </span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
            Discover delicious meals, filter by your preferences, and add favorites to build your perfect meal plan.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-12 space-y-6">
          <div className="relative group max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search meals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base border-2 border-input focus-visible:ring-0 focus:border-primary rounded-xl shadow-md focus:shadow-lg transition-all duration-200 bg-card/80 backdrop-blur"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer px-4 py-2 text-sm font-semibold transition-all duration-200 transform hover:scale-105 rounded-lg shadow-md hover:shadow-lg"
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
                className="cursor-pointer px-4 py-2 text-sm font-semibold transition-all duration-200 transform hover:scale-105 rounded-lg shadow-md hover:shadow-lg hover:border-primary"
                onClick={() => setSelectedCategory(null)}
              >
                Clear
              </Badge>
            )}
          </div>
        </div>

        {/* Meals Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border-0 shadow-xl rounded-2xl bg-card/90 backdrop-blur">
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
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center mb-6 shadow-xl text-4xl">
              🍽️
            </div>
            <h3 className="text-2xl font-bold mb-2 text-foreground">No meals found</h3>
            <p className="text-base text-muted-foreground mb-8 max-w-md mx-auto">
              {searchQuery || selectedCategory
                ? "Try adjusting your search or filters"
                : "No meals available yet. Generate sample meals to get started."}
            </p>
            {!searchQuery && !selectedCategory && (
              <Button onClick={handleSeedMeals} size="lg" className="font-semibold shadow-lg hover:shadow-xl">
                Generate Sample Meals
              </Button>
            )}
          </div>
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
