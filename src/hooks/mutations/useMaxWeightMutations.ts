/**
 * React Query mutation hooks for person max weight operations
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys.ts";
import type { PersonMaxWeight, WeightUnit } from "../../db/types.ts";

export function useSetPersonMaxWeight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      personId: string;
      exerciseId: string;
      maxWeight: number;
      weightUnit: WeightUnit;
      barWeight?: number | null;
    }) => {
      const result = await window.database.setPersonMaxWeight(
        params.personId,
        params.exerciseId,
        params.maxWeight,
        params.weightUnit,
        params.barWeight,
      );
      return result as PersonMaxWeight;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.maxWeights.byPerson(variables.personId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.maxWeights.detail(
          variables.personId,
          variables.exerciseId,
        ),
      });
    },
  });
}

export function useDeletePersonMaxWeight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { personId: string; exerciseId: string }) => {
      const result = await window.database.deletePersonMaxWeight(
        params.personId,
        params.exerciseId,
      );
      return result as boolean;
    },
    onMutate: async (params) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.maxWeights.byPerson(params.personId),
      });

      // Snapshot previous value
      const previousMaxWeights = queryClient.getQueryData(
        queryKeys.maxWeights.byPerson(params.personId),
      );

      // Optimistically update
      queryClient.setQueryData(
        queryKeys.maxWeights.byPerson(params.personId),
        (old: PersonMaxWeight[] = []) =>
          old.filter((mw) => mw.exercise_id !== params.exerciseId),
      );

      return { previousMaxWeights };
    },
    onError: (_err, params, context) => {
      // Rollback on error
      if (context?.previousMaxWeights) {
        queryClient.setQueryData(
          queryKeys.maxWeights.byPerson(params.personId),
          context.previousMaxWeights,
        );
      }
    },
    onSettled: (_, __, params) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.maxWeights.byPerson(params.personId),
      });
    },
  });
}