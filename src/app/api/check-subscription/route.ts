import { prisma } from "@/lib/config";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId") as string;
        
        const profile = await prisma.profile.findUnique({
            where: { userId: userId },
            select: { subcriptionIsActive: true },
        });

        return NextResponse.json({
            isSubscribed: profile?.subcriptionIsActive,
        });

        
    } catch (error) {
        console.log("Error fetching details");
        return NextResponse.json(
            {
                message: "internal server error",
            },
            {
                status: 500,
            }
        );
    }
};
