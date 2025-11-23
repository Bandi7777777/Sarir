'use client';

import { useEffect, useMemo, useState } from "react";

import { useReminders } from "./RemindersContext";

type DayCell = { date:Date; inMonth:boolean; iso:string };
const toIsoYmd = (d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const toEnDigits=(s:string)=>s.replace(/[۰-۹٠-٩]/g,d=>({"۰":"0","۱":"1","۲":"2","۳":"3","۴":"4","۵":"5","۶":"6","۷":"7","۸":"8","۹":"9","٠":"0","١":"1","٢":"2","٣":"3","٤":"4","٥":"5","٦":"6","٧":"7","٨":"8","٩":"9"} as any)[d]);

function jalaliDay(d:Date){ try{ return new Intl.DateTimeFormat('fa-IR-u-nu-latn',{calendar:'persian',day:'2-digit'}).format(d);}catch{return String(d.getDate());}}
function jalaliMonthHeader(d:Date){ try{ return new Intl.DateTimeFormat('fa-IR-u-nu-latn',{calendar:'persian',year:'numeric',month:'long'}).format(d);}catch{ return d.toLocaleDateString('fa-IR',{year:'numeric',month:'long'});}}
function jalaliYMD(d:Date){
  const y = toEnDigits(new Intl.DateTimeFormat('fa-IR-u-nu-latn',{calendar:'persian',year:'numeric'}).format(d));
  const m = toEnDigits(new Intl.DateTimeFormat('fa-IR-u-nu-latn',{calendar:'persian',month:'2-digit'}).format(d));
  const dd= toEnDigits(new Intl.DateTimeFormat('fa-IR-u-nu-latn',{calendar:'persian',day:'2-digit'}).format(d));
  return `${y}-${m}-${dd}`;
}
function buildGrid(view:Date){
  const first=new Date(view.getFullYear(),view.getMonth(),1);
  const last =new Date(view.getFullYear(),view.getMonth()+1,0);
  const start=(first.getDay()+1)%7; // شنبه=0
  const cells:DayCell[]=[];
  for(let i=0;i<start;i++){ const d=new Date(first); d.setDate(first.getDate()-(start-i)); cells.push({date:d,inMonth:false,iso:toIsoYmd(d)}); }
  for(let i=1;i<=last.getDate();i++){ const d=new Date(view.getFullYear(),view.getMonth(),i); cells.push({date:d,inMonth:true,iso:toIsoYmd(d)}); }
  while(cells.length%7!==0){ const d=new Date(cells[cells.length-1].date); d.setDate(d.getDate()+1); cells.push({date:d,inMonth:false,iso:toIsoYmd(d)}); }
  return cells;
}

const IMPORTANT_KEYWORDS = ["نوروز","روز طبیعت","روز جمهوری اسلامی","رحلت امام خمینی","قیام ۱۵ خرداد","آغاز مهر","بازگشایی مدارس","عید","تاسوعا","عاشورا","ولادت","شهادت","فطر","قربان"] as const;
const HOLIDAYS_FALLBACK:Record<string,string>={
  "1404-01-01":"نوروز","1404-01-02":"تعطیلات نوروز","1404-01-03":"تعطیلات نوروز","1404-01-04":"تعطیلات نوروز",
  "1404-01-12":"روز جمهوری اسلامی","1404-01-13":"روز طبیعت",
  "1404-03-14":"رحلت امام خمینی","1404-03-15":"قیام ۱۵ خرداد",
  "1404-07-01":"آغاز مهر/بازگشایی مدارس",
  "1405-01-01":"نوروز","1405-01-02":"تعطیلات نوروز","1405-01-03":"تعطیلات نوروز","1405-01-04":"تعطیلات نوروز",
  "1405-01-12":"روز جمهوری اسلامی","1405-01-13":"روز طبیعت",
  "1405-03-14":"رحلت امام خمینی","1405-03-15":"قیام ۱۵ خرداد",
  "1405-07-01":"آغاز مهر/بازگشایی مدارس",
};
const filterImportant=(m:Record<string,string>)=>Object.fromEntries(Object.entries(m).filter(([_,v])=>IMPORTANT_KEYWORDS.some(kw=>v.includes(kw))));

export default function Calendar(){
  const today = new Date();
  const [view,setView] = useState<Date>(new Date(today.getFullYear(),today.getMonth(),1));
  const [selectedIso,setSelectedIso]=useState<string>(toIsoYmd(today));
  const [showImportant,setShowImportant]=useState(true);
  const [importantMap,setImportantMap]=useState<Record<string,string>>(()=>filterImportant(HOLIDAYS_FALLBACK));
  const { addReminder } = useReminders();

  useEffect(()=>{ let on=true;(async()=>{
    try{
      const jy = toEnDigits(new Intl.DateTimeFormat('fa-IR-u-nu-latn',{calendar:'persian',year:'numeric'}).format(view));
      const jm = toEnDigits(new Intl.DateTimeFormat('fa-IR-u-nu-latn',{calendar:'persian',month:'2-digit'}).format(view));
      const r = await fetch(`/api/holidays?y=${jy}&m=${jm}`, { cache:"no-store" });
      if(r.ok){ const ext=await r.json(); const imp=filterImportant(ext||{}); if(on) setImportantMap(p=>({...p,...imp})); }
    }catch{}
  })(); return ()=>{on=false}; },[view]);

  const grid   = useMemo(()=>buildGrid(view),[view]);
  const header = useMemo(()=>jalaliMonthHeader(view),[view]);
  const weekdays = ["ش","ی","د","س","چ","پ","ج"];

  const addImpReminder = (d:Date) => {
    const key = jalaliYMD(d);
    const title = importantMap[key]; if(!title) return;
    addReminder({ title, date: toIsoYmd(d), time:"09:00", note:"مناسبت مهم", important:true });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xl font-bold">{header}</div>
        <div className="flex items-center gap-3">
          <label className="text-xs flex items-center gap-2">
            <input type="checkbox" checked={showImportant} onChange={e=>setShowImportant(e.target.checked)} />
            فقط نشان‌دادن «نشانِ مناسبت‌های مهم»
          </label>
          <button className="rounded-lg border border-white/15 bg-white/5 px-3 py-1 text-sm hover:bg-white/10" onClick={()=>setView(v=>new Date(v.getFullYear(),v.getMonth()-1,1))}>ماه قبل</button>
          <button className="rounded-lg border border-white/15 bg-white/5 px-3 py-1 text-sm hover:bg-white/10" onClick={()=>setView(new Date(today.getFullYear(),today.getMonth(),1))}>امروز</button>
          <button className="rounded-lg border border-white/15 bg-white/5 px-3 py-1 text-sm hover:bg-white/10" onClick={()=>setView(v=>new Date(v.getFullYear(),v.getMonth()+1,1))}>ماه بعد</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm opacity-80">
        {weekdays.map((w,i)=>(<div key={i} className="py-1">{w}</div>))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {grid.map((c,idx)=>{
          const iso = c.iso;
          const isSelected = iso===selectedIso;
          const isToday = iso===toIsoYmd(today);
          const keyJ = jalaliYMD(c.date);
          const impTitle = importantMap[keyJ];
          const isImportant = !!impTitle;

          return (
            <div
              key={idx}
              role="button"
              tabIndex={0}
              onClick={()=>setSelectedIso(iso)}
              onKeyDown={(e)=>{ if(e.key==="Enter"||e.key===" ") setSelectedIso(iso); }}
              className={[
                "relative aspect-square rounded-xl border text-sm transition text-left",
                c.inMonth? "border-white/10 bg-white/5 hover:bg-white/10" : "border-transparent bg-white/2 opacity-60",
                isToday? "ring-2 ring-emerald-500/60" : "",
                isSelected? "outline outline-2 outline-white/50" : "",
                isImportant? "shadow-[0_0_0_2px_rgba(244,63,94,0.35)_inset]" : ""
              ].join(" ")}
              title={isImportant?impTitle:undefined}
            >
              <div className="flex h-full flex-col p-2">
                <div className="text-right font-bold">{jalaliDay(c.date)}</div>
                {isImportant && showImportant && (
                  <div className="mt-auto text-[10px] opacity-90 inline-flex items-center gap-1 rounded-md border border-rose-400/40 bg-rose-500/20 px-2 py-[2px]">
                    <span className="truncate">{impTitle}</span>
                    <button
                      type="button"
                      className="text-[10px] underline decoration-dotted"
                      onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); addImpReminder(c.date); }}
                    >
                      یادآوری
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
