import { prisma } from "@/lib/config";
import { stripe } from "@/lib/Stripe";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const DELETE = async () => {
    try {
        const clerkUser = await currentUser();
        if (!clerkUser) {
            return NextResponse.json(
                {
                    message: "You must be logged in to cancel your subscription",
                    error: "UNAUTHORIZED",
                },
                { status: 401 }
            );
        }

        const profile = await prisma.profile.findUnique({
            where: { userId: clerkUser.id }
        });

        if (!profile) {
            return NextResponse.json(
                {
                    message: "Profile not found. Please create a profile first.",
                    error: "PROFILE_NOT_FOUND",
                },
                { status: 404 }
            );
        }

        const subscriptionId = profile.stripeSubscriptionId;
        if (!subscriptionId) {
            // Already cancelled or no subscription
            return NextResponse.json(
                {
                    message: "No active subscription found to cancel",
                    error: "NO_SUBSCRIPTION",
                },
                { status: 404 }
            );
        }

        // Try to cancel the subscription in Stripe
        // If it doesn't exist, that's fine - just update our database
        let subscriptionExists = false;
        try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            subscriptionExists = true;
            
            // Subscription exists, try to cancel it
            try {
                await stripe.subscriptions.cancel(subscriptionId);
            } catch (cancelError: any) {
                console.error("Error cancelling Stripe subscription:", cancelError);
                // If cancel fails, check if it's because subscription is already cancelled
                if (cancelError.code === "resource_missing") {
                    // Subscription was deleted between retrieve and cancel, that's fine
                    subscriptionExists = false;
                } else {
                    // Other error, return error
                    return NextResponse.json(
                        {
                            message: cancelError.message || "Failed to cancel subscription in payment system",
                            error: "STRIPE_ERROR",
                        },
                        { status: 500 }
                    );
                }
            }
        } catch (retrieveError: any) {
            console.error("Error retrieving Stripe subscription:", retrieveError);
            // Subscription doesn't exist in Stripe (already cancelled or deleted)
            // This is fine - just update our database
            if (retrieveError.code !== "resource_missing") {
                // Unexpected error
                return NextResponse.json(
                    {
                        message: retrieveError.message || "Failed to retrieve subscription. Please try again.",
                        error: "STRIPE_ERROR",
                    },
                    { status: 500 }
                );
            }
            // resource_missing is expected - subscription already gone
            subscriptionExists = false;
        }

        // Update database regardless - subscription is cancelled either way
        try {
            await prisma.profile.update({
                where: { userId: clerkUser.id },
                data: {
                    stripeSubscriptionId: null,
                    subscriptionTier: "Free",
                    subscriptionIsActive: false,
                }
            });
        } catch (dbError: any) {
            console.error("Error updating database:", dbError);
            return NextResponse.json(
                {
                    message: subscriptionExists 
                        ? "Subscription cancelled in payment system, but failed to update your profile. Please contact support."
                        : "Failed to update your profile. Please contact support.",
                    error: "DATABASE_ERROR",
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                message: "Subscription cancelled successfully. Your account has been updated.",
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Unexpected error cancelling subscription:", error);
        return NextResponse.json(
            {
                message: error.message || "An unexpected error occurred while cancelling your subscription. Please try again or contact support.",
                error: "INTERNAL_ERROR",
            },
            { status: 500 }
        );
    }
};
