"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, TrendingUp, UtensilsCrossed, Target } from "lucide-react";
import { useRouter } from "next/navigation";

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Track your daily nutrition and progress
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        ) : (
          <>
            {/* Daily Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Daily Calories
                  </CardTitle>
                  <CardDescription>Today&apos;s calorie intake</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                        {stats?.today?.calories || 0}
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        / {dailyGoals.calories} cal
                      </span>
                    </div>
                    <Progress
                      value={Math.min((stats?.today?.calories || 0) / dailyGoals.calories * 100, 100)}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UtensilsCrossed className="h-5 w-5" />
                    Macros
                  </CardTitle>
                  <CardDescription>Today&apos;s macro breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Protein</span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                          {stats?.today?.protein || 0}g / {dailyGoals.protein}g
                        </span>
                      </div>
                      <Progress
                        value={Math.min((stats?.today?.protein || 0) / dailyGoals.protein * 100, 100)}
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Carbs</span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                          {stats?.today?.carbs || 0}g / {dailyGoals.carbs}g
                        </span>
                      </div>
                      <Progress
                        value={Math.min((stats?.today?.carbs || 0) / dailyGoals.carbs * 100, 100)}
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Fat</span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                          {stats?.today?.fat || 0}g / {dailyGoals.fat}g
                        </span>
                      </div>
                      <Progress
                        value={Math.min((stats?.today?.fat || 0) / dailyGoals.fat * 100, 100)}
                        className="h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UtensilsCrossed className="h-5 w-5" />
                    Total Meals
                  </CardTitle>
                  <CardDescription>This week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                    {stats?.weekly?.totalMeals || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Avg Calories
                  </CardTitle>
                  <CardDescription>Daily average this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                    {stats?.weekly?.avgCalories || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle>Top Category</CardTitle>
                  <CardDescription>Most selected this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-50 capitalize">
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

