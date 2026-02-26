/**
 * React Query mutation hooks for workout session operations
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys.ts";
import type {
  WorkoutSession,
  CreateWorkoutSessionInput,
  UpdateWorkoutSessionInput,
} from "../../db/types.ts";

export function useCreateWorkoutSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateWorkoutSessionInput) => {
      const result = await window.database.createWorkoutSession(input);
      return result as WorkoutSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workoutSessions.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workoutSessions.active,
      });
    },
  });
}

export function useUpdateWorkoutSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UpdateWorkoutSessionInput;
    }) => {
      const result = await window.database.updateWorkoutSession(id, input);
      return result as WorkoutSession | null;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workoutSessions.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workoutSessions.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workoutSessions.active,
      });
    },
  });
}

export function useEndWorkoutSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await window.database.endWorkoutSession(id);
      return result as WorkoutSession | null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workoutSessions.active,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workoutSessions.activeWithParticipants,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workoutSessions.all,
      });
    },
  });
}

export function useDeleteWorkoutSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await window.database.deleteWorkoutSession(id);
      return result as boolean;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.workoutSessions.all,
      });

      const previousSessions = queryClient.getQueryData(
        queryKeys.workoutSessions.all,
      );

      queryClient.setQueryData(
        queryKeys.workoutSessions.all,
        (old: WorkoutSession[] = []) => old.filter((session) => session.id !== id),
      );

      return { previousSessions };
    },
    onError: (_err, _id, context) => {
      if (context?.previousSessions) {
        queryClient.setQueryData(
          queryKeys.workoutSessions.all,
          context.previousSessions,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workoutSessions.all,
      });
    },
  });
}
