import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/config";

// POST - Add all meals from a meal plan to favorites
export const POST = async (req: NextRequest) => {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { mealPlan } = await req.json();

    if (!mealPlan) {
      return NextResponse.json(
        { error: "Meal plan is required" },
        { status: 400 }
      );
    }

    // Extract meal names from the meal plan
    const mealNames: string[] = [];
    Object.values(mealPlan).forEach((day: any) => {
      if (day.Breakfast) mealNames.push(day.Breakfast);
      if (day.Lunch) mealNames.push(day.Lunch);
      if (day.Dinner) mealNames.push(day.Dinner);
      if (day.Snacks) mealNames.push(day.Snacks);
    });

    // For each meal name, try to find or create a meal in the database
    // Since the generated meals are text descriptions, we'll create simple meal entries
    // or match them to existing meals by name
    let addedCount = 0;
    const errors: string[] = [];

    for (const mealName of mealNames) {
      try {
        // Extract meal name (before the dash and calories)
        const cleanName = mealName.split(" - ")[0].trim();

        // Try to find existing meal by name
        let meal = await prisma.meal.findFirst({
          where: {
            name: {
              contains: cleanName,
              mode: "insensitive",
            },
          },
        });

        // If meal doesn't exist, create a basic meal entry
        if (!meal) {
          // Extract calories if available
          const caloriesMatch = mealName.match(/(\d+)\s*calories?/i);
          const calories = caloriesMatch ? parseInt(caloriesMatch[1]) : 0;

          meal = await prisma.meal.create({
            data: {
              name: cleanName,
              description: mealName,
              calories: calories || 0,
              protein: 0,
              carbs: 0,
              fat: 0,
              category: "Quick Meal",
            },
          });
        }

        // Check if already favorited
        const existing = await prisma.favorite.findUnique({
          where: {
            userId_mealId: {
              userId: clerkUser.id,
              mealId: meal.id,
            },
          },
        });

        if (!existing) {
          await prisma.favorite.create({
            data: {
              userId: clerkUser.id,
              mealId: meal.id,
            },
          });
          addedCount++;
        }
      } catch (error: any) {
        errors.push(`Failed to add ${mealName}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      addedCount,
      totalMeals: mealNames.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Error adding meals to favorites:", error);
    return NextResponse.json(
      { error: "Failed to add meals to favorites" },
      { status: 500 }
    );
  }
};

