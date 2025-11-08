import { NextResponse } from "next/server";
import { prisma } from "@/lib/config";

const sampleMeals = [
  {
    name: "Greek Yogurt Bowl",
    description: "Creamy Greek yogurt topped with fresh berries, honey, and granola",
    calories: 320,
    protein: 20,
    carbs: 45,
    fat: 8,
    category: "Breakfast",
  },
  {
    name: "Avocado Toast",
    description: "Whole grain toast with mashed avocado, poached eggs, and cherry tomatoes",
    calories: 380,
    protein: 15,
    carbs: 35,
    fat: 22,
    category: "Breakfast",
  },
  {
    name: "Overnight Oats",
    description: "Oats soaked in almond milk with chia seeds, banana, and nuts",
    calories: 350,
    protein: 12,
    carbs: 55,
    fat: 10,
    category: "Breakfast",
  },
  {
    name: "Grilled Chicken Salad",
    description: "Mixed greens with grilled chicken breast, vegetables, and vinaigrette",
    calories: 420,
    protein: 35,
    carbs: 20,
    fat: 22,
    category: "High Protein",
  },
  {
    name: "Quinoa Buddha Bowl",
    description: "Quinoa, roasted vegetables, chickpeas, tahini dressing",
    calories: 480,
    protein: 18,
    carbs: 65,
    fat: 18,
    category: "Vegetarian",
  },
  {
    name: "Mediterranean Wrap",
    description: "Whole wheat wrap with hummus, vegetables, feta cheese, and olives",
    calories: 390,
    protein: 16,
    carbs: 42,
    fat: 18,
    category: "Vegetarian",
  },
  {
    name: "Salmon with Sweet Potato",
    description: "Baked salmon with roasted sweet potato and steamed broccoli",
    calories: 520,
    protein: 38,
    carbs: 45,
    fat: 22,
    category: "High Protein",
  },
  {
    name: "Chicken Stir Fry",
    description: "Stir-fried chicken with mixed vegetables and brown rice",
    calories: 450,
    protein: 32,
    carbs: 50,
    fat: 12,
    category: "Quick Meal",
  },
  {
    name: "Vegetable Soup",
    description: "Hearty vegetable soup with beans and whole grain bread",
    calories: 280,
    protein: 12,
    carbs: 45,
    fat: 6,
    category: "Vegetarian",
  },
  {
    name: "Protein Smoothie",
    description: "Banana, spinach, protein powder, and almond milk",
    calories: 320,
    protein: 25,
    carbs: 35,
    fat: 8,
    category: "Quick Meal",
  },
];

export const POST = async () => {
  try {
    // Check if meals already exist
    const existingMeals = await prisma.meal.findMany();
    if (existingMeals.length > 0) {
      return NextResponse.json({
        message: "Meals already seeded",
        count: existingMeals.length,
      });
    }

    // Create sample meals
    const createdMeals = await prisma.meal.createMany({
      data: sampleMeals,
    });

    return NextResponse.json({
      message: "Meals seeded successfully",
      count: createdMeals.count,
    });
  } catch (error: any) {
    console.error("Error seeding meals:", error);
    return NextResponse.json(
      { error: "Failed to seed meals" },
      { status: 500 }
    );
  }
};

