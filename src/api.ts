import type { Exercise, Session, Store } from "./types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof data.error === "string" ? data.error : "Não foi possível falar com o banco.";
    throw new Error(message);
  }
  return data as T;
}

export const api = {
  getState: () => request<Store>("/api/state"),
  createUser: (user: { id: string; name: string }) =>
    request("/api/users", { method: "POST", body: JSON.stringify(user) }),
  createWorkout: (workout: {
    id: string;
    userId: string;
    name: string;
    description: string;
    color: string;
    createdAt: string;
  }) => request("/api/workouts", { method: "POST", body: JSON.stringify(workout) }),
  updateWorkout: (id: string, workout: { name: string; description: string; color: string }) =>
    request(`/api/workouts/${id}`, { method: "PATCH", body: JSON.stringify(workout) }),
  deleteWorkout: (id: string) => request(`/api/workouts/${id}`, { method: "DELETE" }),
  createExercise: (exercise: Omit<Exercise, "id"> & { id: string; workoutId: string }) =>
    request("/api/exercises", { method: "POST", body: JSON.stringify(exercise) }),
  updateExercise: (id: string, exercise: Omit<Exercise, "id">) =>
    request(`/api/exercises/${id}`, { method: "PATCH", body: JSON.stringify(exercise) }),
  deleteExercise: (id: string) => request(`/api/exercises/${id}`, { method: "DELETE" }),
  createSession: (session: Session) =>
    request("/api/sessions", { method: "POST", body: JSON.stringify(session) }),
};
