/**
 * React Query hooks for exercise operations
 */
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys.ts";

export function useAllExercises() {
  return useQuery({
    queryKey: queryKeys.exercises.all,
    queryFn: async () => {
      const result = await window.database.getAllExercises();
      return result.success ? result.data : [];
    },
  });
}
