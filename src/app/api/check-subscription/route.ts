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
  } catch (error: any) {
    console.error("Error fetching subscription details:", error);
    
    // Handle case where Profile table doesn't exist (database not migrated)
    if (error.code === "P2021" || error.message?.includes("does not exist")) {
      console.warn("Profile table not found - database may need migrations");
      return NextResponse.json({ 
        isSubscribed: false,
        subscription: null,
      });
    }
    
    return NextResponse.json(
      { 
        message: error.message || "Failed to fetch subscription details. Please try again.",
        error: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
};
