-- TONY Workout Tracker Database Schema
-- SQLite database schema for local storage with cloud sync capability

-- People/Athletes
CREATE TABLE IF NOT EXISTS people (
  id TEXT PRIMARY KEY,                    -- UUID
  name TEXT NOT NULL,                     -- e.g., "TONY", "STEVE"
  created_at INTEGER NOT NULL,            -- Unix timestamp
  updated_at INTEGER NOT NULL
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

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;
