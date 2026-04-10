import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { app } from "electron";
import { fileURLToPath } from "url";

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
 * Run migrations to handle schema changes on existing databases
 */
function runMigrations(database: Database.Database): void {
  // Add exercise_id to session_participants if missing
  const columns = database
    .prepare("PRAGMA table_info(session_participants)")
    .all() as { name: string }[];
  const hasExerciseId = columns.some((col) => col.name === "exercise_id");
  if (!hasExerciseId) {
    console.log("Migration: adding exercise_id column to session_participants");
    database.exec(
      "ALTER TABLE session_participants ADD COLUMN exercise_id TEXT",
    );
  }

  // Create person_max_weights table if missing
  const tables = database
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='person_max_weights'")
    .all() as { name: string }[];
  if (tables.length === 0) {
    console.log("Migration: creating person_max_weights table");
    database.exec(`
      CREATE TABLE IF NOT EXISTS person_max_weights (
        id TEXT PRIMARY KEY,
        person_id TEXT NOT NULL,
        exercise_id TEXT NOT NULL,
        max_weight REAL NOT NULL,
        weight_unit TEXT NOT NULL CHECK(weight_unit IN ('lbs', 'kg')),
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE,
        FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
        UNIQUE(person_id, exercise_id)
      );
      CREATE INDEX IF NOT EXISTS idx_person_max_weights_person ON person_max_weights(person_id);
      CREATE INDEX IF NOT EXISTS idx_person_max_weights_exercise ON person_max_weights(exercise_id);
    `);
  }

  // Migrate people table to add DEFAULT values
  const peopleColumns = database
    .prepare("PRAGMA table_info(people)")
    .all() as { name: string; dflt_value: string | null }[];
  const idColumn = peopleColumns.find((col) => col.name === "id");
  const needsPeopleMigration = idColumn && idColumn.dflt_value === null;

  if (needsPeopleMigration) {
    console.log("Migration: adding DEFAULT values to people table");
    database.exec(`
      -- Create new people table with DEFAULT values
      CREATE TABLE people_new (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        name TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      );

      -- Copy existing data
      INSERT INTO people_new (id, name, created_at, updated_at)
      SELECT id, name, created_at, updated_at FROM people;

      -- Drop old table
      DROP TABLE people;

      -- Rename new table
      ALTER TABLE people_new RENAME TO people;

      -- Recreate index
      CREATE INDEX IF NOT EXISTS idx_people_name ON people(name);
    `);
  }

  // Migrate exercises table to add DEFAULT values
  const exerciseColumns = database
    .prepare("PRAGMA table_info(exercises)")
    .all() as { name: string; dflt_value: string | null }[];
  const exerciseIdColumn = exerciseColumns.find((col) => col.name === "id");
  const needsExerciseMigration = exerciseIdColumn && exerciseIdColumn.dflt_value === null;

  if (needsExerciseMigration) {
    console.log("Migration: adding DEFAULT values to exercises table");
    database.exec(`
      -- Create new exercises table with DEFAULT values
      CREATE TABLE exercises_new (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        name TEXT NOT NULL UNIQUE,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      );

      -- Copy existing data
      INSERT INTO exercises_new (id, name, created_at, updated_at)
      SELECT id, name, created_at, updated_at FROM exercises;

      -- Drop old table
      DROP TABLE exercises;

      -- Rename new table
      ALTER TABLE exercises_new RENAME TO exercises;
    `);
  }

  // Migrate session_participants to add rotation support
  const participantColumns = database
    .prepare("PRAGMA table_info(session_participants)")
    .all() as { name: string }[];
  const hasRotationOrder = participantColumns.some((col) => col.name === "rotation_order");

  if (!hasRotationOrder) {
    console.log("Migration: adding rotation support to session_participants");

    // SQLite doesn't support adding columns with CHECK constraints via ALTER TABLE
    // Run each ALTER TABLE separately to ensure they complete
    database.prepare("ALTER TABLE session_participants ADD COLUMN rotation_order INTEGER NOT NULL DEFAULT 0").run();
    database.prepare("ALTER TABLE session_participants ADD COLUMN status TEXT NOT NULL DEFAULT 'active'").run();
    database.prepare("ALTER TABLE session_participants ADD COLUMN started_at INTEGER").run();
    database.prepare("ALTER TABLE session_participants ADD COLUMN completed_at INTEGER").run();

    // Now set values for existing data and create indexes
    database.prepare("UPDATE session_participants SET started_at = created_at WHERE is_active = 1").run();
    database.prepare("CREATE INDEX IF NOT EXISTS idx_participants_status ON session_participants(status)").run();
    database.prepare("CREATE INDEX IF NOT EXISTS idx_participants_rotation ON session_participants(session_id, person_id, rotation_order)").run();

    console.log("Migration: rotation support added successfully");
  }

  // Add bar_weight column to exercises if missing (TONY-99)
  const exerciseColumnsForBarWeight = database
    .prepare("PRAGMA table_info(exercises)")
    .all() as { name: string }[];
  const hasBarWeight = exerciseColumnsForBarWeight.some((col) => col.name === "bar_weight");

  if (!hasBarWeight) {
    console.log("Migration: adding bar_weight column to exercises");
    // Default existing exercises to 45 (standard barbell) for backward compatibility
    database.prepare("ALTER TABLE exercises ADD COLUMN bar_weight REAL DEFAULT NULL").run();
    database.prepare("UPDATE exercises SET bar_weight = 45").run();
  }

  // Create rotation_configs table if missing
  const rotationConfigTables = database
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='rotation_configs'")
    .all() as { name: string }[];

  if (rotationConfigTables.length === 0) {
    console.log("Migration: creating rotation_configs table");
    database.exec(`
      CREATE TABLE rotation_configs (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        session_id TEXT NOT NULL UNIQUE,
        exercise_order TEXT NOT NULL,
        max_concurrent_per_exercise INTEGER NOT NULL DEFAULT 2,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
        FOREIGN KEY (session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_rotation_configs_session ON rotation_configs(session_id);

      -- Create rotation config for each existing session
      INSERT INTO rotation_configs (session_id, exercise_order, created_at, updated_at)
      SELECT
        ws.id,
        '[' || GROUP_CONCAT(DISTINCT '"' || sp.exercise_id || '"') || ']',
        unixepoch(),
        unixepoch()
      FROM workout_sessions ws
      JOIN session_participants sp ON sp.session_id = ws.id
      WHERE sp.exercise_id IS NOT NULL
      GROUP BY ws.id;
    `);
  }
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

  // Run migrations for any schema changes on existing databases
  runMigrations(db);

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
  const defaultPeople = ["Tony", "Kakes", "Noah", "Sergio"];

  const stmt = database.prepare(`
    INSERT OR IGNORE INTO people (name)
    SELECT ?
    WHERE NOT EXISTS (SELECT 1 FROM people WHERE name = ?)
  `);

  for (const name of defaultPeople) {
    stmt.run(name, name);
  }
}

/**
 * Ensure default exercises exist in the database
 */
function ensureDefaultExercises(): void {
  const database = getDatabase();
  const defaultExercises = [
    "Bench Press",
    "Pull-ups",
    "Squats",
    "Deadlifts",
    "Rows",
    "Shoulder Press",
  ];

  // Default barbell exercises get bar_weight = 45; this ensures fresh installs
  // have the correct bar offset for standard exercises. Users can change it later.
  const stmt = database.prepare(`
    INSERT OR IGNORE INTO exercises (name, bar_weight)
    SELECT ?, 45
    WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = ?)
  `);

  for (const name of defaultExercises) {
    stmt.run(name, name);
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
  const peopleNames = ["TONY", "SERGIO", "STEVE", "NOAH", "VICTORIA", "KAKES"];
  const people: { id: string; name: string }[] = [];

  const insertPerson = database.prepare(`
    INSERT INTO people (name)
    VALUES (?)
    RETURNING id
  `);

  for (const name of peopleNames) {
    const result = insertPerson.get(name) as { id: string };
    people.push({ id: result.id, name });
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
      // todo - seed data definitely should link to exercies table - we need to create a strategy to do so
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
