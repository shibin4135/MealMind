import { prisma } from "@/lib/config";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({
        message: "No user found",
      });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: clerkUser.id },
    });



    return NextResponse.json({
      subscription: profile,
    });
  } catch (error) {
    console.log("Error fetching subscription status", error);
    return NextResponse.json({
      message: "Internal server error",
    });
  }
};
