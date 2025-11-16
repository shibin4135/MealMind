"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarPlus, ChevronDown, ChevronUp, Heart } from "lucide-react";
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
  onAddToSchedule?: (meal: MealCardProps["meal"]) => void;
  showScheduleAction?: boolean;
}

export function MealCard({
  meal,
  isFavorite: initialIsFavorite,
  onFavoriteChange,
  onAddToSchedule,
  showScheduleAction = false,
}: MealCardProps) {
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

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    favoriteMutation.mutate();
  };

  const handleAddToFavoritesClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    favoriteMutation.mutate();
  };

  const handleAddToScheduleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToSchedule?.(meal);
  };

  return (
    <Card className="group relative border border-border bg-card/90 shadow-xl hover:shadow-2xl transition-all duration-500 backdrop-blur-sm overflow-hidden transform hover:-translate-y-2">
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
          <CardTitle className="flex-1 text-xl font-semibold text-foreground transition-colors duration-300 group-hover:text-primary line-clamp-2">
            {meal.name}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10">
        {/* Macros Row */}
        <div className="flex items-center gap-3 text-sm border-b border-border pb-4">
          <div className="flex-1 rounded-lg bg-muted/40 p-3 text-center">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Calories
            </div>
            <div className="text-lg font-semibold text-foreground">{meal.calories}</div>
          </div>
          <div className="h-10 w-px bg-border" />
          <div className="flex-1 rounded-lg bg-muted/40 p-3 text-center">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Protein
            </div>
            <div className="text-lg font-semibold text-foreground">{meal.protein}g</div>
          </div>
          <div className="h-10 w-px bg-border" />
          <div className="flex-1 rounded-lg bg-muted/40 p-3 text-center">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Carbs
            </div>
            <div className="text-lg font-semibold text-foreground">{meal.carbs}g</div>
          </div>
          <div className="h-10 w-px bg-border" />
          <div className="flex-1 rounded-lg bg-muted/40 p-3 text-center">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Fat
            </div>
            <div className="text-lg font-semibold text-foreground">{meal.fat}g</div>
          </div>
        </div>

        {/* Collapsible Ingredients */}
        {ingredients.length > 0 && (
          <div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex w-full items-center justify-between text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
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
                    className="list-disc text-sm text-muted-foreground"
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
            onClick={handleAddToFavoritesClick}
            disabled={favoriteMutation.isPending || !isSignedIn}
            className="flex-1 font-semibold shadow-md hover:shadow-lg"
            size="sm"
            variant={isFavorite ? "default" : "outline"}
          >
            {favoriteMutation.isPending ? (
              "Adding..."
            ) : (
              <>
                <Heart className={`h-4 w-4 mr-1.5 ${isFavorite ? "fill-current" : ""}`} />
                {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              </>
            )}
          </Button>
          <Button
            onClick={handleFavoriteClick}
            disabled={favoriteMutation.isPending || !isSignedIn}
            variant={isFavorite ? "default" : "outline"}
            size="sm"
            className={isFavorite ? "px-4 shadow-md hover:shadow-lg" : "px-4 shadow-md hover:shadow-lg"}
          >
            <Heart
              className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`}
            />
          </Button>
        </div>
        {showScheduleAction && (
          <Button
            onClick={handleAddToScheduleClick}
            variant="secondary"
            size="sm"
            className="mt-3 w-full rounded-lg border border-primary/30 bg-primary/10 font-semibold text-primary transition-all duration-200 hover:bg-primary/20"
          >
            <CalendarPlus className="mr-2 h-4 w-4" />
            Add to Schedule
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
