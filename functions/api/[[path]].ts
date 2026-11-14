type SqlRow = Record<string, unknown>;

type Prepared = {
  bind(...values: unknown[]): Prepared;
  all<T = SqlRow>(): Promise<{ results: T[] }>;
  first<T = SqlRow>(): Promise<T | null>;
  run(): Promise<unknown>;
};

type Sql = {
  prepare(query: string): Prepared;
  batch(statements: Prepared[]): Promise<unknown>;
};

type Env = {
  DB?: Sql;
};

type UserRow = { id: string; name: string; initials: string };
type WorkoutRow = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  color: string;
  created_at: string;
};
type ExerciseRow = {
  id: string;
  workout_id: string;
  name: string;
  reps: string;
  load: number;
  notes: string;
  difficulty: number;
};
type SessionRow = {
  id: string;
  user_id: string;
  workout_id: string | null;
  workout_name: string;
  date: string;
  duration: number;
};
type SessionExerciseRow = {
  session_id: string;
  exercise_id: string | null;
  name: string;
  planned_reps: string;
  reps: string;
  load: number;
  notes: string;
};

const COLORS = new Set(["violet", "blue", "green", "orange", "pink"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

const text = (value: unknown, max: number) => {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
};

const requireId = (value: unknown) => {
  if (typeof value !== "string" || !UUID.test(value)) throw new HttpError(400, "Identificador inválido.");
  return value;
};

const requireName = (value: unknown, max: number, label: string) => {
  const name = text(value, max);
  if (!name) throw new HttpError(400, `${label} é obrigatório.`);
  return name;
};

const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();

async function readBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("invalid");
    return body as Record<string, unknown>;
  } catch {
    throw new HttpError(400, "JSON inválido.");
  }
}

async function loadState(db: Sql) {
  const [users, workouts, exercises, sessions, sessionExercises] = await Promise.all([
    db.prepare("SELECT id, name, initials FROM users ORDER BY created_at, id").all<UserRow>(),
    db.prepare("SELECT id, user_id, name, description, color, created_at FROM workouts ORDER BY created_at, id").all<WorkoutRow>(),
    db.prepare("SELECT id, workout_id, name, reps, load, notes, difficulty FROM exercises ORDER BY position, rowid").all<ExerciseRow>(),
    db.prepare("SELECT id, user_id, workout_id, workout_name, date, duration FROM sessions ORDER BY date DESC, created_at DESC").all<SessionRow>(),
    db.prepare("SELECT session_id, exercise_id, name, planned_reps, reps, load, notes FROM session_exercises ORDER BY position, id").all<SessionExerciseRow>(),
  ]);

  const exercisesByWorkout = new Map<string, ExerciseRow[]>();
  for (const exercise of exercises.results) {
    const list = exercisesByWorkout.get(exercise.workout_id) ?? [];
    list.push(exercise);
    exercisesByWorkout.set(exercise.workout_id, list);
  }

  const workoutsByUser = new Map<string, ReturnType<typeof mapWorkout>[]>();
  for (const workout of workouts.results) {
    const list = workoutsByUser.get(workout.user_id) ?? [];
    list.push(mapWorkout(workout, exercisesByWorkout.get(workout.id) ?? []));
    workoutsByUser.set(workout.user_id, list);
  }

  const loggedBySession = new Map<string, ReturnType<typeof mapSessionExercise>[]>();
  for (const exercise of sessionExercises.results) {
    const list = loggedBySession.get(exercise.session_id) ?? [];
    list.push(mapSessionExercise(exercise));
    loggedBySession.set(exercise.session_id, list);
  }

  return {
    users: users.results.map((user) => ({
      id: user.id,
      name: user.name,
      initials: user.initials,
      workouts: workoutsByUser.get(user.id) ?? [],
    })),
    sessions: sessions.results.map((session) => ({
      id: session.id,
      userId: session.user_id,
      workoutId: session.workout_id ?? "",
      workoutName: session.workout_name,
      date: session.date,
      duration: session.duration,
      exercises: loggedBySession.get(session.id) ?? [],
    })),
  };
}

function mapWorkout(workout: WorkoutRow, exercises: ExerciseRow[]) {
  return {
    id: workout.id,
    name: workout.name,
    description: workout.description,
    color: workout.color,
    createdAt: workout.created_at,
    exercises: exercises.map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      reps: exercise.reps,
      load: Number(exercise.load) || 0,
      notes: exercise.notes,
      difficulty: clampDifficulty(exercise.difficulty),
    })),
  };
}

function mapSessionExercise(exercise: SessionExerciseRow) {
  return {
    exerciseId: exercise.exercise_id ?? "",
    name: exercise.name,
    plannedReps: exercise.planned_reps,
    reps: exercise.reps,
    load: Number(exercise.load) || 0,
    notes: exercise.notes,
  };
}

function clampDifficulty(value: number) {
  const difficulty = Number(value);
  if (difficulty < 1 || difficulty > 5) return 3;
  return difficulty;
}

function exerciseInput(body: Record<string, unknown>) {
  const difficulty = Number(body.difficulty);
  const load = Number(body.load);
  if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 5) {
    throw new HttpError(400, "Dificuldade inválida.");
  }
  if (!Number.isFinite(load) || load < 0 || load > 100000) {
    throw new HttpError(400, "Carga inválida.");
  }
  const reps = requireName(body.reps, 40, "Séries e repetições");
  return {
    name: requireName(body.name, 70, "Exercício"),
    reps,
    load,
    notes: text(body.notes, 280),
    difficulty,
  };
}

async function handle(request: Request, db: Sql) {
  const segments = new URL(request.url).pathname.split("/").filter(Boolean).slice(1);
  const [resource, id] = segments;
  const method = request.method;

  if (method === "GET" && resource === "state" && !id) return json(await loadState(db));

  if (method === "POST" && resource === "users" && !id) {
    const body = await readBody(request);
    const userId = requireId(body.id);
    const name = requireName(body.name, 32, "Nome");
    const existing = await db.prepare("SELECT id FROM users WHERE id = ?").bind(userId).first();
    if (existing) throw new HttpError(409, "Perfil já existe.");
    await db.prepare("INSERT INTO users (id, name, initials) VALUES (?, ?, ?)").bind(userId, name, initialsOf(name)).run();
    return json({ ok: true }, 201);
  }

  if (method === "POST" && resource === "workouts" && !id) {
    const body = await readBody(request);
    const workoutId = requireId(body.id);
    const userId = requireId(body.userId);
    const name = requireName(body.name, 40, "Nome do treino");
    const description = text(body.description, 80);
    const color = text(body.color, 20);
    const createdAt = text(body.createdAt, 10);
    if (!COLORS.has(color)) throw new HttpError(400, "Cor inválida.");
    if (!DATE.test(createdAt)) throw new HttpError(400, "Data inválida.");
    const user = await db.prepare("SELECT id FROM users WHERE id = ?").bind(userId).first();
    if (!user) throw new HttpError(404, "Perfil não encontrado.");
    await db.prepare(
      "INSERT INTO workouts (id, user_id, name, description, color, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(workoutId, userId, name, description, color, createdAt).run();
    return json({ ok: true }, 201);
  }

  if (method === "PATCH" && resource === "workouts" && id) {
    const workoutId = requireId(id);
    const body = await readBody(request);
    const name = requireName(body.name, 40, "Nome do treino");
    const description = text(body.description, 80);
    const color = text(body.color, 20);
    if (!COLORS.has(color)) throw new HttpError(400, "Cor inválida.");
    const found = await db.prepare("SELECT id FROM workouts WHERE id = ?").bind(workoutId).first();
    if (!found) throw new HttpError(404, "Treino não encontrado.");
    await db.prepare(
      "UPDATE workouts SET name = ?, description = ?, color = ? WHERE id = ?"
    ).bind(name, description, color, workoutId).run();
    return json({ ok: true });
  }

  if (method === "DELETE" && resource === "workouts" && id) {
    const workoutId = requireId(id);
    await db.batch([
      db.prepare("DELETE FROM exercises WHERE workout_id = ?").bind(workoutId),
      db.prepare("DELETE FROM workouts WHERE id = ?").bind(workoutId),
    ]);
    return json({ ok: true });
  }

  if (method === "POST" && resource === "exercises" && !id) {
    const body = await readBody(request);
    const exerciseId = requireId(body.id);
    const workoutId = requireId(body.workoutId);
    const input = exerciseInput(body);
    const workout = await db.prepare("SELECT id FROM workouts WHERE id = ?").bind(workoutId).first();
    if (!workout) throw new HttpError(404, "Treino não encontrado.");
    await db.prepare(
      `INSERT INTO exercises (id, workout_id, name, reps, load, notes, difficulty, position)
       SELECT ?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT MAX(position) FROM exercises WHERE workout_id = ?), -1) + 1`
    ).bind(exerciseId, workoutId, input.name, input.reps, input.load, input.notes, input.difficulty, workoutId).run();
    return json({ ok: true }, 201);
  }

  if (method === "PATCH" && resource === "exercises" && id) {
    const exerciseId = requireId(id);
    const input = exerciseInput(await readBody(request));
    const found = await db.prepare("SELECT id FROM exercises WHERE id = ?").bind(exerciseId).first();
    if (!found) throw new HttpError(404, "Exercício não encontrado.");
    await db.prepare(
      "UPDATE exercises SET name = ?, reps = ?, load = ?, notes = ?, difficulty = ? WHERE id = ?"
    ).bind(input.name, input.reps, input.load, input.notes, input.difficulty, exerciseId).run();
    return json({ ok: true });
  }

  if (method === "DELETE" && resource === "exercises" && id) {
    const exerciseId = requireId(id);
    await db.prepare("DELETE FROM exercises WHERE id = ?").bind(exerciseId).run();
    return json({ ok: true });
  }

  if (method === "POST" && resource === "sessions" && !id) {
    const body = await readBody(request);
    const sessionId = requireId(body.id);
    const userId = requireId(body.userId);
    const workoutId = requireId(body.workoutId);
    const date = text(body.date, 10);
    const duration = Number(body.duration);
    const workoutName = requireName(body.workoutName, 40, "Treino");
    if (!DATE.test(date)) throw new HttpError(400, "Data inválida.");
    if (!Number.isInteger(duration) || duration < 1 || duration > 100000) throw new HttpError(400, "Duração inválida.");
    if (!Array.isArray(body.exercises) || body.exercises.length < 1 || body.exercises.length > 80) {
      throw new HttpError(400, "A sessão precisa ter exercícios.");
    }
    const workout = await db.prepare("SELECT id FROM workouts WHERE id = ? AND user_id = ?").bind(workoutId, userId).first();
    if (!workout) throw new HttpError(404, "Treino não encontrado.");

    const logged = body.exercises.map((item, index) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) throw new HttpError(400, "Exercício da sessão inválido.");
      const entry = item as Record<string, unknown>;
      const load = Number(entry.load);
      if (!Number.isFinite(load) || load < 0 || load > 100000) throw new HttpError(400, "Carga inválida.");
      const exerciseId = text(entry.exerciseId, 36);
      if (exerciseId && !UUID.test(exerciseId)) throw new HttpError(400, "Exercício da sessão inválido.");
      return {
        exerciseId,
        name: requireName(entry.name, 70, "Exercício"),
        plannedReps: text(entry.plannedReps, 40),
        reps: requireName(entry.reps, 40, "Repetições"),
        load,
        notes: text(entry.notes, 280),
        position: index,
      };
    });

    await db.batch([
      db.prepare(
        "INSERT INTO sessions (id, user_id, workout_id, workout_name, date, duration) VALUES (?, ?, ?, ?, ?, ?)"
      ).bind(sessionId, userId, workoutId, workoutName, date, duration),
      ...logged.map((exercise) =>
        db.prepare(
          `INSERT INTO session_exercises (session_id, exercise_id, name, planned_reps, reps, load, notes, position)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          sessionId,
          exercise.exerciseId || null,
          exercise.name,
          exercise.plannedReps,
          exercise.reps,
          exercise.load,
          exercise.notes,
          exercise.position
        )
      ),
    ]);
    return json({ ok: true }, 201);
  }

  throw new HttpError(404, "Rota não encontrada.");
}

export async function onRequest(context: { request: Request; env: Env }) {
  const db = context.env.DB;
  if (!db) return json({ error: "Binding D1 'DB' não está configurado neste projeto." }, 500);
  try {
    return await handle(context.request, db);
  } catch (error) {
    if (error instanceof HttpError) return json({ error: error.message }, error.status);
    const message = error instanceof Error ? error.message : "Erro interno.";
    return json({ error: message }, 500);
  }
}
