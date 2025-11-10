import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/config";

export const POST = async (req: NextRequest) => {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { mealId } = await req.json();

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

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_mealId: {
          userId: clerkUser.id,
          mealId: mealId,
        },
      },
    });

    if (existing) {
      // Remove from favorites
      await prisma.favorite.delete({
        where: {
          id: existing.id,
        },
      });
      return NextResponse.json({ isFavorite: false });
    } else {
      // Add to favorites
      await prisma.favorite.create({
        data: {
          userId: clerkUser.id,
          mealId: meal.id,
        },
      });
      return NextResponse.json({ isFavorite: true });
    }
  } catch (error: any) {
    console.error("Error toggling favorite:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Meal already in favorites" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to toggle favorite" },
      { status: 500 }
    );
  }
};

