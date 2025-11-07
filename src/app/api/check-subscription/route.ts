import { prisma } from "@/lib/config";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "User ID required" },
        { status: 400 }
      );
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: {
        subscriptionIsActive: true,
        stripeSubscriptionId: true,
        subscriptionTier: true,
      },
    });

    console.log("Subscription check for userId:", userId);
    console.log("Profile data:", profile);

    if (!profile) {
      console.log("No profile found for userId:", userId);
      return NextResponse.json({ isSubscribed: false });
    }

    // Return full subscription details so callers can show tier/id/status
    return NextResponse.json({
      isSubscribed: profile.subscriptionIsActive,
      subscription: {
        tier: profile.subscriptionTier,
        stripeSubscriptionId: profile.stripeSubscriptionId,
      },
    });
  } catch (error) {
    console.error("Error fetching details:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};
