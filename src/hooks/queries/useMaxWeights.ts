/**
 * React Query hooks for person max weight operations
 */
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys.ts";

export function usePersonMaxWeights(personId: string) {
  return useQuery({
    queryKey: queryKeys.maxWeights.byPerson(personId),
    queryFn: async () => {
      console.log(
        "[hook:usePersonMaxWeights] Fetching max weights for person:",
        personId,
      );
      const result = await window.database.getPersonMaxWeights(personId);
      console.log(
        "[hook:usePersonMaxWeights] Result:",
        result.success ? `${result.data.length} max weights` : "failed",
      );
      return result.success ? result.data : [];
    },
    enabled: !!personId,
  });
}

export function usePersonMaxWeight(personId: string, exerciseId: string) {
  return useQuery({
    queryKey: queryKeys.maxWeights.detail(personId, exerciseId),
    queryFn: async () => {
      const result = await window.database.getPersonMaxWeight(
        personId,
        exerciseId,
      );
      return result.success ? result.data : null;
    },
    enabled: !!personId && !!exerciseId,
  });
}