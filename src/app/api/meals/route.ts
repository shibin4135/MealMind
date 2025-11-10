import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/config";

// GET - Get all meals with optional filters
export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = category;
    }

    const meals = await prisma.meal.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get user's favorite meal IDs if authenticated
    let favoriteMealIds: string[] = [];
    try {
      const clerkUser = await currentUser();
      if (clerkUser) {
        const favorites = await prisma.favorite.findMany({
          where: { userId: clerkUser.id },
          select: { mealId: true },
        });
        favoriteMealIds = favorites.map((f) => f.mealId);
      }
    } catch (error) {
      // If user check fails, continue without favorite status
    }

    // Add favorite status to each meal
    const mealsWithFavorites = meals.map((meal) => ({
      ...meal,
      isFavorite: favoriteMealIds.includes(meal.id),
    }));

    return NextResponse.json({ meals: mealsWithFavorites });
  } catch (error: any) {
    console.error("Error fetching meals:", error);
    return NextResponse.json(
      { error: "Failed to fetch meals" },
      { status: 500 }
    );
  }
};

// POST - Create a meal (for seeding or admin use)
export const POST = async (req: NextRequest) => {
  try {
    const { name, description, calories, protein, carbs, fat, category, imageUrl } = await req.json();

    if (!name || !calories || !protein || !carbs || !fat || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const meal = await prisma.meal.create({
      data: {
        name,
        description,
        calories: parseInt(calories),
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fat: parseFloat(fat),
        category,
        imageUrl,
      },
    });

    return NextResponse.json({ meal });
  } catch (error: any) {
    console.error("Error creating meal:", error);
    return NextResponse.json(
      { error: "Failed to create meal" },
      { status: 500 }
    );
  }
};

