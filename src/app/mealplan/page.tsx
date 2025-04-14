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
        "Content-Type": "multipart/form-data",
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
    <div className="flex justify-center items-center min-h-screen bg-gray-100 mt-20">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-4xl flex gap-4 aspect-w-16 aspect-h-9">
        {/* Left Form Section */}
        <div className="w-full sm:w-1/3 bg-emerald-500 rounded-lg text-white p-4 space-y-3">
          <h1 className="text-2xl font-bold text-center">AI Meal Plan Generator</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col">
              <label htmlFor="dietType">Diet Type</label>
              <input
                type="text"
                name="dietType"
                id="dietType"
                placeholder="Enter the diet type"
                className="border border-gray-300 rounded p-2 bg-white w-full text-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="calories">Calories</label>
              <input
                type="text"
                name="calories"
                id="calories"
                placeholder="Enter the calories"
                className="border border-gray-300 rounded p-2 bg-white w-full text-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="cuisines">Cuisines</label>
              <input
                type="text"
                name="cuisines"
                id="cuisines"
                placeholder="Enter the cuisines"
                className="border border-gray-300 rounded p-2 bg-white w-full text-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="allergies">Allergies</label>
              <input
                type="text"
                name="allergies"
                id="allergies"
                placeholder="Enter the allergies"
                className="border border-gray-300 rounded p-2 bg-white w-full text-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="snacks">Snacks</label>
              <input type="checkbox" name="snacks" id="snacks" />
            </div>
            <button type="submit" className="bg-green-700 w-full py-2 rounded-full text-white mt-4" disabled={isPending}>
              {isPending ? "Generating...." : "Submit"}
            </button>
          </form>
        </div>

        {/* Right Meal Plan Display */}
        <div className="w-full sm:w-2/3 overflow-auto">
          {data?.mealPlan && (
            <div>
              {Object.keys(data.mealPlan).map((key) => {
                const dat = data.mealPlan[key as dayType[number]];
                return (
                  <div key={key} className="mb-4 p-4 border-b">
                    <h3 className="text-xl font-semibold">{key}</h3>
                    <p><strong>Breakfast:</strong> {dat.Breakfast}</p>
                    <p><strong>Lunch:</strong> {dat.Lunch}</p>
                    <p><strong>Dinner:</strong> {dat.Dinner}</p>
                    {dat.Snacks && <p><strong>Snacks:</strong> {dat.Snacks}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealPlan;
