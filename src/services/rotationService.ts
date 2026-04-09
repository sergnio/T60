/**
 * Rotation service - handles automatic exercise rotation for multiple participants
 */
import * as queries from "../db/queries.js";
import { getDatabase } from "../db/init.js";
import type { ServiceResult } from "./types/serviceResults.js";
import { ErrorCode } from "./types/serviceResults.js";
import type {
  CreateRotationSessionInput,
  SessionParticipant,
  SetConfig,
} from "../db/types.js";

export type { CreateRotationSessionInput };

/**
 * Session assignments showing who is on which exercise
 */
export interface SessionAssignments {
  sessionId: string;
  assignments: {
    exerciseId: string;
    exerciseName: string;
    participants: Array<{
      participantRecordId: string;
      personId: string;
      personName: string;
      status: "pending" | "active" | "completed";
      rotationOrder: number;
    }>;
  }[];
}

/**
 * Calculates the actual loadable weight using available plates
 */
function calculateLoadableWeight(targetWeight: number): number {
  const barWeight = 45;
  const plateWeights = [45, 25, 10, 5, 2.5];

  const weightToLoad = Math.max(0, targetWeight - barWeight);
  const perSide = weightToLoad / 2;

  let loadedPerSide = 0;
  let remaining = perSide;

  for (const plateWeight of plateWeights) {
    const count = Math.floor(remaining / plateWeight);
    if (count > 0) {
      loadedPerSide += count * plateWeight;
      remaining -= count * plateWeight;
    }
  }

  return barWeight + (loadedPerSide * 2);
}

/**
 * Calculates set weights based on max weight percentage
 */
function calculateSetWeights(maxWeight: number): number[] {
  const percentages = [0.5, 0.75, 0.85, 0.85, 0.85];
  return percentages.map(percentage =>
    calculateLoadableWeight(maxWeight * percentage)
  );
}

/**
 * Generates sets config based on max weight
 */
function generateSetsConfig(personId: string, exerciseId: string): SetConfig[] {
  const maxWeightRecord = queries.getPersonMaxWeight(personId, exerciseId);

  if (!maxWeightRecord) {
    throw new Error(`MAX_WEIGHT_NOT_FOUND:${personId}:${exerciseId}`);
  }

  const weights = calculateSetWeights(maxWeightRecord.max_weight);

  return [
    { weight: weights[0], reps: 10 },
    { weight: weights[1], reps: 5 },
    { weight: weights[2], reps: 5 },
    { weight: weights[3], reps: 5 },
    { weight: weights[4], reps: 5 },
  ];
}

/**
 * Creates a workout session with automatic rotation support
 *
 * Algorithm:
 * 1. Validates that P ≤ E * maxConcurrent (enough exercises for all participants)
 * 2. Creates rotation config with exercise order
 * 3. Creates participant records (one per person per exercise)
 * 4. Assigns initial participants to exercises:
 *    - First maxConcurrent participants → Exercise 1 (status: active)
 *    - Next maxConcurrent participants → Exercise 2 (status: active)
 *    - Remaining exercises for each person → status: pending
 * 5. Creates sets for each active participant record
 */
export async function createRotationSession(
  input: CreateRotationSessionInput,
): Promise<ServiceResult<{ sessionId: string }>> {
  const maxConcurrent = input.maxConcurrentPerExercise ?? 2;

  console.log(
    `[rotationService] Creating rotation session with ${input.participantIds.length} participants and ${input.exerciseIds.length} exercises`,
  );

  try {
    // Validate: P ≤ E * maxConcurrent
    const maxCapacity = input.exerciseIds.length * maxConcurrent;
    if (input.participantIds.length > maxCapacity) {
      return {
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: `Too many participants. Maximum ${maxCapacity} participants for ${input.exerciseIds.length} exercises with ${maxConcurrent} per exercise.`,
          details: {
            participantCount: input.participantIds.length,
            exerciseCount: input.exerciseIds.length,
            maxCapacity,
          },
        },
      };
    }

    // Validate all exercises exist
    for (const exerciseId of input.exerciseIds) {
      const exercise = queries.getExercise(exerciseId);
      if (!exercise) {
        return {
          success: false,
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: `Exercise not found: ${exerciseId}`,
          },
        };
      }
    }

    // Create the session
    const now = Date.now();
    const sessionId = crypto.randomUUID();

    getDatabase().transaction(() => {
      // 1. Create workout session
      getDatabase().prepare(`
        INSERT INTO workout_sessions (id, name, started_at, is_active, created_at, updated_at)
        VALUES (?, ?, ?, TRUE, ?, ?)
      `).run(sessionId, input.name || null, now, now, now);

      // 2. Create rotation config
      queries.createRotationConfig(sessionId, input.exerciseIds, maxConcurrent);

      // 3. Create participant records (one per person per exercise)
      const exerciseMap = new Map(
        input.exerciseIds.map((id) => [id, queries.getExercise(id)!])
      );

      // Track which participant is assigned to which exercise initially
      let participantIndex = 0;

      console.log(`[rotationService] Creating participant records for ${input.participantIds.length} people across ${input.exerciseIds.length} exercises`);

      for (const personId of input.participantIds) {
        const person = queries.getPerson(personId);
        if (!person) {
          throw new Error(`Person not found: ${personId}`);
        }

        console.log(`[rotationService] Creating records for person: ${person.name} (participantIndex=${participantIndex})`);

        // Create a participant record for each exercise in rotation
        for (let rotationOrder = 0; rotationOrder < input.exerciseIds.length; rotationOrder++) {
          const exerciseId = input.exerciseIds[rotationOrder];
          const exercise = exerciseMap.get(exerciseId)!;

          // Determine initial status:
          // - Assign first maxConcurrent participants to exercise 0 (active)
          // - Next maxConcurrent participants to exercise 1 (active), etc.
          const exerciseSlot = Math.floor(participantIndex / maxConcurrent);
          const positionWithinSlot = participantIndex % maxConcurrent;
          const isAssignedToExercise = rotationOrder === exerciseSlot;
          // Only the first person at each exercise starts as is_active
          // (the second person rests until it's their turn)
          const isFirstAtExercise = isAssignedToExercise && positionWithinSlot === 0;

          const participantRecordId = crypto.randomUUID();

          console.log(`[rotationService]   - Exercise: ${exercise.name}, rotationOrder=${rotationOrder}, status=${isAssignedToExercise ? "active" : "pending"}, is_active=${isFirstAtExercise}`);

          getDatabase().prepare(`
            INSERT INTO session_participants
            (id, session_id, person_id, exercise_name, exercise_id, weight_unit,
             current_set_index, is_active, rotation_order, status, started_at, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            participantRecordId,
            sessionId,
            personId,
            exercise.name,
            exerciseId,
            input.weightUnit,
            0, // current_set_index
            isFirstAtExercise ? 1 : 0, // is_active - only first person at exercise
            rotationOrder,
            isAssignedToExercise ? "active" : "pending", // status - both partners are 'active'
            isAssignedToExercise ? now : null,
            now,
            now,
          );

          console.log(`[rotationService]     ✓ Participant record created`);

          // 4. Create sets for all participants assigned to this exercise
          if (isAssignedToExercise) {
            console.log(`[rotationService]     Creating ${5} sets for active assignment`);
            const setsConfig = generateSetsConfig(personId, exerciseId);
            for (let setIndex = 0; setIndex < setsConfig.length; setIndex++) {
              const setId = crypto.randomUUID();
              getDatabase().prepare(`
                INSERT INTO sets (id, participant_id, set_index, weight, reps, completed, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              `).run(
                setId,
                participantRecordId,
                setIndex,
                setsConfig[setIndex].weight,
                setsConfig[setIndex].reps,
                0, // not completed
                now,
                now,
              );
            }
            console.log(`[rotationService]     ✓ ${setsConfig.length} sets created`);
          } else {
            console.log(`[rotationService]     Skipping set creation for pending exercise (will create during rotation)`);
          }
        }

        participantIndex++;
      }

      // Correct is_active to match display sort order at all exercises (TONY-80)
      for (const exerciseId of input.exerciseIds) {
        queries.correctIsActiveForExercise(sessionId, exerciseId);
      }

      console.log(`[rotationService] ✓ All participant records created successfully`);
    })();

    console.log(`[rotationService] Created rotation session: ${sessionId}`);
    return { success: true, data: { sessionId } };
  } catch (error) {
    console.error("[rotationService] Failed to create rotation session:", error);

    // Check if it's a max weight not found error
    if (error instanceof Error && error.message.startsWith("MAX_WEIGHT_NOT_FOUND:")) {
      const [, personId, exerciseId] = error.message.split(":");
      return {
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: "Max weight not found for participant",
          details: { personId, exerciseId },
        },
      };
    }

    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to create rotation session",
        details: error,
      },
    };
  }
}

/**
 * Gets current exercise assignments for a session
 */
export async function getSessionAssignments(
  sessionId: string,
): Promise<ServiceResult<SessionAssignments>> {
  try {
    const participants = queries.getSessionParticipants(sessionId);

    // Group by exercise
    const exerciseMap = new Map<string, typeof participants>();
    for (const participant of participants) {
      if (!participant.exercise_id) continue;

      if (!exerciseMap.has(participant.exercise_id)) {
        exerciseMap.set(participant.exercise_id, []);
      }
      exerciseMap.get(participant.exercise_id)!.push(participant);
    }

    const assignments = Array.from(exerciseMap.entries()).map(([exerciseId, participants]) => {
      const firstParticipant = participants[0];
      return {
        exerciseId,
        exerciseName: firstParticipant.exercise_name,
        participants: participants.map((p) => {
          const person = queries.getPerson(p.person_id)!;
          return {
            participantRecordId: p.id,
            personId: p.person_id,
            personName: person.name,
            status: p.status,
            rotationOrder: p.rotation_order,
          };
        }),
      };
    });

    return {
      success: true,
      data: {
        sessionId,
        assignments,
      },
    };
  } catch (error) {
    console.error("[rotationService] Failed to get session assignments:", error);
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to get session assignments",
        details: error,
      },
    };
  }
}

/**
 * Rotates all participants at an exercise to their next exercise
 * Called when all participants at an exercise complete the same set
 */
export async function rotateAllParticipantsAtExercise(
  sessionId: string,
  exerciseId: string,
): Promise<ServiceResult<{ rotated: boolean; participantCount: number }>> {
  try {
    // Get all active participants at this exercise
    const allParticipants = queries.getSessionParticipants(sessionId);
    const participantsAtExercise = allParticipants.filter(
      (p) => p.exercise_id === exerciseId && p.status === "active"
    );

    if (participantsAtExercise.length === 0) {
      return {
        success: true,
        data: { rotated: false, participantCount: 0 },
      };
    }

    console.log(
      `[rotationService] Rotating ${participantsAtExercise.length} participants from exercise ${exerciseId}`
    );

    // Rotate each participant to their next exercise
    for (const participant of participantsAtExercise) {
      const nextParticipant = queries.completeExerciseAndRotate(participant.id);

      // If next exercise was activated, create sets for it
      if (nextParticipant && nextParticipant.status === "active") {
        const setsConfig = generateSetsConfig(
          nextParticipant.person_id,
          nextParticipant.exercise_id!,
        );

        for (let setIndex = 0; setIndex < setsConfig.length; setIndex++) {
          queries.createSet({
            participant_id: nextParticipant.id,
            set_index: setIndex,
            weight: setsConfig[setIndex].weight,
            reps: setsConfig[setIndex].reps,
          });
        }

        console.log(
          `[rotationService] Rotated ${participant.person_id} to ${nextParticipant.exercise_name}`
        );
      }
    }

    return {
      success: true,
      data: {
        rotated: true,
        participantCount: participantsAtExercise.length,
      },
    };
  } catch (error) {
    console.error("[rotationService] Failed to rotate all participants:", error);
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to rotate all participants at exercise",
        details: error,
      },
    };
  }
}

/**
 * Finds the next exercise in rotation for a person, respecting rotation order with wrap-around.
 * E.g., if current is rotation_order=1, picks pending with order 2 first, then wraps to 0.
 */
function getNextInRotation(
  sessionId: string,
  personId: string,
  currentRotationOrder: number,
): SessionParticipant | null {
  const incomplete = queries.getIncompleteExercises(sessionId, personId);
  const pending = incomplete.filter((p) => p.status === "pending");

  if (pending.length === 0) return null;

  // First: next pending after current rotation_order
  const next = pending.find((p) => p.rotation_order > currentRotationOrder);
  // Wrap around if none found
  return next || pending[0];
}

/**
 * Rotates ALL active participants across all exercises in a session simultaneously.
 * Called when every active participant at every exercise has completed all their sets.
 */
export async function rotateAllParticipantsInSession(
  sessionId: string,
): Promise<ServiceResult<{ rotated: boolean; participantCount: number }>> {
  try {
    const allParticipants = queries.getSessionParticipants(sessionId);
    const activeParticipants = allParticipants.filter((p) => p.status === "active");

    if (activeParticipants.length === 0) {
      return { success: true, data: { rotated: false, participantCount: 0 } };
    }

    console.log(
      `[rotationService] Rotating ALL ${activeParticipants.length} participants in session ${sessionId}`
    );

    const db = getDatabase();
    db.transaction(() => {
      const now = Date.now();

      // Phase 1: Mark all current exercises as completed
      for (const participant of activeParticipants) {
        queries.updateSessionParticipant(participant.id, {
          status: "completed",
          completed_at: now,
        });
      }

      // Phase 2: Activate next exercises with correct rotation order
      const activatedExerciseIds = new Set<string>();
      for (const participant of activeParticipants) {
        const next = getNextInRotation(
          sessionId,
          participant.person_id,
          participant.rotation_order,
        );

        if (!next) {
          console.log(
            `[rotationService] No more exercises for ${participant.person_id}`
          );
          continue;
        }

        queries.updateSessionParticipant(next.id, {
          status: "active",
          started_at: now,
        });
        if (next.exercise_id) {
          activatedExerciseIds.add(next.exercise_id);
        }

        // Before creating sets, check if they already exist
        const existingSets = queries.getSetsByParticipant(next.id);

        if (existingSets.length === 0) {
          // Sets don't exist yet - create them
          console.log(
            `[rotationService] Creating ${5} sets for ${next.exercise_name}`
          );
          const setsConfig = generateSetsConfig(next.person_id, next.exercise_id!);
          for (let setIndex = 0; setIndex < setsConfig.length; setIndex++) {
            queries.createSet({
              participant_id: next.id,
              set_index: setIndex,
              weight: setsConfig[setIndex].weight,
              reps: setsConfig[setIndex].reps,
            });
          }
        } else {
          // Sets already exist - skip creation
          console.log(
            `[rotationService] Sets already exist for ${next.exercise_name} (${existingSets.length} sets), skipping creation`
          );
        }

        console.log(
          `[rotationService] Rotated ${participant.person_id} from ${participant.exercise_name} to ${next.exercise_name}`
        );
      }

      // Phase 3: Correct is_active to match display sort order at all activated exercises (TONY-80)
      for (const exerciseId of activatedExerciseIds) {
        queries.correctIsActiveForExercise(sessionId, exerciseId);
      }
    })();

    return {
      success: true,
      data: { rotated: true, participantCount: activeParticipants.length },
    };
  } catch (error) {
    console.error("[rotationService] Failed to rotate all participants in session:", error);
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to rotate all participants in session",
        details: error,
      },
    };
  }
}

/**
 * Checks if a participant has completed all sets for their current exercise
 * and triggers rotation if so
 */
export async function checkAndRotate(
  participantId: string,
): Promise<ServiceResult<{ rotated: boolean; nextExercise?: SessionParticipant }>> {
  try {
    const participant = queries.getSessionParticipant(participantId);
    if (!participant) {
      return {
        success: false,
        error: {
          code: ErrorCode.NOT_FOUND,
          message: "Participant not found",
        },
      };
    }

    // Check if all sets are completed
    const sets = queries.getSetsByParticipant(participantId);
    const allSetsCompleted = sets.length > 0 && sets.every((set) => set.completed);

    if (!allSetsCompleted) {
      // Not ready to rotate yet
      return {
        success: true,
        data: { rotated: false },
      };
    }

    // All sets completed - trigger rotation
    console.log(`[rotationService] Participant ${participantId} completed all sets, rotating...`);

    const nextParticipant = queries.completeExerciseAndRotate(participantId);

    // If next exercise was activated, create sets for it
    if (nextParticipant && nextParticipant.status === "active") {
      const setsConfig = generateSetsConfig(
        nextParticipant.person_id,
        nextParticipant.exercise_id!,
      );

      for (let setIndex = 0; setIndex < setsConfig.length; setIndex++) {
        queries.createSet({
          participant_id: nextParticipant.id,
          set_index: setIndex,
          weight: setsConfig[setIndex].weight,
          reps: setsConfig[setIndex].reps,
        });
      }

      console.log(`[rotationService] Rotated to ${nextParticipant.exercise_name}`);
    } else {
      console.log(`[rotationService] Rotation complete - no more exercises`);
    }

    return {
      success: true,
      data: {
        rotated: true,
        nextExercise: nextParticipant || undefined,
      },
    };
  } catch (error) {
    console.error("[rotationService] Failed to check and rotate:", error);
    return {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: "Failed to check and rotate",
        details: error,
      },
    };
  }
}