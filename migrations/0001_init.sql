PRAGMA foreign_keys = ON;
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  initials TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE workouts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT 'violet',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE TABLE exercises (
  id TEXT PRIMARY KEY,
  workout_id TEXT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  reps TEXT NOT NULL,
  load REAL NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE exercise_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workout_id TEXT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  log_date TEXT NOT NULL,
  reps TEXT NOT NULL,
  load REAL NOT NULL DEFAULT 0,
  effort INTEGER NOT NULL CHECK (effort BETWEEN 1 AND 5),
  notes TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(user_id, exercise_id, log_date)
);
CREATE INDEX idx_workouts_user_position ON workouts(user_id, position);
CREATE INDEX idx_exercises_workout_position ON exercises(workout_id, position);
CREATE INDEX idx_logs_user_date ON exercise_logs(user_id, log_date DESC);
CREATE INDEX idx_logs_exercise_date ON exercise_logs(exercise_id, log_date DESC);
