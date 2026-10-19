"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { api } from "@/lib/api";
import type { MockSummary } from "@/lib/mock";
import { ClipboardCheck, CheckCircle2, PlayCircle, Sparkles } from "lucide-react";

export default function MockListPage() {
  const [mocks, setMocks] = useState<MockSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/mock/").then((r) => setMocks(r.data)).catch(() => setMocks([])).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Mock Tests</h2>
        <p className="text-gray-600 text-lg">
          A full exam sitting — Listening, Reading and Writing in one go, under real timing.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : mocks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No mock tests yet</h3>
          <p className="text-gray-500">Check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mocks.map((m) => {
            const s = m.my_status;
            const state = s.completed ? "done" : s.started ? "progress" : "new";
            return (
              <Link
                key={m.id}
                href={`/mock/${m.id}`}
                className="group bg-white rounded-2xl border border-gray-200 hover:border-[#1a3a5f] hover:shadow-lg transition-all p-6 flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1a3a5f] text-[#ffffff] flex items-center justify-center font-bold text-lg">
                    {m.number}
                  </div>
                  {state === "done" && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                    </span>
                  )}
                  {state === "progress" && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                      <PlayCircle className="w-3.5 h-3.5" /> In progress
                    </span>
                  )}
                  {state === "new" && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                      <Sparkles className="w-3.5 h-3.5" /> New
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Mock {m.number}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {m.sections.map((x) => x[0].toUpperCase() + x.slice(1)).join(" · ") || "No sections yet"}
                </p>
                <div className="mt-auto text-sm font-semibold text-gray-900 group-hover:underline">
                  {state === "done" ? "Results & retake →" : state === "progress" ? "Continue →" : "Open →"}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
