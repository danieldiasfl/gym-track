export type Difficulty = 1 | 2 | 3 | 4 | 5;
export type Exercise = { id:string; name:string; reps:string; load:number; notes:string; position:number };
export type Workout = { id:string; name:string; description:string; color:string; position:number; exercises:Exercise[]; createdAt:string };
export type User = { id:string; name:string; initials:string; workouts:Workout[] };
export type ExerciseLog = { id:string; userId:string; workoutId:string; exerciseId:string; date:string; reps:string; load:number; effort:Difficulty; notes:string; exerciseName:string; workoutName:string };
export type Store = { users:User[]; logs:ExerciseLog[] };
