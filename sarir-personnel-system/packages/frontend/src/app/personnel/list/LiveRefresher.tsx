"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { subscribeEmployeeEvents } from "@/lib/bus";

export default function LiveRefresher() {
  const router = useRouter();
  useEffect(() => {
    const unsub = subscribeEmployeeEvents((e) => {
      if (e.type === "employee.updated" || e.type === "employee.deleted") {
        router.refresh();
      }
    });
    return () => { unsub(); };
  }, [router]);
  return null;
}
