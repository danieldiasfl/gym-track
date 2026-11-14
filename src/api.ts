import type { Difficulty, Exercise, ExerciseLog, Store } from './types';
async function req<T>(url:string, init?:RequestInit):Promise<T>{
 const r=await fetch(url,{...init,headers:{'content-type':'application/json',...(init?.headers||{})}});
 const d=await r.json().catch(()=>null);
 if(!r.ok) throw new Error(d?.error || `Erro ${r.status} na API`);
 return d as T;
}
const post=(url:string,body:unknown)=>req(url,{method:'POST',body:JSON.stringify(body)});
export const api={
 state:()=>req<Store>('/api/state'),
 createUser:(v:{id:string;name:string})=>post('/api/users',v),
 createWorkout:(v:{id:string;userId:string;name:string;description:string;color:string;createdAt:string})=>post('/api/workouts',v),
 updateWorkout:(id:string,v:{name:string;description:string;color:string})=>req(`/api/workouts/${id}`,{method:'PATCH',body:JSON.stringify(v)}),
 deleteWorkout:(id:string)=>req(`/api/workouts/${id}`,{method:'DELETE'}),
 createExercise:(v:Omit<Exercise,'position'> & {workoutId:string})=>post('/api/exercises',v),
 updateExercise:(id:string,v:Omit<Exercise,'id'|'position'>)=>req(`/api/exercises/${id}`,{method:'PATCH',body:JSON.stringify(v)}),
 deleteExercise:(id:string)=>req(`/api/exercises/${id}`,{method:'DELETE'}),
 createStretch:(v:{id:string;workoutId:string;name:string;phase:'before'|'after'})=>post('/api/stretches',v),
 deleteStretch:(id:string)=>req(`/api/stretches/${id}`,{method:'DELETE'}),
 reorder:(kind:'workouts'|'exercises',parentId:string,ids:string[])=>post('/api/reorder',{kind,parentId,ids}),
 log:(v:{id:string;userId:string;workoutId:string;exerciseId:string;date:string;reps:string;load:number;effort:Difficulty;notes:string})=>post('/api/logs',v),
};
