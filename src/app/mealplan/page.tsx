"use client";

import { useMutation } from "@tanstack/react-query";

interface MealPlanProps {
  dietType: string;
  calories: string;
  cuisines: string;
  allergies: string;
  snacks: string;
  days?: number;
}

type dayType = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface DailyMealPlan {
  Breakfast: string;
  Lunch: string;
  Dinner: string;
  Snacks?: string;
}

interface MealTypeResponse {
  error?: string;
  mealPlan: { [days in dayType[number]]: DailyMealPlan }
}

const MealPlan = () => {

  const generateMealPlan = async (payload: MealPlanProps): Promise<MealTypeResponse> => {
    const response = await fetch("/api/meal-plan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    return response.json();
  };

  const { mutate, data, isPending } = useMutation<MealTypeResponse, Error, MealPlanProps>({
    mutationFn: generateMealPlan,
    onSuccess: (data) => {
      console.log(data)
    }
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload: MealPlanProps = {
      dietType: formData.get("dietType") as string,
      calories: formData.get("calories") as string,
      cuisines: formData.get("cuisines") as string,
      allergies: formData.get("allergies") as string,
      snacks: formData.get("snacks")?.toString() || "",
      days: 7,
    };
    mutate(payload);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form card */}
          <div className="lg:col-span-1 bg-white/60 backdrop-blur-md border border-gray-100 rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">AI Meal Plan Generator</h2>
            <p className="text-sm text-gray-500 mb-6">Tell us a bit about your preferences and we'll generate a weekly meal plan.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="dietType" className="block text-sm font-medium text-gray-700">Diet Type</label>
                <input name="dietType" id="dietType" placeholder="e.g. vegetarian" className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label htmlFor="calories" className="block text-sm font-medium text-gray-700">Calories (daily)</label>
                <input name="calories" id="calories" placeholder="e.g. 2000" className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label htmlFor="cuisines" className="block text-sm font-medium text-gray-700">Preferred Cuisines</label>
                <input name="cuisines" id="cuisines" placeholder="e.g. Italian, Indian" className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label htmlFor="allergies" className="block text-sm font-medium text-gray-700">Allergies / Exclusions</label>
                <input name="allergies" id="allergies" placeholder="e.g. peanuts, gluten" className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" name="snacks" id="snacks" className="h-4 w-4 text-blue-600 rounded" />
                <label htmlFor="snacks" className="text-sm text-gray-700">Include snacks</label>
              </div>

              <button type="submit" disabled={isPending} className="w-full inline-flex items-center justify-center gap-3 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:scale-[1.02] transition">
                {isPending ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                    Generating...
                  </>
                ) : (
                  'Generate Plan'
                )}
              </button>
            </form>
          </div>

          {/* Results area spans 2 cols on large screens */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-[300px]">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Meal Plan</h3>
              {!data?.mealPlan && (
                <p className="text-gray-500">No plan generated yet — fill the form and click Generate Plan.</p>
              )}

              {data?.mealPlan && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.keys(data.mealPlan).map((key) => {
                    const dat = data.mealPlan[key as dayType[number]];
                    return (
                      <div key={key} className="p-4 rounded-lg border border-gray-100 shadow-sm bg-white">
                        <h4 className="font-semibold text-lg mb-2">{key}</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li><span className="font-medium">Breakfast:</span> {dat.Breakfast}</li>
                          <li><span className="font-medium">Lunch:</span> {dat.Lunch}</li>
                          <li><span className="font-medium">Dinner:</span> {dat.Dinner}</li>
                          {dat.Snacks && <li><span className="font-medium">Snacks:</span> {dat.Snacks}</li>}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealPlan;
