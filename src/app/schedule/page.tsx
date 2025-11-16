"use client";

import React, { useEffect, useMemo } from "react";
import { usePersistentSchedule } from "@/hooks/usePersistentSchedule";
import { DayName, MealSlot, WEEK_DAYS, MEAL_SLOTS, getTodayDayName } from "@/lib/schedule";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trash2, Calendar, UtensilsCrossed } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const SchedulePage = () => {
  const { schedule, isLoaded, updateSchedule, filledCellsCount } = usePersistentSchedule();

  useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.classList.add("dark");
  }, []);

  const todayDayName = getTodayDayName();

  const handleRemoveMeal = (day: DayName, slot: MealSlot) => {
    updateSchedule((previous) => {
      const next = structuredClone(previous);
      next[day][slot] = null;
      return next;
    });
    toast.success("Meal removed from schedule");
  };

  const handleClearSchedule = () => {
    if (filledCellsCount === 0) {
      toast.error("Schedule is already empty");
      return;
    }
    if (window.confirm("Are you sure you want to clear your entire schedule?")) {
      updateSchedule((previous) => {
        const next = structuredClone(previous);
        WEEK_DAYS.forEach((day) => {
          MEAL_SLOTS.forEach((slot) => {
            next[day][slot] = null;
          });
        });
        return next;
      });
      toast.success("Schedule cleared");
    }
  };

  const totalCalories = useMemo(() => {
    return WEEK_DAYS.reduce((total, day) => {
      return (
        total +
        MEAL_SLOTS.reduce((dayTotal, slot) => {
          const meal = schedule[day]?.[slot]?.meal;
          return dayTotal + (meal?.calories || 0);
        }, 0)
      );
    }, 0);
  }, [schedule]);

  const totalProtein = useMemo(() => {
    return WEEK_DAYS.reduce((total, day) => {
      return (
        total +
        MEAL_SLOTS.reduce((dayTotal, slot) => {
          const meal = schedule[day]?.[slot]?.meal;
          return dayTotal + (meal?.protein || 0);
        }, 0)
      );
    }, 0);
  }, [schedule]);

  if (!isLoaded) {
    return (
      <div className="dark min-h-screen bg-background text-foreground transition-colors duration-300 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-muted/40 rounded-xl w-1/3" />
            <div className="h-64 bg-muted/40 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground transition-colors duration-300 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Header */}
        <header className="space-y-4 text-center md:text-left">
          <div className="inline-flex items-center rounded-full bg-muted/40 px-4 py-1 text-sm font-medium text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            Weekly Schedule
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-semibold">
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                My Meal Schedule
              </span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
              View and manage your weekly meal schedule. Remove meals or clear your entire schedule.
            </p>
          </div>
        </header>

        <Separator className="bg-border" />

        {/* Stats Summary */}
        {filledCellsCount > 0 && (
          <Card className="border border-border bg-muted/10">
            <CardContent className="py-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center sm:text-left">
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Scheduled Meals
                  </div>
                  <div className="text-2xl font-semibold text-foreground">
                    {filledCellsCount}
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Total Calories
                  </div>
                  <div className="text-2xl font-semibold text-foreground">
                    {totalCalories.toLocaleString()}
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Total Protein
                  </div>
                  <div className="text-2xl font-semibold text-foreground">
                    {totalProtein}g
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Schedule Table */}
        <Card className="border border-border bg-muted/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-semibold">Weekly Meal Schedule</CardTitle>
            {filledCellsCount > 0 && (
              <Button
                onClick={handleClearSchedule}
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {filledCellsCount === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-muted text-3xl">
                  <UtensilsCrossed className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold text-foreground">
                    No meals scheduled
                  </h3>
                  <p className="mx-auto max-w-md text-base text-muted-foreground">
                    Start building your weekly meal schedule by adding meals from the Browse Meals page.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  {/* Header Row */}
                  <div className="grid grid-cols-8 gap-2 mb-2">
                    <div className="font-semibold text-sm text-muted-foreground p-2">
                      Day
                    </div>
                    {MEAL_SLOTS.map((slot) => (
                      <div
                        key={slot}
                        className="font-semibold text-sm text-muted-foreground p-2 text-center"
                      >
                        {slot}
                      </div>
                    ))}
                  </div>
                  <Separator className="mb-4" />

                  {/* Schedule Rows */}
                  {WEEK_DAYS.map((day) => {
                    const isToday = day === todayDayName;
                    return (
                      <div key={day} className="mb-4 last:mb-0">
                        <div
                          className={cn(
                            "grid grid-cols-8 gap-2 p-3 rounded-xl transition-colors",
                            isToday
                              ? "bg-primary/10 border border-primary/30"
                              : "bg-muted/30 hover:bg-muted/50"
                          )}
                        >
                          {/* Day Name */}
                          <div className="flex items-center">
                            <span
                              className={cn(
                                "font-semibold text-sm",
                                isToday
                                  ? "text-primary"
                                  : "text-foreground"
                              )}
                            >
                              {day}
                              {isToday && (
                                <Badge
                                  variant="secondary"
                                  className="ml-2 text-xs bg-primary/20 text-primary border-primary/30"
                                >
                                  Today
                                </Badge>
                              )}
                            </span>
                          </div>

                          {/* Meal Slots */}
                          {MEAL_SLOTS.map((slot) => {
                            const mealEntry = schedule[day]?.[slot];
                            const meal = mealEntry?.meal;

                            return (
                              <div
                                key={slot}
                                className="relative min-h-[80px] rounded-lg border border-border bg-card/50 p-3 transition-all hover:shadow-md"
                              >
                                {meal ? (
                                  <div className="space-y-2 h-full flex flex-col">
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-sm text-foreground line-clamp-2 mb-2">
                                        {meal.name}
                                      </h4>
                                      <div className="flex flex-wrap gap-1">
                                        {meal.calories && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs px-2 py-0.5"
                                          >
                                            {meal.calories} cal
                                          </Badge>
                                        )}
                                        {meal.protein && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs px-2 py-0.5"
                                          >
                                            {meal.protein}g P
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    <Button
                                      onClick={() => handleRemoveMeal(day, slot)}
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-full text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash2 className="h-3 w-3 mr-1" />
                                      Remove
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                                    Empty
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SchedulePage;

