export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type Exercise = {
  id: string;
  name: string;
  reps: string;
  load: number;
  notes: string;
  difficulty: Difficulty;
};

export type Workout = {
  id: string;
  name: string;
  description: string;
  color: string;
  exercises: Exercise[];
  createdAt: string;
};

export type User = {
  id: string;
  name: string;
  initials: string;
  workouts: Workout[];
};

export type HistoryExercise = {
  exerciseId: string;
  name: string;
  plannedReps: string;
  reps: string;
  load: number;
  notes: string;
};

export type Session = {
  id: string;
  userId: string;
  workoutId: string;
  workoutName: string;
  date: string;
  duration: number;
  exercises: HistoryExercise[];
};

export type Store = {
  users: User[];
  sessions: Session[];
};
