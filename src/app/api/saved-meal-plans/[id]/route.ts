import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/config";

// GET - Get a specific saved meal plan
export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const savedPlan = await prisma.savedMealPlan.findFirst({
      where: {
        id,
        userId: clerkUser.id,
      },
    });

    if (!savedPlan) {
      return NextResponse.json(
        { error: "Plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ savedPlan });
  } catch (error: any) {
    console.error("Error fetching saved meal plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved meal plan" },
      { status: 500 }
    );
  }
};

