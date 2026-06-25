"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { ArrowLeft, PlayCircle, Lock, BookOpen, X, Clock } from "lucide-react";

interface WritingPrompt {
  id: number;
  cambridge_book: number;
  test_number: number;
  task_type: string;
  prompt_text: string;
  prompt_image?: string;
  sample_answer: string;
}

export default function WritingTask2BookPage() {
  const params = useParams();
  const bookNumber = Number(params?.bookNumber);

  const [promptsByNumber, setPromptsByNumber] = useState<Record<number, WritingPrompt>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sampleOpen, setSampleOpen] = useState<WritingPrompt | null>(null);

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const res = await api.get("/writing/prompts/", {
          params: { cambridge_book: bookNumber, task_type: "task_2" },
        });
        const data: WritingPrompt[] = res.data.results ?? res.data;
        const map: Record<number, WritingPrompt> = {};
        for (const p of data) {
          map[p.test_number] = p;
        }
        setPromptsByNumber(map);
      } catch {
        setError("Could not load prompts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchPrompts();
  }, [bookNumber]);

  const slots = [1, 2, 3, 4];

  return (
    <>
    <DashboardLayout>
      <div className="mb-8">
        <Link
          href="/writing/task2"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-4 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to books
        </Link>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Cambridge {bookNumber} — Task 2</h2>
        <p className="text-gray-600 text-lg">Select a test to practise.</p>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {slots.map((testNum) => {
            const prompt = loading ? null : (promptsByNumber[testNum] ?? undefined);
            const exists = prompt !== null && prompt !== undefined;

            if (loading) {
              return (
                <div key={testNum} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse min-h-[200px]">
                  <div className="w-24 h-5 bg-gray-200 rounded mb-3" />
                  <div className="w-full h-4 bg-gray-200 rounded mb-2" />
                  <div className="w-3/4 h-4 bg-gray-200 rounded mb-6" />
                  <div className="w-full h-10 bg-gray-200 rounded-xl mb-2" />
                  <div className="w-full h-10 bg-gray-200 rounded-xl" />
                </div>
              );
            }

            if (exists) {
              return (
                <div key={testNum} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col">
                  <div className="p-6 flex-1">
                    <p className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-3">Test {testNum}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="flex items-center gap-1 bg-orange-50 text-orange-700 rounded-full px-2 py-0.5 text-xs font-medium">
                        <Clock className="w-3 h-3" /> 40 min
                      </span>
                      <span className="bg-orange-50 text-orange-700 rounded-full px-2 py-0.5 text-xs font-medium">250+ words</span>
                      <span className="bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 text-xs font-medium">Academic Writing</span>
                    </div>
                  </div>
                  <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex flex-col gap-2">
                    <Link
                      href={`/writing/prompt/${prompt!.id}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
                    >
                      <PlayCircle className="w-5 h-5" />
                      Start Test
                    </Link>
                    <button
                      onClick={() => setSampleOpen(prompt!)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 border border-orange-200 text-orange-700 font-medium rounded-xl hover:bg-orange-50 transition-colors bg-white"
                    >
                      <BookOpen className="w-4 h-4" />
                      Band 8+ Sample
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div key={testNum} className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center p-6 min-h-[200px] gap-3 opacity-60">
                <Lock className="w-6 h-6 text-gray-400" />
                <div className="text-center">
                  <p className="font-semibold text-gray-500">Test {testNum}</p>
                  <p className="text-sm text-gray-400 mt-1">Coming soon</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>

      {sampleOpen && (
        <div className="fixed inset-0 z-50 flex flex-col" onClick={() => setSampleOpen(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 flex flex-col h-screen" onClick={(e) => e.stopPropagation()}>
            <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
              <span className="font-semibold text-gray-800">
                Cambridge {sampleOpen.cambridge_book} • Test {sampleOpen.test_number} • Band 8+ Sample
              </span>
              <button onClick={() => setSampleOpen(null)} className="p-1 rounded hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex flex-1 overflow-hidden">
              <div className="w-1/2 flex flex-col overflow-hidden border-r border-gray-200 bg-white">
                <div className="flex-1 overflow-y-auto p-6">
                  {sampleOpen.prompt_image && (
                    <img src={sampleOpen.prompt_image} alt="Prompt" className="max-w-full mb-4 rounded" />
                  )}
                  <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{sampleOpen.prompt_text}</p>
                </div>
              </div>
              <div className="w-1/2 flex flex-col overflow-hidden bg-white">
                <div className="flex-1 overflow-y-auto p-6">
                  <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{sampleOpen.sample_answer}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
