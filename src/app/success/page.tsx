import { prisma } from "@/lib/config";
import { stripe } from "@/lib/Stripe";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

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
  searchParams: { session_id: string };
}) {
  const authResult = await auth();
  const userId = authResult.userId;
  const sessionId = searchParams.session_id;

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
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-green-400 to-blue-500">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <div className="mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-24 h-24 text-green-500 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 11l3 3L22 4M9 19l3-3L22 4"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          Payment Successful!
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Your payment has been processed successfully. Thank you for your
          purchase!
        </p>
        <div className="space-x-4">
          <button className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition duration-300">
            <Link href={"/"}> Go to Dashboard</Link>
          </button>
          <button className="bg-gray-200 text-gray-800 px-6 py-2 rounded-full hover:bg-gray-300 transition duration-300">
            <Link href={"/"}> Go to Home</Link>
          </button>
        </div>
      </div>
    </div>
  );
};


