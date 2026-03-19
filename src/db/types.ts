/**
 * Database types matching the SQLite schema
 */

export type WeightUnit = "lbs" | "kg";

/**
 * Exercise definition
 */
export interface Exercise {
  id: string;
  name: string;
  created_at: number;
  updated_at: number;
}

export interface CreateExerciseInput {
  name: string;
}

/**
 * Person/Athlete in the system
 */
export interface Person {
  id: string;
  name: string;
  created_at: number;
  updated_at: number;
}

/**
 * Group workout session
 */
export interface WorkoutSession {
  id: string;
  name: string | null;
  started_at: number;
  ended_at: number | null;
  is_active: boolean;
  created_at: number;
  updated_at: number;
}

/**
 * Link between a person and their exercise in a session
 * Supports rotation: one person can have multiple records (one per exercise)
 */
export interface SessionParticipant {
  id: string;
  session_id: string;
  person_id: string;
  exercise_name: string;
  exercise_id: string | null;
  weight_unit: WeightUnit;
  current_set_index: number;
  is_active: boolean; // Is it their turn within this exercise (toggle with partner)
  rotation_order: number; // Position in rotation sequence (0, 1, 2...)
  status: "pending" | "active" | "completed"; // Exercise status
  started_at: number | null;
  completed_at: number | null;
  created_at: number;
  updated_at: number;
}

/**
 * Individual set for an exercise
 */
export interface Set {
  id: string;
  participant_id: string;
  set_index: number;
  weight: number;
  reps: number;
  completed: boolean;
  completed_at: number | null;
  created_at: number;
  updated_at: number;
}

/**
 * Input types for creating records (without generated fields)
 */

export interface CreatePersonInput {
  name: string;
}

export interface SetConfig {
  weight: number;
  reps: number;
}

export interface ExerciseStation {
  exerciseId: string;
  participantIds: string[]; // 1-2 people
  sets?: SetConfig[]; // If omitted, falls back to default 5-set scheme
}

export interface CreateWorkoutSessionInput {
  name?: string;
  weightUnit: WeightUnit;
  stations: ExerciseStation[];
}

export interface CreateSessionParticipantInput {
  session_id: string;
  person_id: string;
  exercise_name: string;
  exercise_id: string | null;
  weight_unit: WeightUnit;
  is_active?: boolean; // Optional, defaults to false
  rotation_order?: number; // Optional, defaults to 0
  status?: "pending" | "active" | "completed"; // Optional, defaults to 'pending'
  started_at?: number | null;
}

export interface CreateSetInput {
  participant_id: string;
  set_index: number;
  weight: number;
  reps: number;
}

/**
 * Update types for modifying records
 */

export interface UpdatePersonInput {
  name?: string;
}

export interface UpdateWorkoutSessionInput {
  name?: string;
  ended_at?: number | null;
  is_active?: boolean;
}

export interface UpdateSessionParticipantInput {
  current_set_index?: number;
  is_active?: boolean;
  status?: "pending" | "active" | "completed";
  started_at?: number | null;
  completed_at?: number | null;
}

export interface UpdateSetInput {
  completed?: boolean;
  completed_at?: number | null;
}

/**
 * Joined data types for queries
 */

export interface ParticipantWithPerson extends SessionParticipant {
  person: Person;
}

export interface ParticipantWithSets extends SessionParticipant {
  person: Person;
  sets: Set[];
}

export interface SessionWithParticipants extends WorkoutSession {
  participants: ParticipantWithSets[];
}

/** Person's max weight (1RM) for an exercise */
export interface PersonMaxWeight {
  id: string;
  person_id: string;
  exercise_id: string;
  max_weight: number;
  weight_unit: WeightUnit;
  created_at: number;
  updated_at: number;
}

/** Rotation configuration for a session */
export interface RotationConfig {
  id: string;
  session_id: string;
  exercise_order: string; // JSON array of exercise_ids
  max_concurrent_per_exercise: number;
  created_at: number;
  updated_at: number;
}
