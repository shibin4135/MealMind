"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
}

export function MealCard({ meal }: MealCardProps) {
  return (
    <Card className="border-0 shadow-sm rounded-xl hover:shadow-md transition overflow-hidden">
      <div className="relative">
        {meal.imageUrl ? (
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={meal.imageUrl}
              alt={meal.name}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="h-48 w-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
            <div className="text-5xl">🍽️</div>
          </div>
        )}
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-semibold line-clamp-2 flex-1 text-slate-900">
            {meal.name}
          </CardTitle>
          <Badge variant="secondary" className="ml-2 shrink-0 text-xs font-medium">
            {meal.category}
          </Badge>
        </div>
        {meal.description && (
          <CardDescription className="line-clamp-2 text-sm mt-1.5 text-slate-600">
            {meal.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm py-1.5 px-2 rounded-md bg-slate-50">
            <span className="text-slate-600 font-medium">Calories</span>
            <span className="font-semibold text-slate-900">{meal.calories}</span>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-1">Protein</div>
              <div className="font-semibold text-sm text-slate-900">{meal.protein}g</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-1">Carbs</div>
              <div className="font-semibold text-sm text-slate-900">{meal.carbs}g</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-1">Fat</div>
              <div className="font-semibold text-sm text-slate-900">{meal.fat}g</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
