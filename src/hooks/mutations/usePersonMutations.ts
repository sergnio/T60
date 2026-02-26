/**
 * React Query mutation hooks for person operations
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys.ts";
import type {
  Person,
  CreatePersonInput,
  UpdatePersonInput,
} from "../../db/types.ts";

export function useCreatePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreatePersonInput) => {
      const result = await window.database.createPerson(input);
      return result as Person;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.people.all });
    },
  });
}

export function useUpdatePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UpdatePersonInput;
    }) => {
      const result = await window.database.updatePerson(id, input);
      return result as Person | null;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.people.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.people.detail(variables.id),
      });
    },
  });
}

export function useDeletePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await window.database.deletePerson(id);
      return result as boolean;
    },
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.people.all });

      // Snapshot previous value
      const previousPeople = queryClient.getQueryData(queryKeys.people.all);

      // Optimistically update
      queryClient.setQueryData(queryKeys.people.all, (old: Person[] = []) =>
        old.filter((person) => person.id !== id),
      );

      return { previousPeople };
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousPeople) {
        queryClient.setQueryData(queryKeys.people.all, context.previousPeople);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.people.all });
    },
  });
}
