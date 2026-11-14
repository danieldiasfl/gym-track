import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowLeft, ArrowRight, CalendarDays, Check, ChevronDown,
  CircleHelp, Clock3, Dumbbell, Ellipsis, History, House, LogOut,
  Menu, MoreHorizontal, Pencil, Plus, Search, Settings2, Sparkles,
  Target, Trash2, TrendingUp, UserRound, Users, X, Zap
} from "lucide-react";

type Difficulty = 1 | 2 | 3 | 4 | 5;
type Exercise = { id: string; name: string; reps: string; load: number; notes: string; difficulty: Difficulty };
type Workout = { id: string; name: string; description: string; color: string; exercises: Exercise[]; createdAt: string };
type User = { id: string; name: string; initials: string; workouts: Workout[] };
type HistoryExercise = { exerciseId: string; name: string; plannedReps: string; reps: string; load: number; notes: string };
type Session = { id: string; userId: string; workoutId: string; workoutName: string; date: string; duration: number; exercises: HistoryExercise[] };
type Store = { users: User[]; sessions: Session[] };

const uid = () => Math.random().toString(36).slice(2, 10);
const today = () => new Date().toISOString().slice(0, 10);
const sample: Store = {
  users: [
    {
      id: "u1", name: "Alex", initials: "AL",
      workouts: [
        { id: "w1", name: "Treino A", description: "Peito, ombro e tríceps", color: "violet", createdAt: today(), exercises: [
          { id: "e1", name: "Supino reto com barra", reps: "3 × 10", load: 40, notes: "Controlar a descida", difficulty: 3 },
          { id: "e2", name: "Supino inclinado com halteres", reps: "3 × 12", load: 16, notes: "", difficulty: 4 },
          { id: "e3", name: "Elevação lateral", reps: "3 × 15", load: 8, notes: "Sem embalo", difficulty: 3 },
          { id: "e4", name: "Tríceps corda", reps: "3 × 12", load: 25, notes: "", difficulty: 2 }
        ]},
        { id: "w2", name: "Treino B", description: "Costas, bíceps e abdômen", color: "blue", createdAt: today(), exercises: [
          { id: "e5", name: "Puxada frontal", reps: "3 × 10", load: 45, notes: "", difficulty: 3 },
          { id: "e6", name: "Remada baixa", reps: "3 × 12", load: 35, notes: "Pausar na contração", difficulty: 4 },
          { id: "e7", name: "Rosca direta", reps: "3 × 10", load: 15, notes: "", difficulty: 3 }
        ]},
        { id: "w3", name: "Treino C", description: "Pernas e panturrilha", color: "orange", createdAt: today(), exercises: [
          { id: "e8", name: "Agachamento livre", reps: "3 × 10", load: 50, notes: "Amplitude confortável", difficulty: 4 },
          { id: "e9", name: "Leg press", reps: "3 × 12", load: 120, notes: "", difficulty: 3 },
          { id: "e10", name: "Mesa flexora", reps: "3 × 12", load: 30, notes: "", difficulty: 3 },
          { id: "e11", name: "Panturrilha em pé", reps: "3 × 15", load: 25, notes: "", difficulty: 2 }
        ]}
      ]
    },
    { id: "u2", name: "Marina", initials: "MA", workouts: [
      { id: "w4", name: "Full body", description: "Corpo inteiro", color: "green", createdAt: today(), exercises: [
        { id: "e12", name: "Agachamento goblet", reps: "3 × 12", load: 12, notes: "", difficulty: 3 },
        { id: "e13", name: "Remada unilateral", reps: "3 × 10", load: 10, notes: "", difficulty: 3 }
      ]}
    ]}
  ],
  sessions: [
    { id: "s1", userId: "u1", workoutId: "w1", workoutName: "Treino A", date: "2026-11-12", duration: 52, exercises: [
      { exerciseId: "e1", name: "Supino reto com barra", plannedReps: "3 × 10", reps: "10 / 10 / 9", load: 42, notes: "" },
      { exerciseId: "e2", name: "Supino inclinado com halteres", plannedReps: "3 × 12", reps: "12 / 12 / 12", load: 16, notes: "" },
      { exerciseId: "e3", name: "Elevação lateral", plannedReps: "3 × 15", reps: "15 / 15 / 13", load: 8, notes: "" },
      { exerciseId: "e4", name: "Tríceps corda", plannedReps: "3 × 12", reps: "12 / 12 / 12", load: 27.5, notes: "" }
    ]},
    { id: "s2", userId: "u1", workoutId: "w2", workoutName: "Treino B", date: "2026-11-10", duration: 48, exercises: [
      { exerciseId: "e5", name: "Puxada frontal", plannedReps: "3 × 10", reps: "10 / 10 / 10", load: 45, notes: "" },
      { exerciseId: "e6", name: "Remada baixa", plannedReps: "3 × 12", reps: "12 / 12 / 12", load: 35, notes: "" }
    ]},
    { id: "s3", userId: "u1", workoutId: "w1", workoutName: "Treino A", date: "2026-11-07", duration: 55, exercises: [
      { exerciseId: "e1", name: "Supino reto com barra", plannedReps: "3 × 10", reps: "10 / 9 / 8", load: 40, notes: "" },
      { exerciseId: "e2", name: "Supino inclinado com halteres", plannedReps: "3 × 12", reps: "12 / 11 / 10", load: 14, notes: "" }
    ]}
  ]
};

const difficultyLabels = ["Muito fácil", "Fácil", "Moderado", "Difícil", "Muito difícil"];
const colors = ["violet", "blue", "green", "orange", "pink"];
const readStore = (): Store => {
  try { const raw = localStorage.getItem("fittrack-data"); if (raw) return JSON.parse(raw) as Store; } catch {}
  return sample;
};
const fmtDate = (date: string) => new Date(date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
const cx = (...v: (string | false | undefined)[]) => v.filter(Boolean).join(" ");

function App() {
  const [store, setStore] = useState<Store>(readStore);
  const [userId, setUserId] = useState<string | null>(null);
  const [page, setPage] = useState<"home" | "history" | "workout" | "run">("home");
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [search, setSearch] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState("");
  const [sessionDate, setSessionDate] = useState(today());
  const [runValues, setRunValues] = useState<Record<string, { reps: string; load: string; notes: string }>>({});
  const [runStarted, setRunStarted] = useState<number | null>(null);
  const [sessionDetail, setSessionDetail] = useState<Session | null>(null);

  useEffect(() => { localStorage.setItem("fittrack-data", JSON.stringify(store)); }, [store]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 2600); return () => clearTimeout(t); }, [toast]);

  const user = store.users.find(u => u.id === userId) ?? null;
  const workout = user?.workouts.find(w => w.id === selectedWorkoutId) ?? null;
  const userSessions = useMemo(() => store.sessions.filter(s => s.userId === user?.id).sort((a,b) => b.date.localeCompare(a.date)), [store.sessions, user]);
  const totalSessions = userSessions.length;
  const totalExercises = user?.workouts.reduce((n,w) => n + w.exercises.length, 0) ?? 0;
  const lastSession = userSessions[0];

  const updateUser = (fn: (u: User) => User) => {
    if (!user) return;
    setStore(s => ({ ...s, users: s.users.map(u => u.id === user.id ? fn(u) : u) }));
  };
  const notify = (message: string) => setToast(message);
  const openWorkout = (w: Workout) => { setSelectedWorkoutId(w.id); setPage("workout"); };
  const newWorkout = () => { setEditingWorkout(null); setShowWorkoutModal(true); };
  const saveWorkout = (name: string, description: string, color: string) => {
    if (!user) return;
    if (editingWorkout) {
      updateUser(u => ({ ...u, workouts: u.workouts.map(w => w.id === editingWorkout.id ? { ...w, name, description, color } : w) }));
      notify("Treino atualizado.");
    } else {
      const w: Workout = { id: uid(), name, description, color, exercises: [], createdAt: today() };
      updateUser(u => ({ ...u, workouts: [...u.workouts, w] }));
      setSelectedWorkoutId(w.id); setPage("workout"); notify("Treino criado.");
    }
    setShowWorkoutModal(false);
  };
  const deleteWorkout = (id: string) => {
    if (!user || !confirm("Excluir este treino? O histórico já registrado será mantido.")) return;
    updateUser(u => ({ ...u, workouts: u.workouts.filter(w => w.id !== id) }));
    setPage("home"); setSelectedWorkoutId(null); notify("Treino removido.");
  };
  const saveExercise = (data: Omit<Exercise, "id">) => {
    if (!user || !workout) return;
    updateUser(u => ({ ...u, workouts: u.workouts.map(w => w.id !== workout.id ? w : {
      ...w, exercises: editingExercise ? w.exercises.map(e => e.id === editingExercise.id ? { ...data, id: e.id } : e) : [...w.exercises, { ...data, id: uid() }]
    }) }));
    setShowExerciseModal(false); notify(editingExercise ? "Exercício atualizado." : "Exercício adicionado.");
  };
  const deleteExercise = (id: string) => {
    if (!confirm("Remover este exercício do treino?")) return;
    updateUser(u => ({ ...u, workouts: u.workouts.map(w => w.id !== selectedWorkoutId ? w : { ...w, exercises: w.exercises.filter(e => e.id !== id) }) }));
    notify("Exercício removido.");
  };
  const startRun = () => {
    if (!workout) return;
    const initial: typeof runValues = {};
    workout.exercises.forEach(e => initial[e.id] = { reps: e.reps, load: String(e.load), notes: "" });
    setRunValues(initial); setSessionDate(today()); setRunStarted(Date.now()); setPage("run");
  };
  const finishRun = () => {
    if (!user || !workout) return;
    const session: Session = {
      id: uid(), userId: user.id, workoutId: workout.id, workoutName: workout.name, date: sessionDate,
      duration: runStarted ? Math.max(1, Math.round((Date.now() - runStarted) / 60000)) : 45,
      exercises: workout.exercises.map(e => ({
        exerciseId: e.id, name: e.name, plannedReps: e.reps,
        reps: runValues[e.id]?.reps ?? e.reps, load: Number(runValues[e.id]?.load ?? e.load),
        notes: runValues[e.id]?.notes ?? ""
      }))
    };
    setStore(s => ({ ...s, sessions: [session, ...s.sessions] }));
    setPage("history"); setRunStarted(null); notify("Treino registrado no histórico!");
  };
  const createUser = (name: string) => {
    const u: User = { id: uid(), name, initials: name.trim().split(/\s+/).slice(0,2).map(x => x[0]).join("").toUpperCase(), workouts: [] };
    setStore(s => ({ ...s, users: [...s.users, u] })); setUserId(u.id); setPage("home"); setShowUserModal(false); notify(`Bem-vindo(a), ${name}!`);
  };

  if (!userId || !user) {
    return <div className="welcome-screen"><div className="welcome-glow" /><div className="welcome-wrap">
      <Brand />
      <div className="welcome-copy"><span className="eyebrow"><Sparkles size={14}/> SEU ESPAÇO DE EVOLUÇÃO</span><h1>Treino feito.<br/><em>Evolução registrada.</em></h1><p>Organize sua rotina, acompanhe sua força e veja sua consistência ganhar forma.</p></div>
      <div className="user-picker">
        <div className="section-heading"><div><h2>Quem vai treinar?</h2><p>Escolha seu perfil para continuar</p></div><span className="count-pill">{store.users.length} perfis</span></div>
        <div className="user-grid">
          {store.users.map(u => <button className="user-card" key={u.id} onClick={() => { setUserId(u.id); setPage("home"); }}>
            <span className="avatar avatar-large">{u.initials}</span><span className="user-card-name">{u.name}</span><span className="user-card-meta">{u.workouts.length} {u.workouts.length === 1 ? "treino" : "treinos"}</span><ArrowRight size={17} className="user-arrow"/>
          </button>)}
          <button className="user-card add-user-card" onClick={() => setShowUserModal(true)}><span className="add-avatar"><Plus size={24}/></span><span className="user-card-name">Novo perfil</span><span className="user-card-meta">Começar do zero</span><ArrowRight size={17} className="user-arrow"/></button>
        </div>
      </div>
      <div className="welcome-foot"><span>FITTRACK <i>•</i> VERSÃO DEMO</span><span>Seus dados ficam neste navegador</span></div>
    </div>{showUserModal && <UserModal onClose={() => setShowUserModal(false)} onSave={createUser}/ >}{toast && <Toast message={toast}/>}</div>;
  }

  const nav = <><button className={cx("nav-item", page === "home" && "active")} onClick={() => { setPage("home"); setMobileNav(false); }}><House size={18}/> Visão geral</button><button className={cx("nav-item", page === "history" && "active")} onClick={() => { setPage("history"); setMobileNav(false); }}><History size={18}/> Histórico</button></>;
  return <div className="app-shell">
    <aside className={cx("sidebar", mobileNav && "sidebar-open")}><Brand/><div className="workspace-label">ESPAÇO DE TREINO</div><div className="side-user"><span className="avatar">{user.initials}</span><span><b>{user.name}</b><small>Perfil pessoal</small></span><button title="Trocar usuário" className="icon-button tiny" onClick={() => { setUserId(null); setPage("home"); }}><LogOut size={16}/></button></div><nav>{nav}</nav><div className="sidebar-bottom"><div className="tip-card"><div className="tip-icon"><Zap size={17}/></div><b>Pequenos passos.</b><p>A consistência é o que transforma esforço em resultado.</p></div><button className="nav-item muted" onClick={() => { setUserId(null); setPage("home"); }}><Users size={17}/> Trocar perfil</button><div className="side-footer">FITTRACK <span>•</span> DEMO 1.0</div></div></aside>
    <main className="main-area">
      <header className="topbar"><button className="icon-button mobile-menu" onClick={() => setMobileNav(!mobileNav)}><Menu size={20}/></button><div className="breadcrumb">Workspace <span>/</span> <b>{page === "history" ? "Histórico" : page === "workout" ? workout?.name : page === "run" ? "Registrar treino" : "Visão geral"}</b></div><div className="topbar-right"><span className="today-label"><CalendarDays size={15}/>{fmtDate(today())}</span><button className="avatar avatar-small" title={user.name} onClick={() => setUserId(null)}>{user.initials}</button></div></header>
      <div className="content">
        {page === "home" && <><div className="page-intro"><div><span className="eyebrow">SEU PAINEL</span><h1>Bom treino, {user.name.split(" ")[0]}<span className="wave"> ✦</span></h1><p>Um passo de cada vez. Acompanhe sua rotina e continue evoluindo.</p></div><button className="primary-button" onClick={newWorkout}><Plus size={18}/> Criar treino</button></div>
          <div className="stats-grid"><Stat icon={<Dumbbell/>} label="Treinos criados" value={String(user.workouts.length).padStart(2,"0")} detail="Na sua rotina" tone="lavender"/><Stat icon={<Activity/>} label="Exercícios" value={String(totalExercises).padStart(2,"0")} detail="Em todos os treinos" tone="mint"/><Stat icon={<Target/>} label="Sessões concluídas" value={String(totalSessions).padStart(2,"0")} detail="No histórico" tone="peach"/><Stat icon={<TrendingUp/>} label="Último treino" value={lastSession ? fmtDate(lastSession.date).split(" de ")[0] : "—"} detail={lastSession?.workoutName ?? "Comece hoje"} tone="sky"/></div>
          <div className="section-heading workout-heading"><div><h2>Sua rotina</h2><p>Escolha um treino para ver os exercícios ou iniciar uma sessão.</p></div><span className="count-pill">{user.workouts.length} treinos</span></div>
          {user.workouts.length === 0 ? <EmptyState icon={<Dumbbell/>} title="Sua rotina começa aqui" text="Crie seu primeiro treino e organize os exercícios que fazem parte dele." action="Criar primeiro treino" onAction={newWorkout}/> :
          <div className="workout-grid">{user.workouts.map((w,i) => <article className="workout-card" key={w.id}><div className="workout-card-top"><span className={`workout-symbol ${w.color}`}><Dumbbell size={19}/></span><button className="icon-button" title="Editar treino" onClick={() => { setEditingWorkout(w); setShowWorkoutModal(true); }}><Pencil size={16}/></button></div><div className="workout-card-body"><span className="workout-index">TREINO {String(i+1).padStart(2,"0")}</span><h3>{w.name}</h3><p>{w.description || "Sem descrição"}</p><div className="workout-meta"><span><Dumbbell size={14}/>{w.exercises.length} exercícios</span><span><Clock3 size={14}/>{Math.max(20,w.exercises.length*12)} min</span></div></div><div className="workout-card-bottom"><button className="text-button" onClick={() => openWorkout(w)}>Ver detalhes <ArrowRight size={16}/></button><button className="icon-button danger-hover" title="Excluir treino" onClick={() => deleteWorkout(w.id)}><Trash2 size={16}/></button></div></article>)}</div>}
          <div className="bottom-note"><div className="note-mark"><Sparkles size={17}/></div><div><b>Seu progresso é construído treino após treino.</b><p>Registre suas sessões para acompanhar sua evolução ao longo do tempo.</p></div><button className="text-button" onClick={() => setPage("history")}>Ver histórico <ArrowRight size={15}/></button></div>
        </>}

        {page === "workout" && workout && <><button className="back-link" onClick={() => setPage("home")}><ArrowLeft size={16}/> Voltar para meus treinos</button><div className="page-intro detail-intro"><div><span className="eyebrow">DETALHES DO TREINO</span><h1>{workout.name}</h1><p>{workout.description || "Organize os exercícios desta rotina."}</p></div><div className="intro-actions"><button className="secondary-button" onClick={() => { setEditingWorkout(workout); setShowWorkoutModal(true); }}><Pencil size={16}/> Editar</button><button className="primary-button" onClick={startRun} disabled={!workout.exercises.length}><Zap size={17}/> Iniciar treino</button></div></div><div className="detail-summary"><div><span>EXERCÍCIOS</span><b>{workout.exercises.length}</b></div><div><span>DURAÇÃO ESTIMADA</span><b>{Math.max(20,workout.exercises.length*12)} min</b></div><div><span>CRIADO EM</span><b>{fmtDate(workout.createdAt)}</b></div></div><div className="section-heading"><div><h2>Lista de exercícios</h2><p>Configure carga, repetições e orientações de cada exercício.</p></div><button className="primary-button" onClick={() => { setEditingExercise(null); setShowExerciseModal(true); }}><Plus size={17}/> Adicionar exercício</button></div>
          {workout.exercises.length === 0 ? <EmptyState icon={<Activity/>} title="Nenhum exercício por aqui" text="Adicione os exercícios que fazem parte deste treino." action="Adicionar exercício" onAction={() => setShowExerciseModal(true)}/> :
          <div className="exercise-list">{workout.exercises.map((e,i) => <article className="exercise-row" key={e.id}><div className="exercise-number">{String(i+1).padStart(2,"0")}</div><div className="exercise-main"><h3>{e.name}</h3><div className="exercise-tags"><span>{e.reps} reps</span><span>{e.load} kg</span><span className={`difficulty d${e.difficulty}`}>{difficultyLabels[e.difficulty-1]}</span></div>{e.notes && <p className="exercise-note">{e.notes}</p>}</div><div className="exercise-actions"><button className="icon-button" title="Editar exercício" onClick={() => { setEditingExercise(e); setShowExerciseModal(true); }}><Pencil size={16}/></button><button className="icon-button danger-hover" title="Remover exercício" onClick={() => deleteExercise(e.id)}><Trash2 size={16}/></button></div></article>)}</div>}
          <div className="delete-workout-line"><button className="text-button danger-text" onClick={() => deleteWorkout(workout.id)}><Trash2 size={15}/> Excluir este treino</button></div>
        </>}

        {page === "run" && workout && <><button className="back-link" onClick={() => setPage("workout")}><ArrowLeft size={16}/> Voltar aos detalhes</button><div className="page-intro"><div><span className="eyebrow">SESSÃO DE TREINO</span><h1>Hora de executar.</h1><p>{workout.name} · Registre o que você realmente realizou.</p></div><div className="run-date"><label>Data da execução</label><input type="date" value={sessionDate} onChange={e => setSessionDate(e.target.value)}/></div></div><div className="run-callout"><Zap size={18}/><span>Os valores começam preenchidos com seu planejamento. Ajuste-os conforme o treino acontecer.</span></div><div className="run-list">{workout.exercises.map((e,i) => <div className="run-card" key={e.id}><div className="run-card-heading"><span className="exercise-number">{String(i+1).padStart(2,"0")}</span><div><h3>{e.name}</h3><small>Planejado: {e.reps} · {e.load} kg</small></div></div><div className="run-fields"><label>Repetições realizadas<input value={runValues[e.id]?.reps ?? e.reps} onChange={ev => setRunValues(v => ({...v,[e.id]:{...v[e.id],reps:ev.target.value}}))} placeholder="Ex.: 10 / 10 / 8"/></label><label>Carga (kg)<input type="number" min="0" step="0.5" value={runValues[e.id]?.load ?? e.load} onChange={ev => setRunValues(v => ({...v,[e.id]:{...v[e.id],load:ev.target.value}}))}/></label><label className="run-notes">Notas da sessão<input value={runValues[e.id]?.notes ?? ""} onChange={ev => setRunValues(v => ({...v,[e.id]:{...v[e.id],notes:ev.target.value}}))} placeholder="Como foi? Alguma observação?"/></label></div></div>)}</div><div className="run-footer"><span><Check size={16}/> Você pode revisar antes de salvar.</span><button className="primary-button" onClick={finishRun}><Check size={17}/> Finalizar e salvar sessão</button></div></>}

        {page === "history" && <><div className="page-intro"><div><span className="eyebrow">CONSISTÊNCIA EM FOCO</span><h1>Seu histórico</h1><p>Cada sessão conta. Veja o que você já conquistou.</p></div><div className="history-total"><b>{totalSessions}</b><span>sessões registradas</span></div></div><div className="history-highlight"><div className="highlight-icon"><TrendingUp size={21}/></div><div><span>VOLUME DE REGISTROS</span><b>{userSessions.reduce((n,s) => n + s.exercises.length, 0)} exercícios realizados</b><small>Somando todas as sessões deste perfil</small></div></div><div className="section-heading"><div><h2>Sessões anteriores</h2><p>Abra uma sessão para ver os detalhes registrados.</p></div></div>
          {userSessions.length === 0 ? <EmptyState icon={<History/>} title="Seu histórico está vazio" text="Depois de concluir seu primeiro treino, ele aparecerá aqui."/> :
          <div className="history-list">{userSessions.map(s => <button className="history-card" key={s.id} onClick={() => setSessionDetail(s)}><div className="history-date"><b>{new Date(s.date+"T12:00:00").getDate()}</b><span>{new Date(s.date+"T12:00:00").toLocaleDateString("pt-BR",{month:"short"})}</span></div><div className="history-info"><h3>{s.workoutName}</h3><p>{s.exercises.length} exercícios <i>·</i> {s.duration} min</p><div className="history-exercise-preview">{s.exercises.slice(0,3).map(e => e.name).join(" · ")}{s.exercises.length > 3 ? " +" : ""}</div></div><div className="history-right"><span className="history-complete"><Check size={13}/> Concluído</span><ArrowRight size={18}/></div></button>)}</div>}
        </>}
      </div>
    </main>
    {mobileNav && <div className="mobile-scrim" onClick={() => setMobileNav(false)}/>}
    {showUserModal && <UserModal onClose={() => setShowUserModal(false)} onSave={createUser}/>}
    {showWorkoutModal && <WorkoutModal workout={editingWorkout} onClose={() => setShowWorkoutModal(false)} onSave={saveWorkout}/>}
    {showExerciseModal && <ExerciseModal exercise={editingExercise} onClose={() => setShowExerciseModal(false)} onSave={saveExercise}/>}
    {sessionDetail && <SessionModal session={sessionDetail} onClose={() => setSessionDetail(null)}/>}
    {toast && <Toast message={toast}/>}
  </div>;
}

function Brand() { return <div className="brand"><span className="brand-mark"><Activity size={20}/></span><span>fit<span>track</span><small>YOUR TRAINING SPACE</small></span></div>; }
function Stat({icon,label,value,detail,tone}:{icon:React.ReactNode;label:string;value:string;detail:string;tone:string}) { return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-detail">{detail}</div></div>; }
function EmptyState({icon,title,text,action,onAction}:{icon:React.ReactNode;title:string;text:string;action?:string;onAction?:()=>void}) { return <div className="empty-state"><div className="empty-icon">{icon}</div><h3>{title}</h3><p>{text}</p>{action && onAction && <button className="primary-button" onClick={onAction}><Plus size={16}/>{action}</button>}</div>; }
function Toast({message}:{message:string}) { return <div className="toast"><span><Check size={16}/></span>{message}</div>; }

function ModalShell({title,subtitle,onClose,children,wide=false}:{title:string;subtitle:string;onClose:()=>void;children:React.ReactNode;wide?:boolean}) {
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><div className={cx("modal",wide && "modal-wide")}><div className="modal-header"><div><h2>{title}</h2><p>{subtitle}</p></div><button className="icon-button" onClick={onClose}><X size={19}/></button></div>{children}</div></div>;
}
function UserModal({onClose,onSave}:{onClose:()=>void;onSave:(name:string)=>void}) {
  const [name,setName] = useState("");
  return <ModalShell title="Criar perfil" subtitle="Cada perfil tem seus próprios treinos e histórico." onClose={onClose}><form onSubmit={e => {e.preventDefault(); if(name.trim()) onSave(name.trim());}}><label className="form-label">Nome do usuário<input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="Ex.: Alex" maxLength={32}/></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button className="primary-button" disabled={!name.trim()}><Plus size={16}/> Criar perfil</button></div></form></ModalShell>;
}
function WorkoutModal({workout,onClose,onSave}:{workout:Workout|null;onClose:()=>void;onSave:(name:string,description:string,color:string)=>void}) {
  const [name,setName] = useState(workout?.name ?? "");
  const [description,setDescription] = useState(workout?.description ?? "");
  const [color,setColor] = useState(workout?.color ?? "violet");
  return <ModalShell title={workout ? "Editar treino" : "Novo treino"} subtitle="Dê um nome e uma identidade para esta rotina." onClose={onClose}><form onSubmit={e=>{e.preventDefault();if(name.trim())onSave(name.trim(),description.trim(),color);}}><label className="form-label">Nome do treino<input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="Ex.: Treino A" maxLength={40}/></label><label className="form-label">Descrição <span className="optional">opcional</span><input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Ex.: Peito, ombro e tríceps" maxLength={80}/></label><div className="form-label">Cor de identificação<div className="color-picker">{colors.map(c=><button type="button" key={c} className={cx("color-dot",c,color===c&&"selected")} onClick={()=>setColor(c)} aria-label={c}>{color===c&&<Check size={15}/>}</button>)}</div></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button className="primary-button" disabled={!name.trim()}><Check size={16}/> Salvar treino</button></div></form></ModalShell>;
}
function ExerciseModal({exercise,onClose,onSave}:{exercise:Exercise|null;onClose:()=>void;onSave:(data:Omit<Exercise,"id">)=>void}) {
  const [name,setName] = useState(exercise?.name ?? "");
  const [reps,setReps] = useState(exercise?.reps ?? "3 × 12");
  const [load,setLoad] = useState(String(exercise?.load ?? 0));
  const [notes,setNotes] = useState(exercise?.notes ?? "");
  const [difficulty,setDifficulty] = useState<Difficulty>(exercise?.difficulty ?? 3);
  return <ModalShell title={exercise ? "Editar exercício" : "Adicionar exercício"} subtitle="Defina os parâmetros e as orientações." onClose={onClose} wide><form onSubmit={e=>{e.preventDefault();if(name.trim())onSave({name:name.trim(),reps:reps.trim(),load:Number(load)||0,notes:notes.trim(),difficulty});}}><label className="form-label">Exercício<input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="Ex.: Supino reto com barra" maxLength={70}/></label><div className="form-grid"><label className="form-label">Séries × repetições<input value={reps} onChange={e=>setReps(e.target.value)} placeholder="Ex.: 3 × 12"/></label><label className="form-label">Carga inicial (kg)<input type="number" min="0" step="0.5" value={load} onChange={e=>setLoad(e.target.value)}/></label></div><div className="form-label">Dificuldade<div className="difficulty-picker">{difficultyLabels.map((label,i)=><button type="button" key={label} className={cx("difficulty-option",difficulty===i+1&&"selected",`d${i+1}`)} onClick={()=>setDifficulty((i+1) as Difficulty)}><span>{i+1}</span><small>{label}</small></button>)}</div></div><label className="form-label">Notas <span className="optional">opcional</span><textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Técnica, amplitude, equipamento ou lembretes..." rows={3}/></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button className="primary-button" disabled={!name.trim()||!reps.trim()}><Check size={16}/> Salvar exercício</button></div></form></ModalShell>;
}
function SessionModal({session,onClose}:{session:Session;onClose:()=>void}) {
  return <ModalShell title={session.workoutName} subtitle={`Sessão realizada em ${fmtDate(session.date)} · ${session.duration} min`} onClose={onClose} wide><div className="session-detail-list">{session.exercises.map((e,i)=><div className="session-detail-row" key={e.exerciseId+i}><div><b>{e.name}</b><small>Planejado: {e.plannedReps}</small>{e.notes&&<small>{e.notes}</small>}</div><div><strong>{e.load} kg</strong><small>{e.reps} reps</small></div></div>)}</div><div className="modal-actions"><button className="primary-button" onClick={onClose}>Fechar</button></div></ModalShell>;
}