-- FitTrack schema for Cloudflare D1.
-- Apply with: npx wrangler d1 execute DB --remote --file=./migrations/0001_init.sql

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  initials TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS workouts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT 'violet',
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY,
  workout_id TEXT NOT NULL,
  name TEXT NOT NULL,
  reps TEXT NOT NULL,
  load REAL NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  difficulty INTEGER NOT NULL DEFAULT 3,
  position INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  workout_id TEXT,
  workout_name TEXT NOT NULL,
  date TEXT NOT NULL,
  duration INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS session_exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  exercise_id TEXT,
  name TEXT NOT NULL,
  planned_reps TEXT NOT NULL,
  reps TEXT NOT NULL,
  load REAL NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_workouts_user ON workouts(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_exercises_workout ON exercises(workout_id, position);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_session_exercises_session ON session_exercises(session_id, position);
