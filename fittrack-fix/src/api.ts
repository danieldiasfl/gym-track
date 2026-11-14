import type { Exercise, Session, Store } from "./types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const contentType = response.headers.get("content-type") ?? "";
  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data && typeof data.error === "string"
        ? data.error
        : `Falha na API (${response.status}).`;
    throw new Error(message);
  }

  // Avoid treating an HTML fallback page as a successful API response.
  if (!contentType.toLowerCase().includes("application/json") || data === null) {
    throw new Error(`A rota ${path} não retornou JSON. Verifique o roteamento da API no Cloudflare Worker.`);
  }

  return data as T;
}

async function getState(): Promise<Store> {
  const state = await request<unknown>("/api/state");
  if (!state || typeof state !== "object") {
    throw new Error("O servidor retornou um estado inválido.");
  }

  const candidate = state as Partial<Store>;
  if (!Array.isArray(candidate.users) || !Array.isArray(candidate.sessions)) {
    throw new Error("A resposta da API não contém as listas de usuários e sessões. Confira o Worker e a rota /api/state.");
  }

  const users = candidate.users.map((user) => {
    if (!user || typeof user !== "object" || !Array.isArray(user.workouts)) {
      throw new Error("Um perfil retornado pelo banco está em formato inválido.");
    }
    return {
      ...user,
      workouts: user.workouts.map((workout) => ({
        ...workout,
        exercises: Array.isArray(workout.exercises) ? workout.exercises : [],
      })),
    };
  });

  const sessions = candidate.sessions.map((session) => ({
    ...session,
    exercises: Array.isArray(session.exercises) ? session.exercises : [],
  }));

  return { users, sessions };
}

export const api = {
  getState,
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
