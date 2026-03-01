/**
 * React Query hooks for people operations
 */
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys.ts";

export function useAllPeople() {
  return useQuery({
    queryKey: queryKeys.people.all,
    queryFn: async () => {
      console.log("[hook:useAllPeople] Fetching all people");
      const result = await window.database.getAllPeople();
      console.log("[hook:useAllPeople] Result:", result.success ? `${result.data.length} people` : "failed");
      return result.success ? result.data : [];
    },
  });
}

export function usePerson(id: string) {
  return useQuery({
    queryKey: queryKeys.people.detail(id),
    queryFn: async () => {
      const result = await window.database.getPerson(id);
      return result.success ? result.data : null;
    },
    enabled: !!id,
  });
}
