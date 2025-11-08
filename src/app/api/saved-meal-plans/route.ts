import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/config";

// GET - Get user's saved meal plans
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
    const search = searchParams.get("search")?.toLowerCase() || "";

    const savedPlans = await prisma.savedMealPlan.findMany({
      where: {
        userId: clerkUser.id,
        ...(search && {
          title: {
            contains: search,
            mode: "insensitive",
          },
        }),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ savedPlans });
  } catch (error: any) {
    console.error("Error fetching saved meal plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved meal plans" },
      { status: 500 }
    );
  }
};

// POST - Save a meal plan
export const POST = async (req: NextRequest) => {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { title, mealPlan, preferences } = await req.json();

    if (!title || !mealPlan) {
      return NextResponse.json(
        { error: "Title and meal plan are required" },
        { status: 400 }
      );
    }

    const savedPlan = await prisma.savedMealPlan.create({
      data: {
        userId: clerkUser.id,
        title,
        mealPlan,
        preferences: preferences || null,
      },
    });

    return NextResponse.json({ savedPlan });
  } catch (error: any) {
    console.error("Error saving meal plan:", error);
    return NextResponse.json(
      { error: "Failed to save meal plan" },
      { status: 500 }
    );
  }
};

// DELETE - Delete a saved meal plan
export const DELETE = async (req: NextRequest) => {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const planId = searchParams.get("id");

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    // Verify the plan belongs to the user
    const plan = await prisma.savedMealPlan.findFirst({
      where: {
        id: planId,
        userId: clerkUser.id,
      },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Plan not found" },
        { status: 404 }
      );
    }

    await prisma.savedMealPlan.delete({
      where: {
        id: planId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting saved meal plan:", error);
    return NextResponse.json(
      { error: "Failed to delete saved meal plan" },
      { status: 500 }
    );
  }
};

