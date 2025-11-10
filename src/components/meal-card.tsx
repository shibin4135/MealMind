"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Heart, Plus } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

interface MealCardProps {
  meal: {
    id: string;
    name: string;
    description?: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    category: string;
    imageUrl?: string;
  };
  isFavorite?: boolean;
  onFavoriteChange?: (isFavorite: boolean) => void;
}

export function MealCard({ meal, isFavorite: initialIsFavorite, onFavoriteChange }: MealCardProps) {
  const { isSignedIn } = useUser();
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite ?? false);

  // Sync favorite state when prop changes
  useEffect(() => {
    setIsFavorite(initialIsFavorite ?? false);
  }, [initialIsFavorite]);

  // Parse description into ingredients list
  const ingredients = meal.description
    ? meal.description.split(",").map((item) => item.trim())
    : [];

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (!isSignedIn) {
        throw new Error("Please sign in to favorite meals");
      }
      const response = await fetch("/api/favorites/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealId: meal.id }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to toggle favorite");
      }
      return response.json();
    },
    onMutate: async () => {
      // Optimistic update
      const previousIsFavorite = isFavorite;
      setIsFavorite(!isFavorite);
      onFavoriteChange?.(!isFavorite);
      return { previousIsFavorite };
    },
    onSuccess: (data) => {
      setIsFavorite(data.isFavorite);
      onFavoriteChange?.(data.isFavorite);
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast.success(data.isFavorite ? "Added to favorites" : "Removed from favorites");
    },
    onError: (error: Error, _variables, context) => {
      // Rollback optimistic update
      if (context) {
        setIsFavorite(context.previousIsFavorite);
        onFavoriteChange?.(context.previousIsFavorite);
      }
      toast.error(error.message || "Failed to update favorite");
    },
  });

  const logMealMutation = useMutation({
    mutationFn: async () => {
      if (!isSignedIn) {
        throw new Error("Please sign in to log meals");
      }
      const response = await fetch("/api/meal-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealId: meal.id }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to log meal");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Meal added to log");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to log meal");
    },
  });

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    favoriteMutation.mutate();
  };

  const handleLogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    logMealMutation.mutate();
  };

  return (
    <Card className="border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden">
        {meal.imageUrl ? (
          <Image
            src={meal.imageUrl}
            alt={meal.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
            <div className="text-5xl">🍽️</div>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-semibold line-clamp-2 flex-1">
            {meal.name}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Macros Row */}
        <div className="flex items-center gap-4 text-sm border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex-1 text-center">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Calories</div>
            <div className="font-semibold">{meal.calories}</div>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
          <div className="flex-1 text-center">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Protein</div>
            <div className="font-semibold">{meal.protein}g</div>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
          <div className="flex-1 text-center">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Carbs</div>
            <div className="font-semibold">{meal.carbs}g</div>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
          <div className="flex-1 text-center">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Fat</div>
            <div className="font-semibold">{meal.fat}g</div>
          </div>
        </div>

        {/* Collapsible Ingredients */}
        {ingredients.length > 0 && (
          <div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              <span>Ingredients</span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {isExpanded && (
              <ul className="mt-2 space-y-1.5 pl-4">
                {ingredients.map((ingredient, index) => (
                  <li
                    key={index}
                    className="text-sm text-slate-600 dark:text-slate-400 list-disc"
                  >
                    {ingredient}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleLogClick}
            disabled={logMealMutation.isPending || !isSignedIn}
            className="flex-1"
            size="sm"
          >
            {logMealMutation.isPending ? (
              "Adding..."
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1.5" />
                Add to Log
              </>
            )}
          </Button>
          <Button
            onClick={handleFavoriteClick}
            disabled={favoriteMutation.isPending || !isSignedIn}
            variant={isFavorite ? "default" : "outline"}
            size="sm"
            className="px-3"
          >
            <Heart
              className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`}
            />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
