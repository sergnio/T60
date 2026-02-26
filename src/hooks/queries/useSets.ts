/**
 * React Query hooks for set operations
 */
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys.ts";
import type { Set } from "../../db/types.ts";

export function useSetsByParticipant(participantId: string) {
  return useQuery({
    queryKey: queryKeys.sets.byParticipant(participantId),
    queryFn: async () => {
      const result = await window.database.getSetsByParticipant(participantId);
      return result as Set[];
    },
    enabled: !!participantId,
  });
}

export function useSet(id: string) {
  return useQuery({
    queryKey: queryKeys.sets.detail(id),
    queryFn: async () => {
      const result = await window.database.getSet(id);
      return result as Set | null;
    },
    enabled: !!id,
  });
}