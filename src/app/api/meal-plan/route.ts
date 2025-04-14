import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openAi = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

export const POST = async (req: NextRequest) => {
    try {
        const { dietType, calories, cuisines, allergies, snacks, days } = await req.json();

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

        const response = await openAi.chat.completions.create({
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

        const aicontent = response.choices[0]?.message?.content;

        if (!aicontent) {
            return NextResponse.json({ error: "No content received from OpenAI." }, { status: 500 });
        }


        let cleanedContent = aicontent.replace(/`/g, '').trim();

        let parsedMealPlan: { [days: string]: DailyMealPlan } = {};

        try {
            parsedMealPlan = JSON.parse(cleanedContent);
            console.log("Parsed Meal Plan:", parsedMealPlan);
        } catch (error) {
            console.error("Error parsing JSON:", error);
            return NextResponse.json({ error: "Failed to parse meal plan." }, { status: 500 });
        }


        return NextResponse.json({ mealPlan: parsedMealPlan });


    } catch (error) {
        console.error("Error during the request:", error);
        return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
};


interface DailyMealPlan {
    Breakfast: string;
    Lunch: string;
    Dinner: string;
    Snacks?: string;
}
