"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Image from "next/image";

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
  onToggleFavorite?: () => void;
  createIfNotExists?: boolean; // If true, send mealData to create meal if it doesn't exist
}

export function MealCard({ meal, isFavorite = false, onToggleFavorite, createIfNotExists = false }: MealCardProps) {
  const { user, isSignedIn } = useUser();
  const queryClient = useQueryClient();

  const toggleFavorite = async () => {
    if (!isSignedIn || !user?.id) {
      toast.error("Please sign in to favorite meals");
      return;
    }

    try {
      const body: any = {};
      if (createIfNotExists && !isFavorite) {
        // Send mealData to create meal if it doesn't exist
        body.mealData = {
          name: meal.name,
          description: meal.description || meal.name,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          category: meal.category,
          imageUrl: meal.imageUrl,
        };
      } else {
        body.mealId = meal.id;
      }

      const response = await fetch("/api/favorites", {
        method: isFavorite ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Failed to update favorite");
      }

      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      if (onToggleFavorite) {
        onToggleFavorite();
      }
      toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
    } catch (error) {
      toast.error("Failed to update favorite");
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.01] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="relative">
        {meal.imageUrl ? (
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={meal.imageUrl}
              alt={meal.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="h-48 w-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
            <div className="text-5xl">🍽️</div>
          </div>
        )}
        {isSignedIn && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-9 w-9 bg-white/95 dark:bg-slate-900/95 hover:bg-white dark:hover:bg-slate-900 backdrop-blur-sm shadow-sm border border-slate-200/50 dark:border-slate-700/50"
            onClick={toggleFavorite}
          >
            <Heart
              className={`h-4 w-4 transition-all duration-200 ${
                isFavorite
                  ? "fill-red-500 text-red-500 scale-110"
                  : "text-slate-400 hover:text-red-500"
              }`}
            />
          </Button>
        )}
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg sm:text-xl font-semibold line-clamp-2 flex-1 text-slate-900 dark:text-slate-50">
            {meal.name}
          </CardTitle>
          <Badge variant="secondary" className="ml-2 shrink-0 text-xs font-medium">
            {meal.category}
          </Badge>
        </div>
        {meal.description && (
          <CardDescription className="line-clamp-2 text-sm mt-1.5 text-slate-600 dark:text-slate-400">
            {meal.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm py-1.5 px-2 rounded-md bg-slate-50 dark:bg-slate-800/50">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Calories</span>
            <span className="font-bold text-slate-900 dark:text-slate-50">{meal.calories}</span>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="text-center">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Protein</div>
              <div className="font-semibold text-sm text-slate-900 dark:text-slate-50">{meal.protein}g</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Carbs</div>
              <div className="font-semibold text-sm text-slate-900 dark:text-slate-50">{meal.carbs}g</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Fat</div>
              <div className="font-semibold text-sm text-slate-900 dark:text-slate-50">{meal.fat}g</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

