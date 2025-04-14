import { prisma } from "@/lib/config";
import { getPriceFromId } from "@/lib/Plans";
import { stripe } from "@/lib/Stripe";
import { currentUser } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    try {
        const { newPlan } = await req.json();

        if(!newPlan){
            return NextResponse.json({
                message: "No plan selected",
            })
        }

        const clerkUser = await currentUser();
        if (!clerkUser) {
            return NextResponse.json({
                message: "User not found",
            })
        }

        const profile = await prisma.profile.update({
            where: { userId: clerkUser.id },
            data: {
                subscrptionTier: newPlan
            }
        })

        if (!profile || !profile.stripeSubscriptionId) {
            return NextResponse.json({
                message: "No subscription found",
            })
        }

        const subscriptionId = profile.stripeSubscriptionId;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const subcriptionItemId = subscription.items.data[0].id;
        const priceId = getPriceFromId(newPlan)
        
        ;
        if (!priceId) {
            return NextResponse.json({
                message: "Invalid plan",
            });
        }


        const updatedStripeSubscription = await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end:true,
            items: [
                { id: subcriptionItemId, price: priceId }
            ]
        })

        
        return NextResponse.json({
            message: "Plan updated successfully",
            updatedStripeSubscription,
        })

    } catch (error) {
        console.log(error)
        return NextResponse.json({
            message: "Error updating plan",
        })
    }
}