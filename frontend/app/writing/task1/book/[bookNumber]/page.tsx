"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { ArrowLeft, PlayCircle, Lock, BookOpen } from "lucide-react";

interface WritingPrompt {
  id: number;
  cambridge_book: number;
  test_number: number;
  task_type: string;
  prompt_text: string;
}

export default function WritingTask1BookPage() {
  const params = useParams();
  const bookNumber = Number(params?.bookNumber);

  const [promptsByNumber, setPromptsByNumber] = useState<Record<number, WritingPrompt>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const res = await api.get("/writing/prompts/", {
          params: { cambridge_book: bookNumber, task_type: "task_1" },
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
    <DashboardLayout>
      <div className="mb-8">
        <Link
          href="/writing/task1"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-4 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to books
        </Link>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Cambridge {bookNumber} — Task 1</h2>
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
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-2">Test {testNum}</p>
                    <p className="text-sm text-gray-600 line-clamp-3">{prompt!.prompt_text}</p>
                  </div>
                  <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex flex-col gap-2">
                    <Link
                      href={`/writing/prompt/${prompt!.id}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors"
                    >
                      <PlayCircle className="w-5 h-5" />
                      Start Test
                    </Link>
                    <button
                      disabled
                      className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 text-gray-400 font-medium rounded-xl cursor-not-allowed bg-white"
                    >
                      <BookOpen className="w-4 h-4" />
                      Sample Band 9
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
  );
}
