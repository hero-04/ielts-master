"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { api } from "@/lib/api";
import type { MockSection } from "@/lib/mock";
import { Headphones, BookOpen, PenTool, CheckCircle2, XCircle } from "lucide-react";

interface AnswerRow {
  section: "listening" | "reading";
  part: string;
  order_number: number;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
}

interface Result {
  mock_number: number;
  completed_at: string;
  sections: MockSection[];
  listening_raw: number;
  listening_band: string;
  reading_raw: number;
  reading_band: string;
  task1_text: string;
  task2_text: string;
  task1_words: number;
  task2_words: number;
  writing_band: string | null;
  overall_estimate: number | null;
  answers: AnswerRow[];
}

export default function MockResultPage() {
  const { id } = useParams();
  const mockId = String(id);
  const [r, setR] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<"listening" | "reading" | "writing" | null>(null);

  useEffect(() => {
    api.get(`/mock/${mockId}/result/`).then((x) => setR(x.data)).catch(() => setError("No completed attempt found for this mock."));
  }, [mockId]);

  return (
    <DashboardLayout>
      {error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl">
          {error} <Link href="/mock" className="underline ml-2">Back to Mock Tests</Link>
        </div>
      ) : !r ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <>
          <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">Mock {r.mock_number} — Results</h2>
              <p className="text-gray-500">Completed {new Date(r.completed_at).toLocaleString()}</p>
            </div>
            <Link href="/mock" className="text-sm font-semibold text-gray-700 hover:underline">← All mock tests</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {r.sections.includes("listening") && (
              <Card icon={Headphones} title="Listening" big={r.listening_band} sub={`${r.listening_raw} / 40 correct`} onClick={() => setOpen(open === "listening" ? null : "listening")} />
            )}
            {r.sections.includes("reading") && (
              <Card icon={BookOpen} title="Reading" big={r.reading_band} sub={`${r.reading_raw} / 40 correct`} onClick={() => setOpen(open === "reading" ? null : "reading")} />
            )}
            {r.sections.includes("writing") && (
              <Card icon={PenTool} title="Writing" big={r.writing_band ?? "—"} sub={r.writing_band ? "Marked by teacher" : `${r.task1_words} + ${r.task2_words} words · not marked yet`} onClick={() => setOpen(open === "writing" ? null : "writing")} />
            )}
            <div className="rounded-2xl bg-[#1a3a5f] text-[#ffffff] p-5 flex flex-col">
              <p className="text-xs uppercase tracking-wider text-[#a9c4e4] mb-2">Estimated overall</p>
              <p className="text-4xl font-extrabold">{r.overall_estimate ?? "—"}</p>
              <p className="text-xs text-[#a9c4e4] mt-auto pt-3">Average of the marked sections, rounded to the nearest half band. Speaking is not included.</p>
            </div>
          </div>

          {(open === "listening" || open === "reading") && (() => {
            const rows = r.answers.filter((a) => a.section === open).sort((a, b) => a.order_number - b.order_number);
            const half = Math.ceil(rows.length / 2);
            const cols = [rows.slice(0, half), rows.slice(half)];
            const fmt = (v: string) => v.split(",").map((x) => x.trim()).join(" / ");
            return (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8">
                <div className="px-6 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <span className="font-semibold text-gray-800 capitalize">{open} — answer key</span>
                  <span className="text-sm text-gray-500">
                    {rows.filter((a) => a.is_correct).length} / {rows.length} correct
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x divide-gray-100">
                  {cols.map((col, ci) => (
                    <div key={ci}>
                      {col.map((a) => (
                        <div key={a.order_number} className="flex items-center gap-3 px-6 py-2.5 border-b border-gray-100 text-sm">
                          {a.is_correct
                            ? <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                            : <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                          <span className="w-7 font-mono text-gray-500 shrink-0">{a.order_number}</span>
                          <span className="flex items-center gap-2 min-w-0 flex-wrap">
                            {a.user_answer
                              ? <span className={a.is_correct ? "text-gray-900" : "text-red-600 line-through decoration-red-300"}>{a.user_answer}</span>
                              : <em className="text-gray-400">no answer</em>}
                            {!a.is_correct && (
                              <>
                                <span className="text-gray-400">→</span>
                                <span className="text-green-700 font-medium">{fmt(a.correct_answer)}</span>
                              </>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {open === "writing" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {[["Task 1", r.task1_text, r.task1_words, 150], ["Task 2", r.task2_text, r.task2_words, 250]].map(([t, text, w, min]) => (
                <div key={t as string} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-3 border-b border-gray-200 bg-gray-50 flex justify-between">
                    <span className="font-semibold text-gray-800">{t}</span>
                    <span className={`text-sm font-semibold ${(w as number) < (min as number) ? "text-red-500" : "text-green-600"}`}>{w as number} words</span>
                  </div>
                  <pre className="p-6 whitespace-pre-wrap font-sans text-gray-800 text-sm leading-relaxed max-h-[480px] overflow-y-auto">{(text as string) || "—"}</pre>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}

function Card({ icon: Icon, title, big, sub, onClick }: { icon: any; title: string; big: string; sub: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="text-left rounded-2xl bg-white border border-gray-200 hover:border-gray-900 transition-colors p-5 flex flex-col">
      <div className="flex items-center gap-2 text-gray-600 mb-2"><Icon className="w-4 h-4" /><span className="text-sm font-semibold">{title}</span></div>
      <p className="text-4xl font-extrabold text-gray-900">{big}</p>
      <p className="text-xs text-gray-500 mt-auto pt-3">{sub} · click for details</p>
    </button>
  );
}
