import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { join } from "path";
import { app } from "electron";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db: Database.Database | null = null;

/**
 * Get the database file path
 * Stores in Electron's userData directory
 */
export function getDatabasePath(): string {
  const userDataPath = app.getPath("userData");
  return join(userDataPath, "tony-workout.db");
}

/**
 * Initialize the database connection and create schema
 * @returns Database instance
 */
export function initDatabase(): Database.Database {
  if (db) {
    return db;
  }

  const dbPath = getDatabasePath();
  console.log(`Initializing database at: ${dbPath}`);

  // Create database connection
  db = new Database(dbPath);

  // Enable foreign keys
  db.pragma("foreign_keys = ON");

  // Read and execute schema
  const schemaPath = join(__dirname, "schema.sql");
  const schema = readFileSync(schemaPath, "utf-8");

  // Execute schema (split by statements)
  db.exec(schema);

  // Ensure default people exist
  ensureDefaultPeople();

  // Ensure default exercises exist
  ensureDefaultExercises();

  console.log("Database initialized successfully");
  return db;
}

/**
 * Get the active database instance
 * @throws Error if database hasn't been initialized
 */
export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
}

/**
 * Ensure default people exist in the database
 * Uses INSERT OR IGNORE to avoid duplicates
 */
function ensureDefaultPeople(): void {
  const database = getDatabase();
  const now = Date.now();
  const defaultPeople = ["Tony", "Kakes", "Noah", "Sergio"];

  const stmt = database.prepare(`
    INSERT OR IGNORE INTO people (id, name, created_at, updated_at)
    SELECT ?, ?, ?, ?
    WHERE NOT EXISTS (SELECT 1 FROM people WHERE name = ?)
  `);

  for (const name of defaultPeople) {
    stmt.run(crypto.randomUUID(), name, now, now, name);
  }
}

/**
 * Ensure default exercises exist in the database
 */
function ensureDefaultExercises(): void {
  const database = getDatabase();
  const now = Date.now();
  const defaultExercises = [
    "Bench Press",
    "Pull-ups",
    "Squats",
    "Deadlifts",
    "Rows",
    "Shoulder Press",
  ];

  const stmt = database.prepare(`
    INSERT OR IGNORE INTO exercises (id, name, created_at, updated_at)
    SELECT ?, ?, ?, ?
    WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = ?)
  `);

  for (const name of defaultExercises) {
    stmt.run(crypto.randomUUID(), name, now, now, name);
  }
}

/**
 * Close the database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    console.log("Database connection closed");
  }
}

/**
 * Seed the database with test data
 */
export function seedDatabase(): void {
  const database = getDatabase();

  console.log("Seeding database with test data...");

  const now = Date.now();

  // Create people
  const people = [
    { id: crypto.randomUUID(), name: "TONY" },
    { id: crypto.randomUUID(), name: "SERGIO" },
    { id: crypto.randomUUID(), name: "STEVE" },
    { id: crypto.randomUUID(), name: "NOAH" },
    { id: crypto.randomUUID(), name: "VICTORIA" },
    { id: crypto.randomUUID(), name: "KAKES" },
  ];

  const insertPerson = database.prepare(`
    INSERT INTO people (id, name, created_at, updated_at)
    VALUES (?, ?, ?, ?)
  `);

  for (const person of people) {
    insertPerson.run(person.id, person.name, now, now);
  }

  // Create a workout session
  const sessionId = crypto.randomUUID();
  database
    .prepare(
      `
    INSERT INTO workout_sessions (id, name, started_at, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `,
    )
    .run(sessionId, "Today's Workout", now, 1, now, now);

  // Create session participants
  const participants = [
    {
      id: crypto.randomUUID(),
      person_id: people[0].id, // TONY
      exercise_name: "Bench Press",
      weight_unit: "lbs",
      sets: [
        { weight: 170, completed: true },
        { weight: 250, completed: true },
        { weight: 210, completed: false },
        { weight: 230, completed: false },
        { weight: 250, completed: false },
      ],
    },
    {
      id: crypto.randomUUID(),
      person_id: people[1].id, // SERGIO
      exercise_name: "Bench Press",
      weight_unit: "lbs",
      sets: [
        { weight: 170, completed: true },
        { weight: 95, completed: true },
        { weight: 210, completed: false },
        { weight: 230, completed: false },
        { weight: 250, completed: false },
      ],
    },
    {
      id: crypto.randomUUID(),
      person_id: people[2].id, // STEVE
      exercise_name: "Deadlift",
      weight_unit: "lbs",
      sets: [
        { weight: 265, completed: true },
        { weight: 155, completed: true },
        { weight: 305, completed: false },
        { weight: 305, completed: false },
        { weight: 325, completed: false },
      ],
    },
    {
      id: crypto.randomUUID(),
      person_id: people[3].id, // NOAH
      exercise_name: "Deadlift",
      weight_unit: "lbs",
      sets: [
        { weight: 265, completed: true },
        { weight: 210, completed: true },
        { weight: 305, completed: false },
        { weight: 325, completed: false },
        { weight: 325, completed: false },
      ],
    },
    {
      id: crypto.randomUUID(),
      person_id: people[4].id, // VICTORIA
      exercise_name: "Back Squat",
      weight_unit: "lbs",
      sets: [
        { weight: 185, completed: true },
        { weight: 245, completed: true },
        { weight: 315, completed: false },
        { weight: 365, completed: false },
        { weight: 365, completed: false },
      ],
    },
    {
      id: crypto.randomUUID(),
      person_id: people[5].id, // KAKES
      exercise_name: "Back Squat",
      weight_unit: "lbs",
      sets: [
        { weight: 185, completed: true },
        { weight: 300, completed: true },
        { weight: 315, completed: false },
        { weight: 365, completed: false },
        { weight: 365, completed: false },
      ],
    },
  ];

  const insertParticipant = database.prepare(`
    INSERT INTO session_participants
    (id, session_id, person_id, exercise_name, exercise_id, weight_unit, current_set_index, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertSet = database.prepare(`
    INSERT INTO sets (id, participant_id, set_index, weight, reps, completed, completed_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const participant of participants) {
    // Mark first 3 as active (their turn)
    const isActive = participants.indexOf(participant) < 3 ? 1 : 0;

    insertParticipant.run(
      participant.id,
      sessionId,
      participant.person_id,
      participant.exercise_name,
      null, // exercise_id - seed data doesn't link to exercises table
      participant.weight_unit,
      1, // current_set_index
      isActive,
      now,
      now,
    );

    // Insert sets for this participant
    participant.sets.forEach((set, index) => {
      insertSet.run(
        crypto.randomUUID(),
        participant.id,
        index,
        set.weight,
        index === 0 ? 10 : 5, // First set: 10 reps, rest: 5 reps
        set.completed ? 1 : 0,
        set.completed ? now : null,
        now,
        now,
      );
    });
  }

  console.log("Database seeded successfully");
}
