import { getPriceFromId } from "@/lib/Plans";
import { stripe } from "@/lib/Stripe";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  
  try {
    const { planType, userId, email } = await req.json();
    if (!planType || !userId || !email) {
      return NextResponse.json({
        message: "All the fields are required",
      });
    }

    const isAllowedTypes = ["week", "month", "year"];

    if (!isAllowedTypes.includes(planType)) {
      return NextResponse.json({
        message: "Invalid plan type",
      });
    }

    const priceId = getPriceFromId(planType);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: email,
      mode: "subscription",
      metadata: { planType: planType, clerkUserId: userId },
      success_url: `${process.env.NEXT_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_BASE_URL}/cancel`,
    });

    return NextResponse.json({
      message: "Success",
      url: session.url,
    });
  } catch (error) {
    return NextResponse.json({
      message: "Internal Server Error",
      error,
    });
  }
};
