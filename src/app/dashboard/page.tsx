"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, TrendingUp, UtensilsCrossed, Target, FileText, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Dashboard = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats", user?.id],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats");
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!user?.id && isLoaded && isSignedIn,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!isSignedIn) {
    router.push("/sign-up");
    return null;
  }

  const dailyGoals = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Track your daily nutrition and progress
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <CardHeader>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <CardHeader>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <CardHeader>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-12 w-full mb-2" />
                  <Skeleton className="h-2 w-full" />
                </CardContent>
              </Card>
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <CardHeader>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-2 w-full mb-2" />
                  <Skeleton className="h-2 w-full mb-2" />
                  <Skeleton className="h-2 w-full" />
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <CardHeader>
                    <Skeleton className="h-5 w-24 mb-2" />
                    <Skeleton className="h-4 w-20" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Progress Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-200 bg-white dark:bg-slate-900">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                    Saved Meal Plans
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Total saved meal plans</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
                      {stats?.summary?.savedMealPlans || 0}
                    </div>
                    <Link href="/saved-meal-plans">
                      <Button variant="ghost" size="sm" className="text-xs sm:text-sm h-8 sm:h-9">
                        View All →
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-200 bg-white dark:bg-slate-900">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                    Favorite Meals
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Total favorite meals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
                      {stats?.summary?.favoriteMeals || 0}
                    </div>
                    <Link href="/favorites">
                      <Button variant="ghost" size="sm" className="text-xs sm:text-sm h-8 sm:h-9">
                        View All →
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Daily Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-200 bg-white dark:bg-slate-900">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                    Daily Calories
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Today&apos;s calorie intake</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50">
                        {stats?.today?.calories || 0}
                      </span>
                      <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        / {dailyGoals.calories} cal
                      </span>
                    </div>
                    <Progress
                      value={Math.min((stats?.today?.calories || 0) / dailyGoals.calories * 100, 100)}
                      className="h-2.5"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-200 bg-white dark:bg-slate-900">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <UtensilsCrossed className="h-4 w-4 sm:h-5 sm:w-5" />
                    Macros
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Today&apos;s macro breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Protein</span>
                        <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-50">
                          {stats?.today?.protein || 0}g / {dailyGoals.protein}g
                        </span>
                      </div>
                      <Progress
                        value={Math.min((stats?.today?.protein || 0) / dailyGoals.protein * 100, 100)}
                        className="h-2.5"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Carbs</span>
                        <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-50">
                          {stats?.today?.carbs || 0}g / {dailyGoals.carbs}g
                        </span>
                      </div>
                      <Progress
                        value={Math.min((stats?.today?.carbs || 0) / dailyGoals.carbs * 100, 100)}
                        className="h-2.5"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Fat</span>
                        <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-50">
                          {stats?.today?.fat || 0}g / {dailyGoals.fat}g
                        </span>
                      </div>
                      <Progress
                        value={Math.min((stats?.today?.fat || 0) / dailyGoals.fat * 100, 100)}
                        className="h-2.5"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-200 bg-white dark:bg-slate-900">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <UtensilsCrossed className="h-4 w-4 sm:h-5 sm:w-5" />
                    Total Meals
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">This week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
                    {stats?.weekly?.totalMeals || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-200 bg-white dark:bg-slate-900">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                    Avg Calories
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Daily average this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
                    {stats?.weekly?.avgCalories || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-200 bg-white dark:bg-slate-900">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">Top Category</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Most selected this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50 capitalize">
                    {stats?.weekly?.mostSelectedCategory || "None"}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

