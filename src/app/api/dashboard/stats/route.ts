import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/config";

export const GET = async (req: NextRequest) => {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Get today's meal logs
    const todayLogs = await prisma.mealLog.findMany({
      where: {
        userId: clerkUser.id,
        date: {
          gte: today,
        },
      },
      include: {
        meal: true,
      },
    });

    // Calculate today's totals
    const todayCalories = todayLogs.reduce((sum, log) => sum + log.meal.calories, 0);
    const todayProtein = todayLogs.reduce((sum, log) => sum + log.meal.protein, 0);
    const todayCarbs = todayLogs.reduce((sum, log) => sum + log.meal.carbs, 0);
    const todayFat = todayLogs.reduce((sum, log) => sum + log.meal.fat, 0);

    // Get weekly stats
    const weeklyLogs = await prisma.mealLog.findMany({
      where: {
        userId: clerkUser.id,
        date: {
          gte: weekAgo,
        },
      },
      include: {
        meal: true,
      },
    });

    const totalMeals = weeklyLogs.length;
    const avgCalories = totalMeals > 0
      ? Math.round(weeklyLogs.reduce((sum, log) => sum + log.meal.calories, 0) / 7)
      : 0;

    // Most selected category
    const categoryCounts: { [key: string]: number } = {};
    weeklyLogs.forEach(log => {
      categoryCounts[log.meal.category] = (categoryCounts[log.meal.category] || 0) + 1;
    });
    const mostSelectedCategory = Object.keys(categoryCounts).reduce((a, b) =>
      categoryCounts[a] > categoryCounts[b] ? a : b, "None"
    );

    return NextResponse.json({
      today: {
        calories: todayCalories,
        protein: Math.round(todayProtein * 10) / 10,
        carbs: Math.round(todayCarbs * 10) / 10,
        fat: Math.round(todayFat * 10) / 10,
      },
      weekly: {
        totalMeals,
        avgCalories,
        mostSelectedCategory,
      },
    });
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
};

