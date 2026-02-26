/**
 * React Query mutation hooks for set operations
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys.ts";
import type { Set, CreateSetInput, UpdateSetInput } from "../../db/types.ts";

export function useCreateSet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateSetInput) => {
      const result = await window.database.createSet(input);
      return result as Set;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.sets.byParticipant(data.participant_id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.sessionParticipants.withSets(data.participant_id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workoutSessions.activeWithParticipants,
      });
    },
  });
}

export function useUpdateSet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateSetInput }) => {
      const result = await window.database.updateSet(id, input);
      return result as Set | null;
    },
    onSuccess: (data, variables) => {
      if (data) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.sets.detail(variables.id),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.sets.byParticipant(data.participant_id),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.sessionParticipants.withSets(data.participant_id),
        });
      }
    },
  });
}

export function useCompleteSet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await window.database.completeSet(id);
      return result as Set | null;
    },
    onSuccess: (data) => {
      if (data) {
        // Invalidate the specific set
        queryClient.invalidateQueries({
          queryKey: queryKeys.sets.detail(data.id),
        });
        // Invalidate sets for this participant
        queryClient.invalidateQueries({
          queryKey: queryKeys.sets.byParticipant(data.participant_id),
        });
        // Invalidate participant with sets (for rotation display)
        queryClient.invalidateQueries({
          queryKey: queryKeys.sessionParticipants.withSets(data.participant_id),
        });
        // Invalidate active session (critical for UI update)
        queryClient.invalidateQueries({
          queryKey: queryKeys.workoutSessions.activeWithParticipants,
        });
      }
    },
  });
}

export function useDeleteSet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await window.database.deleteSet(id);
      return result as boolean;
    },
    onSuccess: () => {
      // Invalidate all set queries - we don't know participant_id without extra lookup
      queryClient.invalidateQueries({
        queryKey: ["sets"],
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workoutSessions.activeWithParticipants,
      });
    },
  });
}