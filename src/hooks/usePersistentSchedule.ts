"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DayName,
  ScheduleState,
  SCHEDULE_STORAGE_KEY,
  createEmptySchedule,
  parseSchedule,
} from "@/lib/schedule";

type ScheduleUpdater =
  | ScheduleState
  | ((previous: ScheduleState) => ScheduleState);

export const usePersistentSchedule = () => {
  const [schedule, setSchedule] = useState<ScheduleState>(() =>
    createEmptySchedule(),
  );
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedValue = localStorage.getItem(SCHEDULE_STORAGE_KEY);
    const parsed = parseSchedule(storedValue);

    if (parsed) {
      setSchedule(parsed);
    }
    setIsLoaded(true);
  }, []);

  const persistSchedule = useCallback((next: ScheduleState) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(next));
  }, []);

  const updateSchedule = useCallback(
    (updater: ScheduleUpdater) => {
      setSchedule((previous) => {
        const next =
          typeof updater === "function"
            ? (updater as (prev: ScheduleState) => ScheduleState)(previous)
            : updater;

        persistSchedule(next);
        return next;
      });
    },
    [persistSchedule],
  );

  const resetSchedule = useCallback(() => {
    const empty = createEmptySchedule();
    setSchedule(empty);
    persistSchedule(empty);
  }, [persistSchedule]);

  const isCellFilled = useCallback(
    (day: DayName, slot: string) => {
      return Boolean(schedule[day]?.[slot as keyof (typeof schedule)[DayName]]);
    },
    [schedule],
  );

  const filledCellsCount = useMemo(() => {
    return Object.values(schedule).reduce((total, daySlots) => {
      const dayCount = Object.values(daySlots).filter(Boolean).length;
      return total + dayCount;
    }, 0);
  }, [schedule]);

  return {
    schedule,
    isLoaded,
    updateSchedule,
    resetSchedule,
    isCellFilled,
    filledCellsCount,
  };
};

