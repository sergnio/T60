import { getDatabase } from "./init.js";
import type {
  Person,
  Exercise,
  CreateExerciseInput,
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
  PersonMaxWeight,
  RotationConfig,
  WeightUnit,
} from "./types.js";

// ============================================================================
// EXERCISES
// ============================================================================

export function createExercise(input: CreateExerciseInput): Exercise {
  const db = getDatabase();

  const result = db
    .prepare(
      `
    INSERT INTO exercises (name)
    VALUES (?)
    RETURNING id
  `,
    )
    .get(input.name) as { id: string };

  return getExercise(result.id)!;
}

export function getExercise(id: string): Exercise | null {
  const db = getDatabase();
  const row = db
    .prepare(
      `
    SELECT * FROM exercises WHERE id = ?
  `,
    )
    .get(id) as Exercise | undefined;

  return row || null;
}

export function getAllExercises(): Exercise[] {
  const db = getDatabase();
  return db
    .prepare(
      `
    SELECT * FROM exercises ORDER BY name
  `,
    )
    .all() as Exercise[];
}

// ============================================================================
// PEOPLE
// ============================================================================

export function createPerson(input: CreatePersonInput): Person {
  const db = getDatabase();

  const result = db
    .prepare(
      `
    INSERT INTO people (name)
    VALUES (?)
    RETURNING id
  `,
    )
    .get(input.name) as { id: string };

  return getPerson(result.id)!;
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
): SessionWithParticipants {
  console.log(
    "[db:createWorkoutSession] Creating session with",
    input.stations?.length,
    "stations",
  );
  const db = getDatabase();

  const run = db.transaction(() => {
    const now = Date.now();
    const sessionId = crypto.randomUUID();

    // Create session
    db.prepare(
      `
      INSERT INTO workout_sessions (id, name, started_at, is_active, created_at, updated_at)
      VALUES (?, ?, ?, TRUE, ?, ?)
    `,
    ).run(sessionId, input.name || null, now, now, now);

    // Detect rotation workout: if any station has isStartingExercise defined
    const isRotationWorkout = input.stations.some(s => s.isStartingExercise !== undefined);

    // Collect exercise IDs for the is_active correction pass at the end
    const allExerciseIds = new Set<string>();

    if (isRotationWorkout) {
      console.log("[db:createWorkoutSession] Creating rotation workout");

      // Build rotation order from unique exercises
      const exerciseIds = [...new Set(input.stations.map(s => s.exerciseId))];
      const exerciseIndexMap = new Map(exerciseIds.map((id, idx) => [id, idx]));

      // Track how many participants per exercise to set is_active correctly
      const exerciseParticipantCount = new Map<string, number>();

      for (const station of input.stations) {
        const exercise = getExercise(station.exerciseId);
        if (!exercise) {
          throw new Error(`Exercise not found: ${station.exerciseId}`);
        }

        for (const personId of station.participantIds) {
          const count = exerciseParticipantCount.get(station.exerciseId) ?? 0;
          const isFirstAtExercise = count === 0 && station.isStartingExercise;
          exerciseParticipantCount.set(station.exerciseId, count + 1);

          const rotationOrder = exerciseIndexMap.get(station.exerciseId) ?? 0;
          const status = station.isStartingExercise ? "active" : "pending";

          const participant = createSessionParticipant({
            session_id: sessionId,
            person_id: personId,
            exercise_name: exercise.name,
            exercise_id: exercise.id,
            weight_unit: input.weightUnit,
            is_active: isFirstAtExercise,
            status: status,
            rotation_order: rotationOrder,
            started_at: station.isStartingExercise ? now : undefined,
          });

          allExerciseIds.add(station.exerciseId);

          // Sets must be provided by the service layer
          if (!station.sets) {
            throw new Error("Sets configuration is required for each station");
          }

          // Create sets for ALL participant records (both active and pending)
          // This ensures all 15 sets per person are created upfront for rotation workouts
          for (let setIndex = 0; setIndex < station.sets.length; setIndex++) {
            createSet({
              participant_id: participant.id,
              set_index: setIndex,
              weight: station.sets[setIndex].weight,
              reps: station.sets[setIndex].reps,
            });
          }
        }
      }
    } else {
      // Non-rotation workout: original logic
      const exerciseParticipantCount = new Map<string, number>();

      for (const station of input.stations) {
        const exercise = getExercise(station.exerciseId);
        if (!exercise) {
          throw new Error(`Exercise not found: ${station.exerciseId}`);
        }

        for (const personId of station.participantIds) {
          const count = exerciseParticipantCount.get(station.exerciseId) ?? 0;
          const isFirstAtExercise = count === 0;
          exerciseParticipantCount.set(station.exerciseId, count + 1);

          const participant = createSessionParticipant({
            session_id: sessionId,
            person_id: personId,
            exercise_name: exercise.name,
            exercise_id: exercise.id,
            weight_unit: input.weightUnit,
            is_active: isFirstAtExercise,
            status: "active",
          });

          allExerciseIds.add(station.exerciseId);

          // Sets must be provided by the service layer
          if (!station.sets) {
            throw new Error("Sets configuration is required for each station");
          }

          for (let setIndex = 0; setIndex < station.sets.length; setIndex++) {
            createSet({
              participant_id: participant.id,
              set_index: setIndex,
              weight: station.sets[setIndex].weight,
              reps: station.sets[setIndex].reps,
            });
          }
        }
      }
    }

    // Correction pass: ensure is_active aligns with display sort order (TONY-80)
    for (const exerciseId of allExerciseIds) {
      correctIsActiveForExercise(sessionId, exerciseId);
    }

    return getSessionWithParticipants(sessionId)!;
  });

  return run();
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
    (id, session_id, person_id, exercise_name, exercise_id, weight_unit, current_set_index, is_active, rotation_order, status, started_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(
    id,
    input.session_id,
    input.person_id,
    input.exercise_name,
    input.exercise_id || null,
    input.weight_unit,
    0,
    (input.is_active ?? false) ? 1 : 0,
    input.rotation_order ?? 0,
    input.status ?? "pending",
    input.started_at ?? null,
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

/**
 * Ensures that within a given exercise, the active-status participant whose UUID
 * sorts first (via localeCompare) has is_active=true, and all others have is_active=false.
 * This keeps the is_active flag aligned with the UI display order (which sorts by UUID).
 *
 * IMPORTANT: Display sort and is_active assignment both use id.localeCompare
 * to ensure the visually-top participant is the active one. See TONY-80.
 *
 * Call this after any operation that changes which participants are active at an exercise
 * (session creation, rotation, etc.).
 */
export function correctIsActiveForExercise(
  sessionId: string,
  exerciseId: string,
): void {
  const db = getDatabase();
  const now = Date.now();

  // Get all active-status participants at this exercise
  const activeParticipants = db
    .prepare(
      `SELECT id FROM session_participants
       WHERE session_id = ? AND exercise_id = ? AND status = 'active'
       ORDER BY id ASC`,
    )
    .all(sessionId, exerciseId) as { id: string }[];

  if (activeParticipants.length === 0) return;

  // Sort by UUID (localeCompare) to match display order
  const sortedIds = activeParticipants.map(p => p.id).sort((a, b) => a.localeCompare(b));

  // First gets is_active=true, rest get is_active=false
  for (let i = 0; i < sortedIds.length; i++) {
    db.prepare(
      `UPDATE session_participants SET is_active = ?, updated_at = ? WHERE id = ?`,
    ).run(i === 0 ? 1 : 0, now, sortedIds[i]);
  }
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
  if (input.status !== undefined) {
    updates.push("status = ?");
    values.push(input.status);
  }
  if (input.started_at !== undefined) {
    updates.push("started_at = ?");
    values.push(input.started_at);
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
    INSERT INTO sets (id, participant_id, set_index, weight, reps, completed, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(
    id,
    input.participant_id,
    input.set_index,
    input.weight,
    input.reps,
    0,
    now,
    now,
  );

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
  console.log("----");
  console.log(`[db:completeSet] Completing set ${id}`);
  console.log("----");

  const db = getDatabase();

  return db.transaction(() => {
    const now = Date.now();

    // 1. Get the set to find which participant it belongs to
    const set = getSet(id);
    if (!set) return null;

    // Get participant before update for logging
    const participantBefore = getSessionParticipant(set.participant_id);
    console.log(
      `[db:completeSet] Participant ${set.participant_id} current_set_index BEFORE: ${participantBefore?.current_set_index}`,
    );

    // todo - srn I think this needs to go
    // 2. Complete the set
    db.prepare(
      `
      UPDATE sets
      SET completed = 1, completed_at = ?, updated_at = ?
      WHERE id = ?
    `,
    ).run(now, now, id);

    // 3. Increment the participant's current_set_index
    db.prepare(
      `
      UPDATE session_participants
      SET current_set_index = current_set_index + 1, updated_at = ?
      WHERE id = ?
    `,
    ).run(now, set.participant_id);

    // Get participant after update for logging
    const participantAfter = getSessionParticipant(set.participant_id);
    console.log(
      `[db:completeSet] Participant ${set.participant_id} current_set_index AFTER: ${participantAfter?.current_set_index}`,
    );

    return getSet(id);
  })();
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
  console.log(
    "[db:getActiveSessionWithParticipants] Active session:",
    session ? session.id : "none",
  );
  if (!session) return null;

  return getSessionWithParticipants(session.id);
}

// ============================================================================
// PERSON MAX WEIGHTS
// ============================================================================

/**
 * Set (upsert) a person's max weight for an exercise
 * Creates if doesn't exist, updates if it does
 */
export function setPersonMaxWeight(
  personId: string,
  exerciseId: string,
  maxWeight: number,
  weightUnit: WeightUnit,
): PersonMaxWeight {
  const db = getDatabase();
  const now = Date.now();

  // Check if a max weight record exists
  const existing = getPersonMaxWeight(personId, exerciseId);

  if (existing) {
    // Update existing record
    db.prepare(
      `
      UPDATE person_max_weights
      SET max_weight = ?, weight_unit = ?, updated_at = ?
      WHERE person_id = ? AND exercise_id = ?
    `,
    ).run(maxWeight, weightUnit, now, personId, exerciseId);

    return getPersonMaxWeight(personId, exerciseId)!;
  } else {
    // Create new record
    const id = crypto.randomUUID();
    db.prepare(
      `
      INSERT INTO person_max_weights (id, person_id, exercise_id, max_weight, weight_unit, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    ).run(id, personId, exerciseId, maxWeight, weightUnit, now, now);

    return getPersonMaxWeight(personId, exerciseId)!;
  }
}

/**
 * Get all max weights for a person
 */
export function getPersonMaxWeights(personId: string): PersonMaxWeight[] {
  const db = getDatabase();
  return db
    .prepare(
      `
    SELECT * FROM person_max_weights WHERE person_id = ?
  `,
    )
    .all(personId) as PersonMaxWeight[];
}

/**
 * Get a specific max weight for a person and exercise
 */
export function getPersonMaxWeight(
  personId: string,
  exerciseId: string,
): PersonMaxWeight | null {
  const db = getDatabase();
  const row = db
    .prepare(
      `
    SELECT * FROM person_max_weights WHERE person_id = ? AND exercise_id = ?
  `,
    )
    .get(personId, exerciseId) as PersonMaxWeight | undefined;

  return row || null;
}

/**
 * Delete a person's max weight for an exercise
 */
export function deletePersonMaxWeight(
  personId: string,
  exerciseId: string,
): boolean {
  const db = getDatabase();
  const result = db
    .prepare(
      `
    DELETE FROM person_max_weights WHERE person_id = ? AND exercise_id = ?
  `,
    )
    .run(personId, exerciseId);

  return result.changes > 0;
}

// ============================================================================
// ROTATION CONFIGS
// ============================================================================

/**
 * Create a rotation config for a session
 */
export function createRotationConfig(
  sessionId: string,
  exerciseIds: string[],
  maxConcurrentPerExercise: number = 2,
): void {
  const db = getDatabase();
  const now = Date.now();
  const id = crypto.randomUUID();

  db.prepare(
    `
    INSERT INTO rotation_configs (id, session_id, exercise_order, max_concurrent_per_exercise, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `,
  ).run(
    id,
    sessionId,
    JSON.stringify(exerciseIds),
    maxConcurrentPerExercise,
    now,
    now,
  );
}

/**
 * Get rotation config for a session
 */
export function getRotationConfig(sessionId: string): {
  id: string;
  session_id: string;
  exercise_order: string[];
  max_concurrent_per_exercise: number;
  created_at: number;
  updated_at: number;
} | null {
  const db = getDatabase();
  const row = db
    .prepare(
      `
    SELECT * FROM rotation_configs WHERE session_id = ?
  `,
    )
    .get(sessionId) as
    | {
        id: string;
        session_id: string;
        exercise_order: string;
        max_concurrent_per_exercise: number;
        created_at: number;
        updated_at: number;
      }
    | undefined;

  if (!row) return null;

  return {
    ...row,
    exercise_order: JSON.parse(row.exercise_order),
  };
}

// ============================================================================
// ROTATION HELPERS
// ============================================================================

/**
 * Get the next pending exercise for a participant in rotation
 */
export function getNextPendingExercise(
  sessionId: string,
  personId: string,
): SessionParticipant | null {
  const db = getDatabase();
  const row = db
    .prepare(
      `
    SELECT * FROM session_participants
    WHERE session_id = ? AND person_id = ? AND status = 'pending'
    ORDER BY rotation_order ASC
    LIMIT 1
  `,
    )
    .get(sessionId, personId) as SessionParticipant | undefined;

  return row || null;
}

/**
 * Check how many participants are currently active on an exercise
 */
export function getActiveCountForExercise(
  sessionId: string,
  exerciseId: string,
): number {
  const db = getDatabase();
  const result = db
    .prepare(
      `
    SELECT COUNT(*) as count
    FROM session_participants
    WHERE session_id = ? AND exercise_id = ? AND status = 'active'
  `,
    )
    .get(sessionId, exerciseId) as { count: number };

  return result.count;
}

/**
 * Get all completed exercises for a participant in a session
 */
export function getCompletedExercises(
  sessionId: string,
  personId: string,
): SessionParticipant[] {
  const db = getDatabase();
  return db
    .prepare(
      `
    SELECT * FROM session_participants
    WHERE session_id = ? AND person_id = ? AND status = 'completed'
    ORDER BY rotation_order ASC
  `,
    )
    .all(sessionId, personId) as SessionParticipant[];
}

/**
 * Get all incomplete exercises (pending or active) for a participant in a session
 */
export function getIncompleteExercises(
  sessionId: string,
  personId: string,
): SessionParticipant[] {
  const db = getDatabase();
  return db
    .prepare(
      `
    SELECT * FROM session_participants
    WHERE session_id = ? AND person_id = ? AND status IN ('pending', 'active')
    ORDER BY rotation_order ASC
  `,
    )
    .all(sessionId, personId) as SessionParticipant[];
}

/**
 * Mark a participant's exercise as completed and activate next exercise if available
 * Returns the next exercise participant record, or null if rotation is complete
 */
export function completeExerciseAndRotate(
  participantId: string,
): SessionParticipant | null {
  const db = getDatabase();

  return db.transaction(() => {
    const now = Date.now();

    // Get current participant
    const current = getSessionParticipant(participantId);
    if (!current) return null;

    // Mark current exercise as completed
    updateSessionParticipant(participantId, {
      status: "completed",
      completed_at: now,
    });

    // Get next pending exercise for this person
    const next = getNextPendingExercise(current.session_id, current.person_id);
    if (!next) return null; // No more exercises in rotation

    // Get max concurrent from rotation config
    const rotationConfig = getRotationConfig(current.session_id);
    const maxConcurrent = rotationConfig?.max_concurrent_per_exercise ?? 2;

    // Check capacity for next exercise
    const activeCount = getActiveCountForExercise(
      current.session_id,
      next.exercise_id!,
    );

    if (activeCount < maxConcurrent) {
      // Activate next exercise, then correct is_active to match display order (TONY-80)
      updateSessionParticipant(next.id, {
        status: "active",
        started_at: now,
      });
      correctIsActiveForExercise(current.session_id, next.exercise_id!);
    }
    // If capacity is full, next exercise stays pending until space opens up

    return getSessionParticipant(next.id);
  })();
}
