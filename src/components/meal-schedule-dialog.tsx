"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  DayName,
  MealSlot,
  WEEK_DAYS,
  MEAL_SLOTS,
  getEarliestSelectableDay,
  isDayInPast,
} from "@/lib/schedule";
import { cn } from "@/lib/utils";

export interface MealOption {
  id: string;
  name: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  isFavorite?: boolean;
}

interface MealScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meals: MealOption[];
  defaultMealId?: string;
  defaultDay?: DayName;
  defaultSlot?: MealSlot;
  restrictMealSelection?: boolean;
  lockDayToDefault?: boolean;
  onSubmit: (payload: { day: DayName; slot: MealSlot; mealId: string }) => void;
}

export const MealScheduleDialog = ({
  open,
  onOpenChange,
  meals,
  defaultMealId,
  defaultDay = "Monday",
  defaultSlot = "Breakfast",
  restrictMealSelection = false,
  lockDayToDefault = false,
  onSubmit,
}: MealScheduleDialogProps) => {
  const [selectedMealId, setSelectedMealId] = useState<string | undefined>(
    defaultMealId,
  );
  const [selectedDay, setSelectedDay] = useState<DayName>(defaultDay);
  const [selectedSlot, setSelectedSlot] = useState<MealSlot>(defaultSlot);

  useEffect(() => {
    if (!open) return;
    const nextMealId = defaultMealId ?? meals[0]?.id;
    setSelectedMealId(nextMealId);

    const nextDay = lockDayToDefault && defaultDay
      ? defaultDay
      : getEarliestSelectableDay(defaultDay);

    setSelectedDay(nextDay);
    setSelectedSlot(defaultSlot);
  }, [
    defaultDay,
    defaultMealId,
    defaultSlot,
    meals,
    open,
    lockDayToDefault,
  ]);

  const selectedMeal = useMemo(
    () => meals.find((meal) => meal.id === selectedMealId),
    [meals, selectedMealId],
  );

  const handleSubmit = () => {
    if (!selectedMealId) return;
    onSubmit({ day: selectedDay, slot: selectedSlot, mealId: selectedMealId });
    onOpenChange(false);
  };

  const isSelectDisabled = restrictMealSelection || meals.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl border border-border bg-card/95 text-foreground shadow-2xl backdrop-blur transition-colors duration-300">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Schedule Meal
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Choose the meal, day, and slot to add it to your weekly schedule.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid gap-3">
            <span className="text-sm font-medium text-muted-foreground">
              Meal
            </span>
            <Select
              value={selectedMealId}
              onValueChange={setSelectedMealId}
              disabled={isSelectDisabled}
            >
              <SelectTrigger className="h-11 rounded-xl border border-border bg-background/90 text-sm transition-colors duration-200 focus-visible:ring-0">
                <SelectValue placeholder="Select a meal" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-border bg-card text-foreground shadow-lg">
                {meals.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground">
                    No meals available. Visit the Browse Meals page to add some
                    favorites.
                  </div>
                ) : (
                  meals.map((meal) => (
                    <SelectItem
                      key={meal.id}
                      value={meal.id}
                      className="rounded-lg text-sm"
                    >
                      {meal.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {restrictMealSelection && selectedMeal && (
              <span className="text-xs text-muted-foreground">
                Meal selection locked for this action. Choose the day and slot
                below.
              </span>
            )}
          </div>

          <Separator className="bg-border" />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">
                Day
              </span>
              <Select
                value={selectedDay}
                disabled={lockDayToDefault}
                onValueChange={(value) => setSelectedDay(value as DayName)}
              >
                <SelectTrigger className="h-11 rounded-xl border border-border bg-background/90 text-sm transition-colors duration-200 focus-visible:ring-0">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-border bg-card text-foreground shadow-lg">
                  {WEEK_DAYS.map((day) => (
                    <SelectItem
                      key={day}
                      value={day}
                      className="rounded-lg text-sm"
                      disabled={
                        lockDayToDefault
                          ? day !== defaultDay
                          : isDayInPast(day)
                      }
                    >
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">
                Meal Slot
              </span>
              <Select
                value={selectedSlot}
                onValueChange={(value) => setSelectedSlot(value as MealSlot)}
              >
                <SelectTrigger className="h-11 rounded-xl border border-border bg-background/90 text-sm transition-colors duration-200 focus-visible:ring-0">
                  <SelectValue placeholder="Select meal slot" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-border bg-card text-foreground shadow-lg">
                  {MEAL_SLOTS.map((slot) => (
                    <SelectItem key={slot} value={slot} className="rounded-lg text-sm">
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedMeal && (
            <div className="rounded-xl border border-border bg-muted/50 p-4">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">
                  {selectedMeal.name}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Calories", value: selectedMeal.calories },
                    { label: "Protein", value: selectedMeal.protein, unit: "g" },
                    { label: "Carbs", value: selectedMeal.carbs, unit: "g" },
                    { label: "Fat", value: selectedMeal.fat, unit: "g" },
                  ]
                    .filter((item) => item.value !== undefined)
                    .map((item) => (
                      <Badge
                        key={item.label}
                        variant="outline"
                        className={cn(
                          "rounded-full border border-border/80 bg-background/80 px-3 py-1 text-xs font-medium text-foreground",
                        )}
                      >
                        {item.label}: {item.value}
                        {item.unit ? item.unit : ""}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            className="h-10 rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedMealId}
            className="h-10 rounded-xl"
          >
            Save to Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

