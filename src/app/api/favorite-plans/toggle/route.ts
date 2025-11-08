import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/config";

// POST - Toggle favorite status of a meal plan
export const POST = async (req: NextRequest) => {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { planId } = await req.json();

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    // Verify the plan exists and belongs to the user
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

    // Check if already favorited
    const existing = await prisma.favoritePlan.findUnique({
      where: {
        userId_planId: {
          userId: clerkUser.id,
          planId: planId,
        },
      },
    });

    if (existing) {
      // Remove from favorites
      await prisma.favoritePlan.delete({
        where: {
          id: existing.id,
        },
      });
      return NextResponse.json({ isFavorite: false });
    } else {
      // Add to favorites
      await prisma.favoritePlan.create({
        data: {
          userId: clerkUser.id,
          planId: planId,
        },
      });
      return NextResponse.json({ isFavorite: true });
    }
  } catch (error: any) {
    console.error("Error toggling favorite plan:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Plan already in favorites" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to toggle favorite plan" },
      { status: 500 }
    );
  }
};

