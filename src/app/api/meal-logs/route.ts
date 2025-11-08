import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/config";

// POST - Log a meal
export const POST = async (req: NextRequest) => {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { mealId, date } = await req.json();

    if (!mealId) {
      return NextResponse.json(
        { error: "Meal ID is required" },
        { status: 400 }
      );
    }

    // Check if meal exists
    const meal = await prisma.meal.findUnique({
      where: { id: mealId },
    });

    if (!meal) {
      return NextResponse.json(
        { error: "Meal not found" },
        { status: 404 }
      );
    }

    const mealLog = await prisma.mealLog.create({
      data: {
        userId: clerkUser.id,
        mealId: mealId,
        date: date ? new Date(date) : new Date(),
      },
      include: {
        meal: true,
      },
    });

    return NextResponse.json({ mealLog });
  } catch (error: any) {
    console.error("Error logging meal:", error);
    return NextResponse.json(
      { error: "Failed to log meal" },
      { status: 500 }
    );
  }
};

// GET - Get meal logs
export const GET = async (req: NextRequest) => {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    const where: any = {
      userId: clerkUser.id,
    };

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const mealLogs = await prisma.mealLog.findMany({
      where,
      include: {
        meal: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json({ mealLogs });
  } catch (error: any) {
    console.error("Error fetching meal logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch meal logs" },
      { status: 500 }
    );
  }
};

