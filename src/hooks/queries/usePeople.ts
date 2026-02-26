/**
 * React Query hooks for people operations
 */
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys.ts";
import type { Person } from "../../db/types.ts";

export function useAllPeople() {
  return useQuery({
    queryKey: queryKeys.people.all,
    queryFn: async () => {
      const result = await window.database.getAllPeople();
      return result as Person[];
    },
  });
}

export function usePerson(id: string) {
  return useQuery({
    queryKey: queryKeys.people.detail(id),
    queryFn: async () => {
      const result = await window.database.getPerson(id);
      return result as Person | null;
    },
    enabled: !!id,
  });
}