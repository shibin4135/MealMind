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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3">
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium">
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
              <Card className="group relative border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-emerald-50/30 dark:from-slate-900 dark:to-emerald-950/20 overflow-hidden transform hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="pb-3 relative z-10">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-bold">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    Saved Meal Plans
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm font-medium">Total saved meal plans</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                      {stats?.summary?.savedMealPlans || 0}
                    </div>
                    <Link href="/saved-meal-plans">
                      <Button variant="ghost" size="sm" className="text-xs sm:text-sm h-9 hover:text-emerald-600 dark:hover:text-emerald-400">
                        View All →
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="group relative border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-pink-50/30 dark:from-slate-900 dark:to-pink-950/20 overflow-hidden transform hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="pb-3 relative z-10">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-bold">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                      <Heart className="h-5 w-5 text-white" />
                    </div>
                    Favorite Meals
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm font-medium">Total favorite meals</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-pink-600 to-rose-600 dark:from-pink-400 dark:to-rose-400 bg-clip-text text-transparent">
                      {stats?.summary?.favoriteMeals || 0}
                    </div>
                    <Link href="/favorites">
                      <Button variant="ghost" size="sm" className="text-xs sm:text-sm h-9 hover:text-pink-600 dark:hover:text-pink-400">
                        View All →
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Daily Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <Card className="group relative border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-amber-50/30 dark:from-slate-900 dark:to-amber-950/20 overflow-hidden transform hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="pb-3 relative z-10">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-bold">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    Daily Calories
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm font-medium">Today&apos;s calorie intake</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                        {stats?.today?.calories || 0}
                      </span>
                      <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                        / {dailyGoals.calories} cal
                      </span>
                    </div>
                    <Progress
                      value={Math.min((stats?.today?.calories || 0) / dailyGoals.calories * 100, 100)}
                      className="h-3 rounded-full"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="group relative border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-violet-50/30 dark:from-slate-900 dark:to-violet-950/20 overflow-hidden transform hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="pb-3 relative z-10">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-bold">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg">
                      <UtensilsCrossed className="h-5 w-5 text-white" />
                    </div>
                    Macros
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm font-medium">Today&apos;s macro breakdown</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold">Protein</span>
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-50">
                          {stats?.today?.protein || 0}g / {dailyGoals.protein}g
                        </span>
                      </div>
                      <Progress
                        value={Math.min((stats?.today?.protein || 0) / dailyGoals.protein * 100, 100)}
                        className="h-3 rounded-full"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold">Carbs</span>
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-50">
                          {stats?.today?.carbs || 0}g / {dailyGoals.carbs}g
                        </span>
                      </div>
                      <Progress
                        value={Math.min((stats?.today?.carbs || 0) / dailyGoals.carbs * 100, 100)}
                        className="h-3 rounded-full"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold">Fat</span>
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-50">
                          {stats?.today?.fat || 0}g / {dailyGoals.fat}g
                        </span>
                      </div>
                      <Progress
                        value={Math.min((stats?.today?.fat || 0) / dailyGoals.fat * 100, 100)}
                        className="h-3 rounded-full"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <Card className="group relative border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-cyan-50/30 dark:from-slate-900 dark:to-cyan-950/20 overflow-hidden transform hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="pb-3 relative z-10">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-bold">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
                      <UtensilsCrossed className="h-5 w-5 text-white" />
                    </div>
                    Total Meals
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm font-medium">This week</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                    {stats?.weekly?.totalMeals || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="group relative border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-indigo-50/30 dark:from-slate-900 dark:to-indigo-950/20 overflow-hidden transform hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="pb-3 relative z-10">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-bold">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    Avg Calories
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm font-medium">Daily average this week</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                    {stats?.weekly?.avgCalories || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="group relative border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-emerald-50/30 dark:from-slate-900 dark:to-emerald-950/20 overflow-hidden transform hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="pb-3 relative z-10">
                  <CardTitle className="text-base sm:text-lg font-bold">Top Category</CardTitle>
                  <CardDescription className="text-xs sm:text-sm font-medium">Most selected this week</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent capitalize">
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

