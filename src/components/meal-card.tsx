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
}

export function MealCard({ meal, isFavorite = false, onToggleFavorite }: MealCardProps) {
  const { user, isSignedIn } = useUser();
  const queryClient = useQueryClient();

  const toggleFavorite = async () => {
    if (!isSignedIn || !user?.id) {
      toast.error("Please sign in to favorite meals");
      return;
    }

    try {
      const response = await fetch("/api/favorites", {
        method: isFavorite ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mealId: meal.id }),
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
    <Card className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-slate-200 dark:border-slate-800">
      <div className="relative">
        {meal.imageUrl ? (
          <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
            <Image
              src={meal.imageUrl}
              alt={meal.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
        ) : (
          <div className="h-48 w-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-t-lg flex items-center justify-center">
            <div className="text-4xl">🍽️</div>
          </div>
        )}
        {isSignedIn && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-900"
            onClick={toggleFavorite}
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                isFavorite
                  ? "fill-red-500 text-red-500"
                  : "text-slate-400 hover:text-red-500"
              }`}
            />
          </Button>
        )}
      </div>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{meal.name}</CardTitle>
          <Badge variant="secondary" className="ml-2">
            {meal.category}
          </Badge>
        </div>
        {meal.description && (
          <CardDescription className="line-clamp-2">
            {meal.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Calories</span>
            <span className="font-semibold text-slate-900 dark:text-slate-50">{meal.calories}</span>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Protein</div>
              <div className="font-semibold text-slate-900 dark:text-slate-50">{meal.protein}g</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Carbs</div>
              <div className="font-semibold text-slate-900 dark:text-slate-50">{meal.carbs}g</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Fat</div>
              <div className="font-semibold text-slate-900 dark:text-slate-50">{meal.fat}g</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

