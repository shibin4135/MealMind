import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/config";

const openAi = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

export const POST = async (req: NextRequest) => {
    try {
        // Check if user is authenticated
        const clerkUser = await currentUser();
        if (!clerkUser) {
            return NextResponse.json(
                { 
                    error: "You must be signed in to generate a meal plan.",
                    code: "UNAUTHORIZED"
                },
                { status: 401 }
            );
        }

        // Check if user has an active subscription
        const profile = await prisma.profile.findUnique({
            where: { userId: clerkUser.id },
            select: {
                subscriptionIsActive: true,
                subscriptionTier: true,
            },
        });

        if (!profile) {
            return NextResponse.json(
                { 
                    error: "Profile not found. Please create a profile first.",
                    code: "PROFILE_NOT_FOUND"
                },
                { status: 404 }
            );
        }

        if (!profile.subscriptionIsActive) {
            return NextResponse.json(
                { 
                    error: "You need an active subscription to generate meal plans. Please subscribe to continue.",
                    code: "SUBSCRIPTION_REQUIRED"
                },
                { status: 403 }
            );
        }

        const { dietType, calories, cuisines, allergies, snacks, days } = await req.json();

        // Validate required fields
        if (!dietType || !calories) {
            return NextResponse.json(
                { 
                    error: "Diet type and daily calories are required.",
                    code: "VALIDATION_ERROR"
                },
                { status: 400 }
            );
        }

        // Construct the prompt to send to OpenAI
        const prompt = `
      You are a professional nutritionist. Create a 7-day meal plan for an individual following a ${dietType} diet aiming for ${calories} calories per day.
      
      Allergies or restrictions: ${allergies || "none"}.
      Preferred cuisine: ${cuisines || "no preference"}.
      Snacks included: ${snacks ? "yes" : "no"}.
      
      For each day, provide:
        - Breakfast
        - Lunch
        - Dinner
        ${snacks ? "- Snacks" : ""}
      
      Use simple ingredients and provide brief instructions. Include approximate calorie counts for each meal.
      
      Structure the response as a JSON object where each day is a key, and each meal (breakfast, lunch, dinner, snacks) is a sub-key. Example:
      
      {
        "Monday": {
          "Breakfast": "Oatmeal with fruits - 350 calories",
          "Lunch": "Grilled chicken salad - 500 calories",
          "Dinner": "Steamed vegetables with quinoa - 600 calories",
          "Snacks": "Greek yogurt - 150 calories"
        },
        "Tuesday": {
          "Breakfast": "Smoothie bowl - 300 calories",
          "Lunch": "Turkey sandwich - 450 calories",
          "Dinner": "Baked salmon with asparagus - 700 calories",
          "Snacks": "Almonds - 200 calories"
        }
      }
      
      Return just the JSON with no extra commentaries and no backticks.
    `;

        let response;
        try {
            response = await openAi.chat.completions.create({
                model: "meta-llama/llama-3.2-3b-instruct:free",
                max_tokens: 2000,
                temperature: 0.7,
                messages: [
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
            });
        } catch (openAiError: any) {
            console.error("OpenAI API Error:", openAiError);
            
            if (openAiError.status === 429) {
                return NextResponse.json(
                    { 
                        error: "Service is currently busy. Please try again in a few moments.",
                        code: "RATE_LIMIT_EXCEEDED"
                    },
                    { status: 429 }
                );
            }

            return NextResponse.json(
                { 
                    error: "Failed to generate meal plan. Please try again later.",
                    code: "AI_SERVICE_ERROR"
                },
                { status: 500 }
            );
        }

        const aicontent = response.choices[0]?.message?.content;

        if (!aicontent) {
            return NextResponse.json(
                { 
                    error: "No content received from AI service. Please try again.",
                    code: "NO_CONTENT"
                },
                { status: 500 }
            );
        }

        let cleanedContent = aicontent.replace(/`/g, '').trim();
        // Remove markdown code blocks if present
        cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/```\s*$/, '');

        let parsedMealPlan: { [days: string]: DailyMealPlan } = {};

        try {
            parsedMealPlan = JSON.parse(cleanedContent);
            console.log("Parsed Meal Plan:", parsedMealPlan);
        } catch (error) {
            console.error("Error parsing JSON:", error);
            return NextResponse.json(
                { 
                    error: "Failed to parse meal plan response. Please try again.",
                    code: "PARSE_ERROR"
                },
                { status: 500 }
            );
        }

        return NextResponse.json({ mealPlan: parsedMealPlan });

    } catch (error: any) {
        console.error("Error during the request:", error);
        return NextResponse.json(
            { 
                error: error.message || "An unexpected error occurred. Please try again.",
                code: "INTERNAL_ERROR"
            },
            { status: 500 }
        );
    }
};


interface DailyMealPlan {
    Breakfast: string;
    Lunch: string;
    Dinner: string;
    Snacks?: string;
}
