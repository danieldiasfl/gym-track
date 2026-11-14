PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS stretches (
  id TEXT PRIMARY KEY,
  workout_id TEXT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phase TEXT NOT NULL CHECK (phase IN ('before','after')),
  position INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_stretches_workout_phase_position
  ON stretches(workout_id, phase, position);
