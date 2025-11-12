export type DayName =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type MealSlot = "Breakfast" | "Lunch" | "Dinner";

export interface MealSummary {
  id: string;
  name: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface ScheduledMealEntry {
  mealId: string;
  meal?: MealSummary;
}

export type ScheduleState = Record<DayName, Record<MealSlot, ScheduledMealEntry | null>>;

export const WEEK_DAYS: DayName[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const MEAL_SLOTS: MealSlot[] = ["Breakfast", "Lunch", "Dinner"];

export const SCHEDULE_STORAGE_KEY = "mealmind.schedule";

export const createEmptySchedule = (): ScheduleState =>
  WEEK_DAYS.reduce<ScheduleState>((acc, day) => {
    acc[day] = MEAL_SLOTS.reduce<Record<MealSlot, ScheduledMealEntry | null>>((slotAcc, slot) => {
      slotAcc[slot] = null;
      return slotAcc;
    }, {} as Record<MealSlot, ScheduledMealEntry | null>);
    return acc;
  }, {} as ScheduleState);

export const parseSchedule = (value: string | null): ScheduleState | null => {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<ScheduleState>;
    const isValid = WEEK_DAYS.every((day) => {
      const daySlots = parsed?.[day];
      if (!daySlots) return false;

      return MEAL_SLOTS.every((slot) =>
        Object.prototype.hasOwnProperty.call(daySlots, slot),
      );
    });
    return isValid ? (parsed as ScheduleState) : null;
  } catch {
    return null;
  }
};

const DATE_DAY_MAP: DayName[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const getDayIndex = (day: DayName) => WEEK_DAYS.indexOf(day);

export const getTodayDayName = (): DayName => {
  const today = new Date();
  return DATE_DAY_MAP[today.getDay()];
};

export const getTodayIndex = () => getDayIndex(getTodayDayName());

export const isDayInPast = (day: DayName) => {
  const todayIndex = getTodayIndex();
  if (todayIndex === -1) return false;
  const targetIndex = getDayIndex(day);
  if (targetIndex === -1) return false;
  return targetIndex < todayIndex;
};

export const getEarliestSelectableDay = (preferredDay?: DayName): DayName => {
  if (preferredDay && !isDayInPast(preferredDay)) {
    return preferredDay;
  }

  const upcoming = WEEK_DAYS.filter((day) => !isDayInPast(day));
  return upcoming[0] ?? WEEK_DAYS[WEEK_DAYS.length - 1];
};

