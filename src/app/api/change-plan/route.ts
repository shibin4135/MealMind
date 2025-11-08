import { prisma } from "@/lib/config";
import { getPriceFromId } from "@/lib/Plans";
import { stripe } from "@/lib/Stripe";
import { currentUser } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    try {
        const { newPlan } = await req.json();

        if (!newPlan) {
            return NextResponse.json(
                {
                    message: "Please select a plan to update to",
                    error: "MISSING_PLAN",
                },
                { status: 400 }
            );
        }

        const clerkUser = await currentUser();
        if (!clerkUser) {
            return NextResponse.json(
                {
                    message: "You must be logged in to change your plan",
                    error: "UNAUTHORIZED",
                },
                { status: 401 }
            );
        }

        // Get user profile
        let profile;
        try {
            profile = await prisma.profile.findUnique({
                where: { userId: clerkUser.id }
            });
        } catch (dbError: any) {
            console.error("Error fetching profile:", dbError);
            return NextResponse.json(
                {
                    message: "Failed to retrieve your profile. Please try again.",
                    error: "DATABASE_ERROR",
                },
                { status: 500 }
            );
        }

        if (!profile) {
            return NextResponse.json(
                {
                    message: "Profile not found. Please create a profile first.",
                    error: "PROFILE_NOT_FOUND",
                },
                { status: 404 }
            );
        }

        if (!profile.stripeSubscriptionId) {
            return NextResponse.json(
                {
                    message: "No active subscription found. Please subscribe to a plan first.",
                    error: "NO_SUBSCRIPTION",
                },
                { status: 404 }
            );
        }

        const subscriptionId = profile.stripeSubscriptionId;

        // Get price ID for the new plan
        const priceId = getPriceFromId(newPlan);
        if (!priceId) {
            return NextResponse.json(
                {
                    message: `Invalid plan selected: ${newPlan}. Please select a valid plan.`,
                    error: "INVALID_PLAN",
                },
                { status: 400 }
            );
        }

        // Retrieve subscription from Stripe
        let subscription: any;
        try {
            subscription = await stripe.subscriptions.retrieve(subscriptionId);
        } catch (stripeError: any) {
            console.error("Error retrieving Stripe subscription:", stripeError);
            if (stripeError.code === "resource_missing") {
                return NextResponse.json(
                    {
                        message: "Subscription not found in payment system. Please contact support.",
                        error: "SUBSCRIPTION_NOT_FOUND",
                    },
                    { status: 404 }
                );
            }
            return NextResponse.json(
                {
                    message: stripeError.message || "Failed to retrieve subscription. Please try again.",
                    error: "STRIPE_ERROR",
                },
                { status: 500 }
            );
        }

        if (!subscription || !subscription.items || !subscription.items.data || subscription.items.data.length === 0) {
            return NextResponse.json(
                {
                    message: "Invalid subscription data. Please contact support.",
                    error: "INVALID_SUBSCRIPTION",
                },
                { status: 500 }
            );
        }

        const subscriptionItemId = subscription.items.data[0].id;

        // Update subscription in Stripe
        let updatedStripeSubscription: any;
        try {
            updatedStripeSubscription = await stripe.subscriptions.update(subscriptionId, {
                cancel_at_period_end: false, // Allow immediate change
                items: [
                    { id: subscriptionItemId, price: priceId }
                ],
                proration_behavior: "always_invoice", // Prorate the difference
            });
        } catch (stripeError: any) {
            console.error("Error updating Stripe subscription:", stripeError);
            return NextResponse.json(
                {
                    message: stripeError.message || "Failed to update subscription in payment system. Please try again or contact support.",
                    error: "STRIPE_UPDATE_ERROR",
                },
                { status: 500 }
            );
        }

        // Update database
        try {
            await prisma.profile.update({
                where: { userId: clerkUser.id },
                data: {
                    subscriptionTier: newPlan,
                }
            });
        } catch (dbError: any) {
            console.error("Error updating database:", dbError);
            // Subscription updated in Stripe but not in DB - log for manual fix
            return NextResponse.json(
                {
                    message: "Plan updated in payment system, but failed to update your profile. Please contact support to verify your plan.",
                    error: "DATABASE_ERROR",
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                message: "Plan updated successfully! Your subscription has been changed and you'll be billed accordingly.",
                updatedStripeSubscription,
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error("Unexpected error updating plan:", error);
        return NextResponse.json(
            {
                message: error.message || "An unexpected error occurred while updating your plan. Please try again or contact support.",
                error: "INTERNAL_ERROR",
            },
            { status: 500 }
        );
    }
};
