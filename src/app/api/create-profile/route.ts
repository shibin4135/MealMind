import { prisma } from "@/lib/config";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const POST = async () => {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        {
          message: "You must be logged in to create a profile",
          error: "UNAUTHORIZED",
        },
        {
          status: 401,
        }
      );
    }

    const email = clerkUser?.emailAddresses[0]?.emailAddress;
    if (!email) {
      return NextResponse.json(
        {
          message: "Email address not found. Please update your account settings.",
          error: "EMAIL_NOT_FOUND",
        },
        {
          status: 400,
        }
      );
    }

    // Check if profile already exists
    let existingUser;
    try {
      existingUser = await prisma.profile.findUnique({
        where: { userId: clerkUser.id },
      });
    } catch (dbError: any) {
      console.error("Error checking existing profile:", dbError);
      return NextResponse.json(
        {
          message: "Failed to check existing profile. Please try again.",
          error: "DATABASE_ERROR",
        },
        {
          status: 500,
        }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        {
          message: "Profile already exists. Redirecting to dashboard...",
          error: "PROFILE_EXISTS",
        },
        {
          status: 409,
        }
      );
    }

    // Create new profile
    let newProfile;
    try {
      newProfile = await prisma.profile.create({
        data: {
          userId: clerkUser.id,
          email,
          subscriptionIsActive: false,
          subscriptionTier: "Free",
          stripeSubscriptionId: null,
        },
      });
    } catch (dbError: any) {
      console.error("Error creating profile:", dbError);
      return NextResponse.json(
        {
          message: "Failed to create profile. Please try again or contact support.",
          error: "DATABASE_ERROR",
        },
        {
          status: 500,
        }
      );
    }

    console.log("Profile created successfully:", newProfile);

    return NextResponse.json(
      {
        message: "Profile created successfully",
        newProfile,
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Unexpected error creating profile:", error);
    return NextResponse.json(
      {
        message: error.message || "An unexpected error occurred. Please try again or contact support.",
        error: "INTERNAL_ERROR",
      },
      {
        status: 500,
      }
    );
  }
};
