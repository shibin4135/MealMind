import { prisma } from "@/lib/config";
import { stripe } from "@/lib/Stripe";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

async function getSessionStatus(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });
    return session;
  } catch (error) {
    console.error("Error retrieving session:", error);
    return null;
  }
}

async function updateUserProfile(userId: string, session: any) {
  try {
    const subscriptionId = session.subscription?.id;
    if (!subscriptionId) {
      console.error("No subscription ID found in session");
      return;
    }

    await prisma.profile.update({
      where: { userId },
      data: {
        stripeSubscriptionId: subscriptionId,
        subscriptionIsActive: true,
        subscriptionTier: session.metadata?.planType || 'premium',
      },
    });

    console.log("Profile updated successfully in success page");
  } catch (error) {
    console.error("Error updating profile:", error);
  }
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id: string }>;
}) {
  const authResult = await auth();
  const userId = authResult.userId;
  const params = await searchParams;
  const sessionId = params.session_id;

  if (!sessionId || !userId) {
    redirect("/");
  }

  const session = await getSessionStatus(sessionId);

  if (!session || session.payment_status !== "paid") {
    redirect("/");
  }

  // Check if profile needs updating
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { subscriptionIsActive: true },
  });

  if (!profile?.subscriptionIsActive) {
    console.log("Profile not active, updating...");
    await updateUserProfile(userId, session);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription className="text-base mt-2">
            Your payment has been processed successfully. Thank you for your purchase!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/mealplan">Go to Meal Planner</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Go to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
