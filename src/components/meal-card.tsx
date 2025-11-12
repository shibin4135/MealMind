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
    <Card className="group relative border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm overflow-hidden transform hover:-translate-y-2">
      {/* Image */}
      <div className="relative h-52 w-full overflow-hidden">
        {meal.imageUrl ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Image
              src={meal.imageUrl}
              alt={meal.name}
              fill
              className="object-cover transform group-hover:scale-110 transition-transform duration-500"
            />
          </>
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100 dark:from-emerald-900/30 dark:via-teal-900/30 dark:to-cyan-900/30 flex items-center justify-center">
            <div className="text-6xl transform group-hover:scale-110 transition-transform duration-300">🍽️</div>
          </div>
        )}
      </div>

      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl font-bold line-clamp-2 flex-1 text-slate-900 dark:text-slate-50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
            {meal.name}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10">
        {/* Macros Row */}
        <div className="flex items-center gap-3 text-sm border-b-2 border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex-1 text-center p-2 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
            <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1 uppercase tracking-wide">Calories</div>
            <div className="font-bold text-lg text-slate-900 dark:text-slate-50">{meal.calories}</div>
          </div>
          <div className="w-px h-10 bg-slate-200 dark:bg-slate-800" />
          <div className="flex-1 text-center p-2 rounded-lg bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
            <div className="text-xs font-semibold text-violet-600 dark:text-violet-400 mb-1 uppercase tracking-wide">Protein</div>
            <div className="font-bold text-lg text-slate-900 dark:text-slate-50">{meal.protein}g</div>
          </div>
          <div className="w-px h-10 bg-slate-200 dark:bg-slate-800" />
          <div className="flex-1 text-center p-2 rounded-lg bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30">
            <div className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 mb-1 uppercase tracking-wide">Carbs</div>
            <div className="font-bold text-lg text-slate-900 dark:text-slate-50">{meal.carbs}g</div>
          </div>
          <div className="w-px h-10 bg-slate-200 dark:bg-slate-800" />
          <div className="flex-1 text-center p-2 rounded-lg bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30">
            <div className="text-xs font-semibold text-pink-600 dark:text-pink-400 mb-1 uppercase tracking-wide">Fat</div>
            <div className="font-bold text-lg text-slate-900 dark:text-slate-50">{meal.fat}g</div>
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
        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleLogClick}
            disabled={logMealMutation.isPending || !isSignedIn}
            className="flex-1 font-semibold shadow-md hover:shadow-lg"
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
            className={`px-4 shadow-md hover:shadow-lg ${isFavorite ? "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600" : ""}`}
          >
            <Heart
              className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`}
            />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
