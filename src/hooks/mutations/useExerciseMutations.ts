/**
 * React Query mutation hooks for exercise operations
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys.ts";
import type { CreateExerciseInput, Exercise } from "../../db/types.ts";

export function useCreateExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateExerciseInput) => {
      const result = await window.database.createExercise(input);
      if (!result.success) {
        throw new Error("Failed to create exercise");
      }
      return result.data as Exercise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.exercises.all,
      });
    },
  });
}
