import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoutes = createRouteMatcher([
  "/",
  "/sign-up(.*)",
  "/subscribe(.*)",
  "/api/webhook/register",
  "/api/check-subscription",
]);

const mealPlanRoute = createRouteMatcher(["/mealplan"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const { origin } = req.nextUrl;

  if (!userId && !isPublicRoutes(req)) {
    return NextResponse.redirect(new URL("/sign-up", req.url));
  }

  if (mealPlanRoute(req) && userId) {
    try {
      console.log("Checking subscription in middleware for userId:", userId);
      const res = await fetch(
        `${origin}/api/check-subscription?userId=${userId}`
      );

      if (!res.ok) {
        console.error("Subscription check failed with status:", res.status);
        // Don't redirect on server error, let the user through
        if (res.status >= 500) {
          return NextResponse.next();
        }
      }

      const data = await res.json();
      console.log("Subscription check response:", data);

      if (!data.isSubscribed) {
        console.log("User not subscribed, redirecting to subscribe page");
        return NextResponse.redirect(new URL("/subscribe", origin));
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      // Don't redirect on network errors, let the user through
      return NextResponse.next();
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
