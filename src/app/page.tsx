"use client";

import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed, TrendingUp, Clock, Sparkles, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Animated Background Gradient Mesh */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-70 dark:opacity-40"
      >
        <div className="absolute -top-40 -left-40 h-[40rem] w-[40rem] rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 blur-3xl animate-gradient dark:from-emerald-600/30 dark:via-teal-600/30 dark:to-cyan-600/30" />
        <div
          className="absolute top-1/2 -right-40 h-[35rem] w-[35rem] rounded-full bg-gradient-to-br from-violet-400 via-purple-400 to-pink-400 blur-3xl animate-gradient dark:from-violet-600/30 dark:via-purple-600/30 dark:to-pink-600/30"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute -bottom-40 left-1/3 h-[38rem] w-[38rem] rounded-full bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 blur-3xl animate-gradient dark:from-amber-600/30 dark:via-orange-600/30 dark:to-rose-600/30"
          style={{ animationDelay: "4s" }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          {/* Logo Badge */}
          <div className="mb-8 flex justify-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-2xl transform group-hover:scale-105 transition-transform duration-300">
                <UtensilsCrossed className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent animate-gradient">
              MealMind
            </span>
            <br />
            <span className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 dark:text-slate-100 mt-4 block">
              Plan smarter. Eat better.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
            Transform your nutrition journey with AI-powered meal planning. Track meals, monitor macros, and achieve your health goals effortlessly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/meals">
              <Button
                size="lg"
                className="group relative px-8 py-6 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-xl overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Explore Meals
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg font-semibold border-2 border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-xl"
              >
                View Dashboard
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[
              { value: "10K+", label: "Meals" },
              { value: "5K+", label: "Users" },
              { value: "99%", label: "Satisfaction" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-1 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                How it Works
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium">
              Three simple steps to transform your nutrition journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Create Account",
                description: "Sign up in seconds to unlock personalized meal plans tailored just for you",
                gradient: "from-emerald-500 to-teal-500",
              },
              {
                step: "2",
                title: "Set Preferences",
                description: "Tell us your dietary preferences, allergies, and calorie goals",
                gradient: "from-teal-500 to-cyan-500",
              },
              {
                step: "3",
                title: "Get Your Plans",
                description: "Receive AI-generated meal plans customized to your needs instantly",
                gradient: "from-cyan-500 to-blue-500",
              },
            ].map((item, index) => (
              <Card
                key={index}
                className="group relative border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm overflow-hidden transform hover:-translate-y-2"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                <CardHeader className="relative z-10">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <span className="text-3xl font-bold text-white">{item.step}</span>
                  </div>
                  <CardTitle className="text-2xl font-bold mb-3 text-slate-900 dark:text-slate-50">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                Why Choose MealMind?
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium">
              Smart features designed to make your meal planning effortless
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: "Personalized Plans",
                description: "Get meal plans tailored to your dietary preferences and restrictions with AI precision",
                gradient: "from-violet-500 to-purple-500",
              },
              {
                icon: TrendingUp,
                title: "Track Progress",
                description: "Monitor your daily calories and macros with our intuitive, real-time dashboard",
                gradient: "from-pink-500 to-rose-500",
              },
              {
                icon: Clock,
                title: "Time-Saving",
                description: "Save hours of meal planning with instant AI-generated suggestions and recommendations",
                gradient: "from-amber-500 to-orange-500",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="group relative border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm overflow-hidden transform hover:-translate-y-2"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                <CardHeader className="relative z-10">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold mb-3 text-slate-900 dark:text-slate-50">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section (fixed syntax) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-12 md:p-16 relative overflow-hidden">
            <div
              className={`absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fill-opacity=&quot;0.1&quot;%3E%3Cpath d=&quot;M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20`}
            />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                Ready to Transform Your Nutrition?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto font-medium">
                Join thousands of users who are achieving their health goals with MealMind
              </p>
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="px-8 py-6 text-lg font-semibold bg-white text-emerald-600 hover:bg-slate-50 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 rounded-xl"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
