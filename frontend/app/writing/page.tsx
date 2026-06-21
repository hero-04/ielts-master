import DashboardLayout from "@/components/DashboardLayout";
import { BarChart2, PenTool, ScrollText } from "lucide-react";
import Link from "next/link";

const sections = [
  {
    title: "Task 1 Practice",
    description: "Graphs, charts, diagrams and letters from Cambridge IELTS books.",
    href: "/writing/task1",
    icon: BarChart2,
    bg: "bg-amber-50",
    fg: "text-amber-600",
  },
  {
    title: "Task 2 — Essays",
    description: "Opinion, discussion, problem-solution and advantage/disadvantage essays.",
    href: "/writing/task2",
    icon: PenTool,
    bg: "bg-orange-50",
    fg: "text-orange-600",
  },
  {
    title: "My Writings",
    description: "Review your previously submitted essays and track your progress.",
    href: "/writing/my-writings",
    icon: ScrollText,
    bg: "bg-yellow-50",
    fg: "text-yellow-600",
  },
];

export default function WritingPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Writing Practice</h2>
        <p className="text-gray-600 text-lg">Choose a task type to get started.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {sections.map((s) => (
          <Link key={s.href} href={s.href}>
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md hover:border-amber-200 transition-all cursor-pointer h-full flex flex-col gap-4">
              <div className={`w-14 h-14 ${s.bg} rounded-xl flex items-center justify-center`}>
                <s.icon className={`w-7 h-7 ${s.fg}`} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}
