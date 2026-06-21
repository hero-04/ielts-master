"use client";

import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PenTool, Copy, Check, RotateCcw } from "lucide-react";

interface WritingSubmission {
  id: number;
  prompt: number;
  submission_text: string;
  word_count: number;
  created_at: string;
  prompt_cambridge_book: number;
  prompt_test_number: number;
  prompt_task_type: string;
}

export default function MyWritingsPage() {
  const [submissions, setSubmissions] = useState<WritingSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await api.get("/writing/submissions/");
        const data: WritingSubmission[] = res.data.results ?? res.data;
        setSubmissions(
          data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        );
      } catch {
        setError("Could not load your writings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const handleCopy = async (submission: WritingSubmission) => {
    await navigator.clipboard.writeText(submission.submission_text);
    setCopiedId(submission.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const taskLabel = (taskType: string) => taskType === "task_1" ? "Task 1" : "Task 2";
  const taskColor = (taskType: string) => taskType === "task_1" ? "text-amber-600" : "text-orange-600";
  const taskBg = (taskType: string) => taskType === "task_1" ? "bg-amber-50" : "bg-orange-50";

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">My Writings</h2>
        <p className="text-gray-600 text-lg">Your submitted essays and Task 1 responses.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse h-48" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center">
          <p className="text-lg font-medium">{error}</p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl flex flex-col items-center justify-center p-12 text-center h-[50vh]">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-4">
            <PenTool className="w-10 h-10 text-amber-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No writings yet</h3>
          <p className="text-gray-500 max-w-sm">
            Head to{" "}
            <Link href="/writing/task1" className="text-amber-600 hover:underline">Task 1</Link>
            {" "}or{" "}
            <Link href="/writing/task2" className="text-orange-600 hover:underline">Task 2</Link>
            {" "}to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => {
            const date = new Date(s.created_at).toLocaleDateString("en-GB", {
              day: "numeric", month: "short", year: "numeric",
            });
            const isCopied = copiedId === s.id;

            return (
              <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 ${taskBg(s.prompt_task_type)} rounded-lg flex items-center justify-center shrink-0`}>
                      <PenTool className={`w-4 h-4 ${taskColor(s.prompt_task_type)}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        Cambridge {s.prompt_cambridge_book} •{" "}
                        <span className={taskColor(s.prompt_task_type)}>{taskLabel(s.prompt_task_type)}</span>
                        {" "}• Test {s.prompt_test_number}
                      </p>
                      <p className="text-xs text-gray-400">{date} · {s.word_count} words</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopy(s)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      {isCopied
                        ? <Check className="w-3.5 h-3.5 text-green-500" />
                        : <Copy className="w-3.5 h-3.5" />}
                      {isCopied ? "Copied!" : "Copy"}
                    </button>
                    <Link
                      href={`/writing/prompt/${s.prompt}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Retake
                    </Link>
                  </div>
                </div>

                <div className="max-h-[200px] overflow-y-auto rounded-lg bg-gray-50 border border-gray-100 p-4">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {s.submission_text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
