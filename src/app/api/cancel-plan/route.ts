import { prisma } from "@/lib/config";
import { stripe } from "@/lib/Stripe";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const DELETE = async () => {
    try {
        const clerkUser = await currentUser();
        if (!clerkUser) {
            return NextResponse.json({
                message: "User not found",
            })
        }

        const profile = await prisma.profile.findUnique({
            where: { userId: clerkUser.id }
        })

        if (!profile) {
            return NextResponse.json({
                message: "No profile found"
            })
        }

        const subscriptionId = profile.stripeSubscriptionId;
        if (!subscriptionId) {
            return NextResponse.json({
                message: "No subscription  id found"
            })
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        if (!subscription) {
            return NextResponse.json({
                message: "No subscription found"
            })
        }


        await stripe.subscriptions.cancel(subscriptionId)


        const updatedDatabase = await prisma.profile.update({
            where: { userId: clerkUser.id },
            data: {
                stripeSubscriptionId: "",
                subscrptionTier: "Free",
                subcriptionIsActive: false
            }
        })

        return NextResponse.json({
            message: "Subscription cancelled successfully",
            updatedDatabase
        })
    } catch (error) {
        return NextResponse.json({
            message: "Error cancelling subscription",
        })
    }
}