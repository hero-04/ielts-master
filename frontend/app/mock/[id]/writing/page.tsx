"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Clock, CheckSquare, Settings } from "lucide-react";

interface WritingSection {
  mock_number: number;
  seconds_left: number;
  task1_prompt_text: string;
  task1_prompt_image: string;
  task2_prompt_text: string;
  task1_text: string;
  task2_text: string;
}

const countWords = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;

export default function MockWritingPage() {
  const { id } = useParams();
  const router = useRouter();
  const mockId = String(id);

  const [data, setData] = useState<WritingSection | null>(null);
  const [error, setError] = useState("");
  const [task, setTask] = useState<1 | 2>(1);
  const [t1, setT1] = useState("");
  const [t2, setT2] = useState("");
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [fontSize, setFontSize] = useState("text-base");
  const [submitting, setSubmitting] = useState(false);
  const [savedAt, setSavedAt] = useState<string>("");
  const dirty = useRef(false);

  useEffect(() => {
    api.get(`/mock/${mockId}/section/writing/`)
      .then((r) => {
        setData(r.data);
        setT1(r.data.task1_text || "");
        setT2(r.data.task2_text || "");
        setTimeLeft(r.data.seconds_left);
      })
      .catch((e) => setError(e?.response?.data?.detail || "Could not load the Writing section."));
  }, [mockId]);

  // Clock
  useEffect(() => {
    const t = setInterval(() => setTimeLeft((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  // Autosave drafts every 15 s so nothing is lost if the browser dies.
  useEffect(() => {
    const t = setInterval(() => {
      if (!dirty.current || !data) return;
      dirty.current = false;
      api.post(`/mock/${mockId}/section/writing/autosave/`, { task1: t1, task2: t2 })
        .then(() => setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })))
        .catch(() => { dirty.current = true; });
    }, 15000);
    return () => clearInterval(t);
  }, [mockId, t1, t2, data]);

  const submit = async (auto = false) => {
    if (!data || submitting) return;
    if (!auto && !confirm("Submit both tasks? You cannot come back to the Writing test.")) return;
    setSubmitting(true);
    try {
      await api.post(`/mock/${mockId}/section/writing/submit/`, { task1: t1, task2: t2 });
      router.replace(`/mock/${mockId}`);
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Could not submit. Please try again.");
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (data && timeLeft === 0 && !submitting) submit(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, data]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  if (error) {
    return (
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center">
          <p>{error}</p>
          <Link href={`/mock/${mockId}`} className="inline-block mt-4 text-primary hover:underline">← Back</Link>
        </div>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const text = task === 1 ? t1 : t2;
  const setText = (v: string) => { dirty.current = true; (task === 1 ? setT1 : setT2)(v); };
  const words = countWords(text);
  const minWords = task === 1 ? 150 : 250;

  return (
    <div className="h-screen overflow-hidden bg-white flex flex-col font-sans">
      <header className="bg-[#1a3a5f] text-white flex items-center justify-between px-6 py-3 shrink-0 shadow-md z-10">
        <div className="flex items-center gap-4">
          <div className="font-bold text-xl tracking-wide">IELTS</div>
          <div className="h-6 w-[1px] bg-white/30" />
          <div className="text-sm">Writing</div>
          <div className="h-6 w-[1px] bg-white/30" />
          <div className="text-sm text-gray-300">Mock {data.mock_number}</div>
        </div>
        <div className="flex items-center gap-4">
          {savedAt && <span className="text-xs text-gray-300">Draft saved {savedAt}</span>}
          <button
            className="flex items-center gap-1 hover:text-blue-200 transition-colors text-sm"
            onClick={() => setFontSize(fontSize === "text-base" ? "text-lg" : fontSize === "text-lg" ? "text-xl" : "text-base")}
          >
            <Settings className="w-4 h-4" /> Text Size
          </button>
          <div className={`flex items-center gap-2 font-mono text-xl font-bold bg-black/20 px-4 py-1.5 rounded ${timeLeft < 300 ? "text-red-400 animate-pulse" : "text-white"}`}>
            <Clock className="w-5 h-5" /> {fmt(timeLeft)}
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden bg-[#f0f2f5]">
        <div className="flex-1 flex flex-col border-r border-gray-300 bg-white m-2 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-100 px-6 py-3 border-b border-gray-200 shrink-0">
            <h2 className="font-bold text-gray-800">Part {task}</h2>
          </div>
          <div className="flex-1 p-8 overflow-y-auto">
            <p className="text-blue-700 font-bold text-lg mb-3">WRITING TASK {task}</p>
            <p className="text-gray-700 mb-3">You should spend about {task === 1 ? 20 : 40} minutes on this task.</p>
            {task === 2 && <p className="text-gray-700 mb-3">Write about the following topic:</p>}
            <div className={`border border-blue-300 bg-blue-50 rounded-lg ${task === 1 ? "p-3" : "p-4"} mb-4`}>
              <p className={`text-gray-800 leading-relaxed whitespace-pre-wrap font-semibold italic ${task === 1 ? "text-sm" : fontSize}`}>
                {task === 1 ? data.task1_prompt_text : data.task2_prompt_text}
              </p>
            </div>
            {task === 1 && data.task1_prompt_image && (
              <img src={data.task1_prompt_image} alt="Task 1" className="w-full rounded-xl mb-4" />
            )}
            {task === 2 && <p className="text-gray-700 mb-3">Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>}
            <p className="text-gray-700">Write at least {minWords} words.</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-white m-2 rounded-xl shadow-sm overflow-hidden ml-0">
          <div className="bg-gray-100 px-6 py-3 border-b border-gray-200 shrink-0 flex items-center justify-between">
            <h2 className="font-bold text-gray-800">Your Answer</h2>
            <span className={`text-sm font-semibold ${words < minWords ? "text-red-500" : "text-green-600"}`}>{words} words</span>
          </div>
          <div className="flex-1 p-4 overflow-hidden flex flex-col">
            <textarea
              key={task}
              className={`flex-1 w-full resize-none p-4 text-gray-900 ${fontSize} leading-relaxed border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent`}
              placeholder="Write your answer here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onPaste={(e) => e.preventDefault()}
              spellCheck={false}
            />
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-300 p-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            {[1, 2].map((n) => (
              <button
                key={n}
                onClick={() => setTask(n as 1 | 2)}
                className={`px-4 py-2 rounded font-semibold text-sm border transition-colors ${
                  task === n ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                Part {n}
                <span className={`ml-2 text-xs ${task === n ? "text-gray-300" : "text-gray-400"}`}>{countWords(n === 1 ? t1 : t2)} w</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => submit()}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold transition-colors shadow-sm disabled:opacity-50"
          >
            <CheckSquare className="w-5 h-5" /> {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </footer>
    </div>
  );
}
