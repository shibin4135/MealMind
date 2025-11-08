import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/config";

// GET - Get user's favorites
export const GET = async (req: NextRequest) => {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: clerkUser.id },
      include: {
        meal: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ favorites });
  } catch (error: any) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
};

// POST - Add favorite
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
      return NextResponse.json(
        { error: "Meal already in favorites" },
        { status: 409 }
      );
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: clerkUser.id,
        mealId: mealId,
      },
      include: {
        meal: true,
      },
    });

    return NextResponse.json({ favorite });
  } catch (error: any) {
    console.error("Error adding favorite:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Meal already in favorites" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to add favorite" },
      { status: 500 }
    );
  }
};

// DELETE - Remove favorite
export const DELETE = async (req: NextRequest) => {
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

    await prisma.favorite.deleteMany({
      where: {
        userId: clerkUser.id,
        mealId: mealId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error removing favorite:", error);
    return NextResponse.json(
      { error: "Failed to remove favorite" },
      { status: 500 }
    );
  }
};

