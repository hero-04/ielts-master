"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Clock, CheckSquare } from "lucide-react";
import Link from "next/link";

interface WritingPrompt {
  id: number;
  cambridge_book: number;
  test_number: number;
  task_type: string;
  prompt_text: string;
  prompt_image: string | null;
  sample_answer: string | null;
}

export default function WritingPromptPage() {
  const { id } = useParams();
  const [prompt, setPrompt] = useState<WritingPrompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!id) return;
    const fetchPrompt = async () => {
      try {
        const res = await api.get(`/writing/prompts/${id}/`);
        setPrompt(res.data);
        setTimeLeft(res.data.task_type === "task_1" ? 20 * 60 : 40 * 60);
      } catch {
        setError("Could not load the prompt. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchPrompt();
  }, [id]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft > 0]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).filter(Boolean).length;

  const handleSubmit = async () => {
    if (!prompt) return;
    setSubmitting(true);
    try {
      await api.post("/writing/submissions/", {
        prompt: prompt.id,
        submission_text: text,
      });
      window.location.href = "/writing/my-writings";
    } catch {
      alert("Error submitting. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading prompt...</p>
        </div>
      </div>
    );
  }

  if (error || !prompt) {
    return (
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center">
          <p>{error || "Prompt not found"}</p>
          <Link href="/writing" className="inline-block mt-4 text-amber-600 hover:underline">
            ← Back to Writing
          </Link>
        </div>
      </div>
    );
  }

  const taskLabel = prompt.task_type === "task_1" ? "Task 1" : "Task 2";
  const minWords = prompt.task_type === "task_1" ? 150 : 250;

  return (
    <div className="h-screen overflow-hidden bg-white flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#1a3a5f] text-white flex items-center justify-between px-6 py-3 shrink-0 shadow-md z-10">
        <div className="flex items-center gap-4">
          <div className="font-bold text-xl tracking-wide">IELTS</div>
          <div className="h-6 w-[1px] bg-white/30" />
          <div className="text-sm">Writing</div>
          <div className="h-6 w-[1px] bg-white/30" />
          <div className="text-sm text-gray-300">
            Cambridge {prompt.cambridge_book} • Test {prompt.test_number} • {taskLabel}
          </div>
        </div>
        <div className={`flex items-center gap-2 font-mono text-xl font-bold bg-black/20 px-4 py-1.5 rounded ${timeLeft < 300 ? "text-red-400 animate-pulse" : "text-white"}`}>
          <Clock className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>
      </header>

      {/* Main — two panels */}
      <main className="flex-1 flex overflow-hidden bg-[#f0f2f5]">

        {/* Left panel: prompt */}
        <div className="flex-1 flex flex-col border-r border-gray-300 bg-white m-2 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-100 px-6 py-3 border-b border-gray-200 shrink-0">
            <h2 className="font-bold text-gray-800">Prompt</h2>
          </div>
          <div className="flex-1 p-8 overflow-y-auto">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{prompt.prompt_text}</p>
            {prompt.prompt_image && (
              <img src={prompt.prompt_image} alt="Writing prompt" className="w-full rounded-xl mb-6" />
            )}
          </div>
        </div>

        {/* Right panel: textarea + word count */}
        <div className="flex-1 flex flex-col bg-white m-2 rounded-xl shadow-sm overflow-hidden ml-0">
          <div className="bg-gray-100 px-6 py-3 border-b border-gray-200 shrink-0 flex items-center justify-between">
            <h2 className="font-bold text-gray-800">Your Answer</h2>
            <span className={`text-sm font-semibold ${wordCount < minWords ? "text-red-500" : "text-green-600"}`}>
              {wordCount} words
            </span>
          </div>
          <div className="flex-1 p-4 overflow-hidden flex flex-col">
            <textarea
              className="flex-1 w-full resize-none p-4 text-gray-900 text-base leading-relaxed border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              placeholder="Write your answer here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-300 p-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div />
          <button
            onClick={handleSubmit}
            disabled={submitting || text.trim() === ""}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold transition-colors shadow-sm disabled:opacity-50"
          >
            <CheckSquare className="w-5 h-5" />
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </footer>
    </div>
  );
}
