-- TONY Workout Tracker Database Schema
-- SQLite database schema for local storage with cloud sync capability

-- Exercises
CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),  -- Auto-generated UUID
  name TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),  -- Auto-generated Unix timestamp
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())   -- Auto-generated Unix timestamp
);

-- People/Athletes
CREATE TABLE IF NOT EXISTS people (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),  -- Auto-generated UUID
  name TEXT NOT NULL,                     -- e.g., "TONY", "STEVE"
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),  -- Auto-generated Unix timestamp
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())   -- Auto-generated Unix timestamp
);

CREATE INDEX IF NOT EXISTS idx_people_name ON people(name);

-- Workout Sessions (group workouts)
CREATE TABLE IF NOT EXISTS workout_sessions (
  id TEXT PRIMARY KEY,                    -- UUID
  name TEXT,                              -- Optional session name
  started_at INTEGER NOT NULL,            -- Unix timestamp
  ended_at INTEGER,                       -- NULL if still active
  is_active BOOLEAN DEFAULT TRUE,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_active ON workout_sessions(is_active, started_at);

-- Session Participants (person + exercise in a session)
CREATE TABLE IF NOT EXISTS session_participants (
  id TEXT PRIMARY KEY,                    -- UUID
  session_id TEXT NOT NULL,
  person_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,            -- e.g., "Bench Press", "Deadlift"
  exercise_id TEXT,                       -- FK to exercises table
  weight_unit TEXT NOT NULL               -- "lbs" or "kg"
    CHECK(weight_unit IN ('lbs', 'kg')),
  current_set_index INTEGER DEFAULT 0,    -- Which set they're currently on
  is_active BOOLEAN DEFAULT FALSE,        -- Is it their turn?
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,

  FOREIGN KEY (session_id)
    REFERENCES workout_sessions(id)
    ON DELETE CASCADE,
  FOREIGN KEY (person_id)
    REFERENCES people(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_participants_session ON session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_participants_person ON session_participants(person_id);
CREATE INDEX IF NOT EXISTS idx_participants_active ON session_participants(is_active);

-- Sets (individual sets for each exercise)
CREATE TABLE IF NOT EXISTS sets (
  id TEXT PRIMARY KEY,                    -- UUID
  participant_id TEXT NOT NULL,
  set_index INTEGER NOT NULL,             -- 0, 1, 2, etc.
  weight REAL NOT NULL,                   -- Weight for this set
  reps INTEGER NOT NULL,                  -- Repetitions for this set
  completed BOOLEAN DEFAULT FALSE,
  completed_at INTEGER,                   -- When the set was completed
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,

  FOREIGN KEY (participant_id)
    REFERENCES session_participants(id)
    ON DELETE CASCADE,

  UNIQUE(participant_id, set_index)       -- Each participant can't have duplicate set indices
);

CREATE INDEX IF NOT EXISTS idx_sets_participant ON sets(participant_id, set_index);
CREATE INDEX IF NOT EXISTS idx_sets_completed ON sets(completed);

-- Person Max Weights (1RM tracking per exercise)
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

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;
