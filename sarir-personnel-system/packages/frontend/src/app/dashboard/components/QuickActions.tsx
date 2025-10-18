'use client';

import Link from "next/link";
import {
  UserPlusIcon, ListBulletIcon, CalendarDaysIcon,
  ArrowUpOnSquareIcon, ChartBarIcon, Cog6ToothIcon, MapPinIcon
} from "@heroicons/react/24/solid";

type Action = { href:string; label:string; Icon:any; subtle?:boolean };
const actions: Action[] = [
  { href:"/personnel/new",        label:"ثبت پرسنل جدید",  Icon:UserPlusIcon },
  { href:"/personnel/list",       label:"فهرست پرسنل",     Icon:ListBulletIcon },
  { href:"/requests/leave/new",   label:"درخواست مرخصی",   Icon:CalendarDaysIcon },
  { href:"/missions/new",         label:"ثبت مأموریت",     Icon:MapPinIcon },
  { href:"/reports",              label:"گزارش‌ها",         Icon:ChartBarIcon },
  { href:"/documents/upload",     label:"آپلود مدارک",      Icon:ArrowUpOnSquareIcon },
  { href:"/admin/settings",       label:"تنظیمات سامانه",   Icon:Cog6ToothIcon, subtle:true },
];

export default function QuickActions(){
  return (
    <div className="grid sm:grid-cols-2 gap-2">
      {actions.map((a,i)=>(
        <Link key={i} href={a.href}
          className={"flex items-center gap-3 rounded-xl border p-3 transition " + (a.subtle ? "border-white/10 bg-white/5 hover:bg-white/10" : "border-white/15 bg-white/8 hover:bg-white/12")}>
          <div className="grid place-items-center rounded-lg border border-white/20 bg-white/10 p-2">
            <a.Icon className="h-5 w-5"/>
          </div>
          <div className="font-medium">{a.label}</div>
        </Link>
      ))}
    </div>
  );
}
