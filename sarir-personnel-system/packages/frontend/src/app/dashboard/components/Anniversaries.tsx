'use client';
import { useMemo } from "react";
type Employee = { first_name?:string; last_name?:string; hire_date?:string; created_at?:string };

function nextAnniversary(src?:string){
  if(!src) return null;
  const t = Date.parse(src); if(!Number.isFinite(t)) return null;
  const start = new Date(t); const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  let ann = new Date(start); ann.setFullYear(start.getFullYear()+years);
  if (ann < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    years += 1; ann = new Date(start); ann.setFullYear(start.getFullYear()+years);
  }
  const daysLeft = Math.ceil((ann.getTime()-now.getTime())/(1000*60*60*24));
  const milestone = [1,3,5,10,15,20,25,30].includes(years) ? years : undefined;
  return { date:ann, daysLeft, years, milestone };
}

export default function Anniversaries({ employees }:{ employees:Employee[] }){
  const rows = useMemo(()=>{
    const arr:any[]=[];
    for(const e of employees||[]){
      const a = nextAnniversary(e.hire_date||e.created_at);
      if(a) arr.push({ name: `${e.first_name||""} ${e.last_name||""}`.trim(), ...a });
    }
    return arr.sort((a,b)=>a.daysLeft-b.daysLeft).slice(0,8);
  },[employees]);

  return (
    <div className="grid gap-2">
      {rows.length===0 ? (
        <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm opacity-70">داده‌ای موجود نیست.</div>
      ) : rows.map((x,i)=>(
        <div key={i} className="rounded-lg border border-white/10 bg-white/5 p-3 flex items-center justify-between">
          <div className="min-w-0">
            <div className="truncate font-bold">{x.name||"—"}</div>
            <div className="text-xs opacity-75">{x.date.toLocaleDateString("fa-IR")} · سالگرد {x.years} سالگی{x.milestone?` (مایلستون ${x.milestone} سال)`:""}</div>
          </div>
          <div className="text-xs opacity-80">{x.daysLeft} روز دیگر</div>
        </div>
      ))}
    </div>
  );
}
