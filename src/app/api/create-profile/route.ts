import { prisma } from "@/lib/config";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const POST = async () => {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        {
          message: "No user found",
        },
        {
          status: 404,
        }
      );
    }

    const email = clerkUser?.emailAddresses[0].emailAddress;
    const existinguser = await prisma.profile.findUnique({
      where: { userId: clerkUser.id },
    });

    if (existinguser) {
      return NextResponse.json(
        {
          message: "Profile already exists",
        },
        {
          status: 409,
        }
      );
    }

    const newProfile = await prisma.profile.create({
      data: {
        userId: clerkUser.id,
        email,
        subcriptionIsActive: false,
        subscrptionTier: "Free",
        stripeSubscriptionId: "",
      },
    });
    console.log(newProfile);

    return NextResponse.json(
      {
        message: "Profile Created Successfuly",
        newProfile,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("Something went wrong please try again later", error);
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
};
