/**
 * Centralized query key management for React Query
 */
export const queryKeys = {
  exercises: {
    all: ["exercises"] as const,
    detail: (id: string) => ["exercises", id] as const,
  },
  people: {
    all: ["people"] as const,
    detail: (id: string) => ["people", id] as const,
  },
  workoutSessions: {
    all: ["workoutSessions"] as const,
    active: ["workoutSessions", "active"] as const,
    detail: (id: string) => ["workoutSessions", id] as const,
    withParticipants: (id: string) =>
      ["workoutSessions", id, "participants"] as const,
    activeWithParticipants: [
      "workoutSessions",
      "active",
      "participants",
    ] as const,
  },
  sessionParticipants: {
    all: (sessionId: string) => ["sessionParticipants", sessionId] as const,
    active: (sessionId: string) =>
      ["sessionParticipants", sessionId, "active"] as const,
    detail: (id: string) => ["sessionParticipants", id] as const,
    withSets: (id: string) => ["sessionParticipants", id, "sets"] as const,
  },
  sets: {
    byParticipant: (participantId: string) =>
      ["sets", "participant", participantId] as const,
    detail: (id: string) => ["sets", id] as const,
  },
};