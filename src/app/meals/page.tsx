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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Browse Meals</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
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
              className="pl-10 h-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer px-3 py-1.5 text-sm font-medium transition-colors"
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
                className="cursor-pointer px-3 py-1.5 text-sm font-medium transition-colors"
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
              <Card key={i}>
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
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold mb-2">No meals found</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              {searchQuery || selectedCategory
                ? "Try adjusting your search or filters"
                : "No meals available yet. Generate sample meals to get started."}
            </p>
            {!searchQuery && !selectedCategory && (
              <Button onClick={handleSeedMeals}>Generate Sample Meals</Button>
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
