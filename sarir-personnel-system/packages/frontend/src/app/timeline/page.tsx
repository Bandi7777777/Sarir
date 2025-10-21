"use client";

import { Timeline, TimelineItem } from "@/components/external/Timeline";

export default function TimelinePage() {
  const items: TimelineItem[] = [
    { id: 1, title: "Employee Onboarded", subtitle: "1404/07/15", description: "Contract signed", dotColor: "#07657E" },
    { id: 2, title: "Medical Check", subtitle: "1404/07/20", description: "All results normal", dotColor: "#F2991F" },
    { id: 3, title: "Safety Training", subtitle: "1404/08/02", description: "Completed Level 1", dotColor: "#1FB4C8" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#07657E] mb-4">Personnel Events Timeline</h1>
      <Timeline items={items} />
    </div>
  );
}
