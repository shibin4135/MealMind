"use client";

import { MealPlans } from "@/lib/Plans";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check } from "lucide-react";

type SubscribeResponse = {
  url: string;
  message?: string;
};

export const subscribe = async (planType: string, userId: string, email: string): Promise<SubscribeResponse> => {
  try {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ planType, userId, email }),
    });
    const data = await response.json();
    return data as SubscribeResponse;
  } catch (error: any) {
    toast.error(error.message);
    throw new Error(error.message);
  }
};

const Subscribe = () => {
  const { user } = useUser();
  const userId = user?.id;
  const email = user?.emailAddresses[0]?.emailAddress;

  const { isPending, mutate } = useMutation<SubscribeResponse, Error, { planType: string; userId: string; email: string }>({
    mutationFn: ({ planType, userId, email }) => subscribe(planType, userId, email),
    onSuccess: (data) => {
      window.location.href = data.url;
    },
  });

  const handleSubscribe = (planType: string) => {
    if (userId && email) {
      mutate({ planType, userId, email });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <header className="space-y-4 text-center">
          <div className="inline-flex items-center rounded-full bg-muted/40 px-4 py-1 text-sm font-medium text-muted-foreground">
            Pricing
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-semibold">
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                Pricing
              </span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that works best for you. All plans include unlimited AI meal plans.
            </p>
          </div>
        </header>

        <Separator className="bg-border" />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {MealPlans.map((plan) => (
            <Card
              key={plan.amount}
              className={`relative border border-border bg-muted/10 ${plan.isPopular ? "border-2 border-primary shadow-lg" : ""}`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl text-foreground">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">${plan.amount}</span>
                  <span className="text-muted-foreground ml-2">/{plan.interval}</span>
                </div>
                <CardDescription className="mt-4 text-muted-foreground">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full rounded-xl"
                  variant={plan.isPopular ? "default" : "outline"}
                  onClick={() => handleSubscribe(plan.interval)}
                  disabled={isPending}
                >
                  {isPending ? "Processing..." : `Subscribe to ${plan.name}`}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Subscribe;
