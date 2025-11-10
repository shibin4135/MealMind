"use client";

import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MealCard } from "@/components/meal-card";
import { Loader2, Heart, Lock } from "lucide-react";
import Link from "next/link";

const Favorites = () => {
  const { isLoaded, isSignedIn } = useUser();
  const queryClient = useQueryClient();

  const { data: favoritesData, isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const response = await fetch("/api/favorites");
      if (!response.ok) return { favorites: [] };
      return response.json();
    },
    enabled: isSignedIn && isLoaded,
  });

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/50">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-2xl">Sign In Required</CardTitle>
              <CardDescription className="text-base mt-2">
                You need to be signed in to view your favorite meals.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg">
                  <Link href="/sign-up">Sign In</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/">Go to Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const favorites = favoritesData?.favorites || [];
  const meals = favorites.map((f: any) => ({ ...f.meal, isFavorite: true }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Favorite Meals</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Your saved meals for quick access
          </p>
        </div>

        {/* Content */}
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
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Heart className="h-10 w-10 text-slate-400 dark:text-slate-500" />
              </div>
              <CardTitle className="text-2xl">No favorites yet</CardTitle>
              <CardDescription className="text-base mt-2">
                Start exploring meals and save your favorites for easy access later.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-6">
              <Button asChild size="lg">
                <Link href="/meals">Browse Meals</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {meals.map((meal: any) => (
              <MealCard
                key={meal.id}
                meal={meal}
                isFavorite={true}
                onFavoriteChange={() => {
                  queryClient.invalidateQueries({ queryKey: ["favorites"] });
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

export default Favorites;
