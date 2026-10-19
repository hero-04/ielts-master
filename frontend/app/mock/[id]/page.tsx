"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { SECTION_INFO, type MockSection, type MockSummary } from "@/lib/mock";
import { Headphones, BookOpen, PenTool, Check, Lock, ChevronLeft } from "lucide-react";

const ICONS = { listening: Headphones, reading: BookOpen, writing: PenTool };

export default function MockLobbyPage() {
  const { id } = useParams();
  const mockId = String(id);
  const router = useRouter();
  const { user } = useAuthStore();
  const [mock, setMock] = useState<MockSummary | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await api.get(`/mock/${mockId}/`);
      setMock(r.data);
    } catch {
      setError("This mock test is not available.");
    }
  }, [mockId]);

  useEffect(() => { load(); }, [load]);

  const startSection = async (section: MockSection) => {
    if (!mock) return;
    setBusy(section);
    try {
      if (!mock.my_status.started) await api.post(`/mock/${mockId}/start/`);
      router.push(`/mock/${mockId}/${section}`);
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Could not start this section.");
      setBusy(null);
    }
  };

  const finish = async () => {
    setBusy("finish");
    try {
      await api.post(`/mock/${mockId}/finish/`);
      router.push(`/mock/${mockId}/result`);
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Could not finish the test.");
      setBusy(null);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/mock" className="text-primary hover:underline">← Back to Mock Tests</Link>
        </div>
      </div>
    );
  }
  if (!mock) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const s = mock.my_status;
  const allDone = s.sections.length > 0 && s.next === null;

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Top bar — Inspera-style */}
      <header className="h-14 border-b border-gray-200 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-xl tracking-tight">IELTS</span>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-600">Mock {mock.number}</span>
        </div>
        <div className="text-sm text-gray-600">{user?.full_name || user?.email}</div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        <Link href="/mock" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-8">
          <ChevronLeft className="w-4 h-4" /> All mock tests
        </Link>

        <h1 className="text-3xl font-bold mb-2">Your tests</h1>
        <p className="text-gray-600 mb-10 max-w-2xl">
          Take the tests in order. The next test unlocks when you submit the previous one.
          Once you start a test its clock runs, and you cannot return to it after submitting.
          {!s.completed && " You can sit this mock only once."}
        </p>

        {s.sections.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-2xl p-12 text-center text-gray-500">
            This mock has no sections yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {s.sections.map((section, i) => {
              const Icon = ICONS[section];
              const info = SECTION_INFO[section];
              const done = s.done.includes(section);
              const isNext = s.next === section;
              const inProgress = s.in_progress === section;
              const locked = !done && !isNext;
              return (
                <div
                  key={section}
                  className={`relative rounded-2xl border-2 p-6 min-h-[300px] flex flex-col ${
                    done ? "border-green-200 bg-green-50/40" : isNext ? "border-[#1a3a5f] bg-white" : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">{info.time}</p>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${done ? "bg-green-600 text-white" : "bg-[#1a3a5f] text-white"}`}>
                      {done ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Test {i + 1} of {s.sections.length}</p>
                      <h2 className="text-xl font-bold">{info.title}</h2>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{info.note}</p>

                  <div className="mt-auto pt-6 flex items-end justify-between">
                    <span className="text-sm">
                      {done && <span className="text-green-700 font-semibold">Submitted</span>}
                      {inProgress && <span className="text-amber-700 font-semibold">In progress — clock is running</span>}
                      {locked && (
                        <span className="inline-flex items-center gap-1 text-gray-400"><Lock className="w-3.5 h-3.5" /> Locked</span>
                      )}
                    </span>
                    {!done && (
                      <button
                        onClick={() => startSection(section)}
                        disabled={locked || busy !== null}
                        className="px-6 py-2.5 rounded bg-[#1a3a5f] text-white font-bold text-sm hover:bg-[#244b78] transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                      >
                        {busy === section ? "Opening…" : inProgress ? "Resume" : "Start"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {allDone && (
          <div className="mt-10 flex flex-col items-center gap-3">
            <p className="text-gray-600 text-sm">All tests submitted.</p>
            <button
              onClick={s.completed ? () => router.push(`/mock/${mockId}/result`) : finish}
              disabled={busy === "finish"}
              className="px-8 py-3 rounded bg-[#1a3a5f] text-white font-bold hover:bg-[#244b78] transition-colors disabled:opacity-60"
            >
              {s.completed ? "See results" : busy === "finish" ? "Finishing…" : "Finish the test"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
