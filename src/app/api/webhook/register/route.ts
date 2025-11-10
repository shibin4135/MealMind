import { prisma } from "@/lib/config";
import { stripe } from "@/lib/Stripe";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: Stripe.Event;
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleCustomerSubscriptionDeleted(subscription);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.log("Error in webhook:", error.message);
    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 400,
      }
    );
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  console.log("Webhook: Processing checkout session completion");
  console.log("Session metadata:", session.metadata);
  console.log("Session subscription ID:", session.subscription);

  const userId = session.metadata?.clerkUserId;

  if (!userId) {
    console.log("No user Id found in session metadata");
    return;
  }

  const subscriptionId = session.subscription as string;
  if (!subscriptionId) {
    console.log("No subscription ID found in session");
    return;
  }

  try {
    const emailFromStripe =
      (session as any).customer_email ||
      (session as any).customer_details?.email ||
      "unknown@placeholder.local";

    // Create the profile if it doesn't exist; otherwise update it
    const updatedProfile = await prisma.profile.upsert({
      where: { userId },
      update: {
        stripeSubscriptionId: subscriptionId,
        subscriptionIsActive: true,
        subscriptionTier: session.metadata?.planType || "premium",
      },
      create: {
        userId,
        email: emailFromStripe,
        stripeSubscriptionId: subscriptionId,
        subscriptionIsActive: true,
        subscriptionTier: session.metadata?.planType || "premium",
      },
    });

    console.log("Updated profile:", updatedProfile);
    console.log(
      `Subscription for user ${userId} updated successfully`,
      session.customer_email
    );
  } catch (error) {
    console.error("Error updating user profile:", error);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subId = invoice.subscription as string;
  let userId: string | undefined;

  try {
    const profile = await prisma.profile.findUnique({
      where: { stripeSubscriptionId: subId },
      select: { userId: true },
    });

    if (profile?.userId) {
      userId = profile.userId;
    }

    if (!userId) {
      console.log("No user Id found for subscription:", subId);
      return;
    }

    // Use updateMany to avoid throwing if profile doesn't exist
    await prisma.profile.updateMany({
      where: { userId: userId },
      data: {
        subscriptionIsActive: false,
        subscriptionTier: "Free",
        stripeSubscriptionId: null,
      },
    });

    console.log(`User ${userId}'s subscription deactivated due to failed payment`);
  } catch (error) {
    console.error("Error handling failed payment for invoice:", error);
  }
}

async function handleCustomerSubscriptionDeleted(
  subscription: Stripe.Subscription
) {
  const subId = subscription.id as string;
  let userId: string | undefined;

  try {
    const profile = await prisma.profile.findUnique({
      where: { stripeSubscriptionId: subId },
      select: { userId: true },
    });

    if (profile?.userId) {
      userId = profile.userId;
    }

    if (!userId) {
      console.log("No user Id found for subscription:", subId);
      return;
    }

    // Use updateMany to avoid throwing if profile doesn't exist
    await prisma.profile.updateMany({
      where: { userId: userId },
      data: {
        subscriptionIsActive: false,
        subscriptionTier: "Free",
        stripeSubscriptionId: null,
      },
    });

    console.log(`User ${userId}'s subscription cancelled`);
  } catch (error) {
    console.error("Error handling subscription cancellation:", error);
  }
}
