import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed, TrendingUp, Clock, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Background gradient mesh */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-60 dark:opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
      >
        <div className="absolute -top-24 -left-24 h-[32rem] w-[32rem] rounded-full bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-indigo-300 via-sky-300 to-purple-300 blur-3xl dark:from-indigo-900/40 dark:via-sky-900/40 dark:to-purple-900/40" />
        <div className="absolute -bottom-24 -right-24 h-[28rem] w-[28rem] rounded-full bg-[conic-gradient(at_bottom_right,_var(--tw-gradient-stops))] from-rose-300 via-amber-300 to-emerald-300 blur-3xl dark:from-rose-900/40 dark:via-amber-900/40 dark:to-emerald-900/40" />
      </div>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-900 dark:bg-slate-50 flex items-center justify-center">
              <UtensilsCrossed className="h-10 w-10 text-white dark:text-slate-900" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-slate-50 mb-6 leading-tight">
            MealMind
            <br />
            <span className="text-slate-600 dark:text-slate-400">Plan smarter. Eat better.</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
            Track meals, monitor macros, and stay consistent with your health goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/meals">
              <Button size="lg" className="w-full sm:w-auto shadow-sm hover:shadow-md transition-shadow">
                View Meals
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="w-full sm:w-auto shadow-sm hover:shadow-md transition-shadow">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50 mb-4">
              How it Works
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Three simple steps to get your personalized meal plan
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 transition-transform hover:-translate-y-0.5 hover:shadow-sm">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-slate-900 dark:text-slate-50">1</span>
                </div>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  Sign up to unlock personalized meal plans tailored just for you
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 transition-transform hover:-translate-y-0.5 hover:shadow-sm">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-slate-900 dark:text-slate-50">2</span>
                </div>
                <CardTitle>Set Preferences</CardTitle>
                <CardDescription>
                  Tell us your dietary preferences, allergies, and calorie goals
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 transition-transform hover:-translate-y-0.5 hover:shadow-sm">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-slate-900 dark:text-slate-50">3</span>
                </div>
                <CardTitle>Get Your Plans</CardTitle>
                <CardDescription>
                  Receive AI-generated meal plans customized to your needs
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50 mb-4">
              Why Choose MealMind?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Smart features to make your meal planning effortless
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                title: "Personalized Plans",
                description: "Get meal plans tailored to your dietary preferences and restrictions",
              },
              {
                icon: TrendingUp,
                title: "Track Progress",
                description: "Monitor your daily calories and macros with our intuitive dashboard",
              },
              {
                icon: Clock,
                title: "Time-Saving",
                description: "Save hours of meal planning with instant AI-generated suggestions",
              },
            ].map((feature, index) => (
              <Card key={index} className="border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 transition-transform hover:-translate-y-0.5 hover:shadow-sm">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <feature.icon className="h-5 w-5 text-slate-900 dark:text-slate-50" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
