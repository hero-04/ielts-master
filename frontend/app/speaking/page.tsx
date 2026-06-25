"use client";
import DashboardLayout from "@/components/DashboardLayout";
import { Mic, ChevronRight } from "lucide-react";
import Link from "next/link";

const parts = [
  {
    part: 1,
    title: "Part 1 — Introduction & Interview",
    description: "Answer questions about yourself, your home, family, work, studies and interests. Lasts 4–5 minutes.",
    color: "bg-green-500",
    light: "bg-green-50",
    border: "hover:border-green-300",
    href: "/speaking/part/1",
  },
  {
    part: 2,
    title: "Part 2 — Individual Long Turn",
    description: "Speak for 1–2 minutes on a given topic card. You have 1 minute to prepare your notes.",
    color: "bg-teal-500",
    light: "bg-teal-50",
    border: "hover:border-teal-300",
    href: "/speaking/part/2",
  },
  {
    part: 3,
    title: "Part 3 — Two-way Discussion",
    description: "Discuss more abstract ideas and issues linked to the Part 2 topic. Lasts 4–5 minutes.",
    color: "bg-emerald-600",
    light: "bg-emerald-50",
    border: "hover:border-emerald-300",
    href: "/speaking/part/3",
  },
];

export default function SpeakingPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Speaking Practice</h2>
        <p className="text-gray-600 text-lg">Practice all three parts of the IELTS Speaking test with real exam questions. Questions are updated every 3 months.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {parts.map((p) => (
          <Link key={p.part} href={p.href} className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${p.border} hover:shadow-md transition-all flex flex-col p-8 gap-4`}>
            <div className={`w-14 h-14 ${p.color} text-white rounded-xl flex items-center justify-center shadow-md`}>
              <Mic className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{p.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{p.description}</p>
            </div>
            <div className="flex items-center gap-1 text-green-600 font-semibold text-sm">
              Start Practice <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}
