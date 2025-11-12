"use client";

import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
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
      <div className="min-h-screen bg-background flex items-center justify-center pt-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-20 px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="border border-border bg-muted/10">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl text-foreground">Sign In Required</CardTitle>
              <CardDescription className="text-base mt-2 text-muted-foreground">
                You need to be signed in to view your favorite meals.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="rounded-xl">
                  <Link href="/sign-up">Sign In</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-xl">
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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Header */}
        <header className="space-y-4 text-center md:text-left">
          <div className="inline-flex items-center rounded-full bg-muted/40 px-4 py-1 text-sm font-medium text-muted-foreground">
            Favorites
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-semibold">
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                Favorite Meals
              </span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
              Your saved meals for quick access
            </p>
          </div>
        </header>

        <Separator className="bg-border" />

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border border-border bg-muted/10">
                <Skeleton className="h-48 w-full rounded-t-xl" />
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
          <Card className="border border-border bg-muted/10">
            <CardContent className="space-y-6 py-16 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-muted text-3xl">
                <Heart className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-foreground">
                  No favorites yet
                </h3>
                <p className="mx-auto max-w-md text-base text-muted-foreground">
                  Start exploring meals and save your favorites for easy access later.
                </p>
              </div>
              <Button asChild size="lg" className="rounded-xl">
                <Link href="/meals">Browse Meals</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
