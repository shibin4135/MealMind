import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import toast from "react-hot-toast";

const isPublicRoutes = createRouteMatcher([
  "/",
  "/sign-up(.*)",
  "/subscribe(.*)",
  "/api/webhook/register",
  "/api/check-subscription"
]);

const mealPlanRoute = createRouteMatcher(["/mealplan"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const { origin } = req.nextUrl


  if (!isPublicRoutes(req) && !userId) {
    return NextResponse.redirect(new URL("/sign-up", req.url));
  }

  if (mealPlanRoute(req) && userId) {
    try {
      const data = await fetch(`http://localhost:3000/api/check-subscription?userId=${userId}`)

      const response = await data.json();
      if (!response.isSubscribed) {
        toast("Please Subscribe To Access These route")
        return NextResponse.redirect(new URL("/subscribe", origin))
      }

    } catch (error) {
      console.log("Error getting the details", error)
      return NextResponse.redirect(new URL("/subscribe", origin))
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
