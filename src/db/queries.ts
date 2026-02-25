import { getDatabase } from "./init.js";
import type {
  Person,
  WorkoutSession,
  SessionParticipant,
  Set,
  CreatePersonInput,
  CreateWorkoutSessionInput,
  CreateSessionParticipantInput,
  CreateSetInput,
  UpdatePersonInput,
  UpdateWorkoutSessionInput,
  UpdateSessionParticipantInput,
  UpdateSetInput,
  ParticipantWithSets,
  SessionWithParticipants,
} from "./types.js";

// ============================================================================
// PEOPLE
// ============================================================================

export function createPerson(input: CreatePersonInput): Person {
  const db = getDatabase();
  const id = crypto.randomUUID();
  const now = Date.now();

  db.prepare(
    `
    INSERT INTO people (id, name, created_at, updated_at)
    VALUES (?, ?, ?, ?)
  `,
  ).run(id, input.name, now, now);

  return getPerson(id)!;
}

export function getPerson(id: string): Person | null {
  const db = getDatabase();
  const row = db
    .prepare(
      `
    SELECT * FROM people WHERE id = ?
  `,
    )
    .get(id) as Person | undefined;

  return row || null;
}

export function getAllPeople(): Person[] {
  const db = getDatabase();
  return db
    .prepare(
      `
    SELECT * FROM people ORDER BY name
  `,
    )
    .all() as Person[];
}

export function updatePerson(
  id: string,
  input: UpdatePersonInput,
): Person | null {
  const db = getDatabase();
  const now = Date.now();

  if (input.name !== undefined) {
    db.prepare(
      `
      UPDATE people SET name = ?, updated_at = ? WHERE id = ?
    `,
    ).run(input.name, now, id);
  }

  return getPerson(id);
}

export function deletePerson(id: string): boolean {
  const db = getDatabase();
  const result = db
    .prepare(
      `
    DELETE FROM people WHERE id = ?
  `,
    )
    .run(id);

  return result.changes > 0;
}

// ============================================================================
// WORKOUT SESSIONS
// ============================================================================

export function createWorkoutSession(
  input: CreateWorkoutSessionInput,
): WorkoutSession {
  const db = getDatabase();
  const id = crypto.randomUUID();
  const now = Date.now();

  db.prepare(
    `
    INSERT INTO workout_sessions (id, name, started_at, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `,
  ).run(id, input.name || null, now, 1, now, now);

  return getWorkoutSession(id)!;
}

export function getWorkoutSession(id: string): WorkoutSession | null {
  const db = getDatabase();
  const row = db
    .prepare(
      `
    SELECT * FROM workout_sessions WHERE id = ?
  `,
    )
    .get(id) as WorkoutSession | undefined;

  return row || null;
}

export function getActiveWorkoutSession(): WorkoutSession | null {
  const db = getDatabase();
  const row = db
    .prepare(
      `
    SELECT * FROM workout_sessions
    WHERE is_active = 1
    ORDER BY started_at DESC
    LIMIT 1
  `,
    )
    .get() as WorkoutSession | undefined;

  return row || null;
}

export function getAllWorkoutSessions(): WorkoutSession[] {
  const db = getDatabase();
  return db
    .prepare(
      `
    SELECT * FROM workout_sessions ORDER BY started_at DESC
  `,
    )
    .all() as WorkoutSession[];
}

export function updateWorkoutSession(
  id: string,
  input: UpdateWorkoutSessionInput,
): WorkoutSession | null {
  const db = getDatabase();
  const now = Date.now();

  const updates: string[] = [];
  const values: any[] = [];

  if (input.name !== undefined) {
    updates.push("name = ?");
    values.push(input.name);
  }
  if (input.ended_at !== undefined) {
    updates.push("ended_at = ?");
    values.push(input.ended_at);
  }
  if (input.is_active !== undefined) {
    updates.push("is_active = ?");
    values.push(input.is_active ? 1 : 0);
  }

  if (updates.length > 0) {
    updates.push("updated_at = ?");
    values.push(now);
    values.push(id);

    db.prepare(
      `
      UPDATE workout_sessions SET ${updates.join(", ")} WHERE id = ?
    `,
    ).run(...values);
  }

  return getWorkoutSession(id);
}

export function endWorkoutSession(id: string): WorkoutSession | null {
  return updateWorkoutSession(id, {
    ended_at: Date.now(),
    is_active: false,
  });
}

export function deleteWorkoutSession(id: string): boolean {
  const db = getDatabase();
  const result = db
    .prepare(
      `
    DELETE FROM workout_sessions WHERE id = ?
  `,
    )
    .run(id);

  return result.changes > 0;
}

// ============================================================================
// SESSION PARTICIPANTS
// ============================================================================

export function createSessionParticipant(
  input: CreateSessionParticipantInput,
): SessionParticipant {
  const db = getDatabase();
  const id = crypto.randomUUID();
  const now = Date.now();

  db.prepare(
    `
    INSERT INTO session_participants
    (id, session_id, person_id, exercise_name, weight_unit, current_set_index, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(
    id,
    input.session_id,
    input.person_id,
    input.exercise_name,
    input.weight_unit,
    0,
    0,
    now,
    now,
  );

  return getSessionParticipant(id)!;
}

export function getSessionParticipant(id: string): SessionParticipant | null {
  const db = getDatabase();
  const row = db
    .prepare(
      `
    SELECT * FROM session_participants WHERE id = ?
  `,
    )
    .get(id) as SessionParticipant | undefined;

  return row || null;
}

export function getSessionParticipants(
  sessionId: string,
): SessionParticipant[] {
  const db = getDatabase();
  return db
    .prepare(
      `
    SELECT * FROM session_participants WHERE session_id = ?
  `,
    )
    .all(sessionId) as SessionParticipant[];
}

export function getActiveSessionParticipants(
  sessionId: string,
): SessionParticipant[] {
  const db = getDatabase();
  return db
    .prepare(
      `
    SELECT * FROM session_participants
    WHERE session_id = ? AND is_active = 1
  `,
    )
    .all(sessionId) as SessionParticipant[];
}

export function updateSessionParticipant(
  id: string,
  input: UpdateSessionParticipantInput,
): SessionParticipant | null {
  const db = getDatabase();
  const now = Date.now();

  const updates: string[] = [];
  const values: any[] = [];

  if (input.current_set_index !== undefined) {
    updates.push("current_set_index = ?");
    values.push(input.current_set_index);
  }
  if (input.is_active !== undefined) {
    updates.push("is_active = ?");
    values.push(input.is_active ? 1 : 0);
  }

  if (updates.length > 0) {
    updates.push("updated_at = ?");
    values.push(now);
    values.push(id);

    db.prepare(
      `
      UPDATE session_participants SET ${updates.join(", ")} WHERE id = ?
    `,
    ).run(...values);
  }

  return getSessionParticipant(id);
}

export function deleteSessionParticipant(id: string): boolean {
  const db = getDatabase();
  const result = db
    .prepare(
      `
    DELETE FROM session_participants WHERE id = ?
  `,
    )
    .run(id);

  return result.changes > 0;
}

// ============================================================================
// SETS
// ============================================================================

export function createSet(input: CreateSetInput): Set {
  const db = getDatabase();
  const id = crypto.randomUUID();
  const now = Date.now();

  db.prepare(
    `
    INSERT INTO sets (id, participant_id, set_index, weight, completed, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(id, input.participant_id, input.set_index, input.weight, 0, now, now);

  return getSet(id)!;
}

export function getSet(id: string): Set | null {
  const db = getDatabase();
  const row = db
    .prepare(
      `
    SELECT * FROM sets WHERE id = ?
  `,
    )
    .get(id) as Set | undefined;

  return row || null;
}

export function getSetsByParticipant(participantId: string): Set[] {
  const db = getDatabase();
  return db
    .prepare(
      `
    SELECT * FROM sets WHERE participant_id = ? ORDER BY set_index
  `,
    )
    .all(participantId) as Set[];
}

export function updateSet(id: string, input: UpdateSetInput): Set | null {
  const db = getDatabase();
  const now = Date.now();

  const updates: string[] = [];
  const values: any[] = [];

  if (input.completed !== undefined) {
    updates.push("completed = ?");
    values.push(input.completed ? 1 : 0);
  }
  if (input.completed_at !== undefined) {
    updates.push("completed_at = ?");
    values.push(input.completed_at);
  }

  if (updates.length > 0) {
    updates.push("updated_at = ?");
    values.push(now);
    values.push(id);

    db.prepare(
      `
      UPDATE sets SET ${updates.join(", ")} WHERE id = ?
    `,
    ).run(...values);
  }

  return getSet(id);
}

export function completeSet(id: string): Set | null {
  return updateSet(id, {
    completed: true,
    completed_at: Date.now(),
  });
}

export function deleteSet(id: string): boolean {
  const db = getDatabase();
  const result = db
    .prepare(
      `
    DELETE FROM sets WHERE id = ?
  `,
    )
    .run(id);

  return result.changes > 0;
}

// ============================================================================
// JOINED QUERIES
// ============================================================================

export function getParticipantWithSets(
  participantId: string,
): ParticipantWithSets | null {
  const participant = getSessionParticipant(participantId);
  if (!participant) return null;

  const person = getPerson(participant.person_id);
  if (!person) return null;

  const sets = getSetsByParticipant(participantId);

  return {
    ...participant,
    person,
    sets,
  };
}

export function getSessionWithParticipants(
  sessionId: string,
): SessionWithParticipants | null {
  const session = getWorkoutSession(sessionId);
  if (!session) return null;

  const participants = getSessionParticipants(sessionId);
  const participantsWithData = participants.map((p) => {
    const person = getPerson(p.person_id)!;
    const sets = getSetsByParticipant(p.id);
    return {
      ...p,
      person,
      sets,
    };
  });

  return {
    ...session,
    participants: participantsWithData,
  };
}

export function getActiveSessionWithParticipants(): SessionWithParticipants | null {
  const session = getActiveWorkoutSession();
  if (!session) return null;

  return getSessionWithParticipants(session.id);
}
