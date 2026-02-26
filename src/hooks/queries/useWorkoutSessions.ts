/**
 * React Query hooks for workout session operations
 */
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys.ts";
import type { WorkoutSession } from "../../db/types.ts";

export function useAllWorkoutSessions() {
  return useQuery({
    queryKey: queryKeys.workoutSessions.all,
    queryFn: async () => {
      const result = await window.database.getAllWorkoutSessions();
      return result as WorkoutSession[];
    },
  });
}

export function useWorkoutSession(id: string) {
  return useQuery({
    queryKey: queryKeys.workoutSessions.detail(id),
    queryFn: async () => {
      const result = await window.database.getWorkoutSession(id);
      return result as WorkoutSession | null;
    },
    enabled: !!id,
  });
}

export function useActiveWorkoutSession() {
  return useQuery({
    queryKey: queryKeys.workoutSessions.active,
    queryFn: async () => {
      const result = await window.database.getActiveWorkoutSession();
      return result as WorkoutSession | null;
    },
  });
}