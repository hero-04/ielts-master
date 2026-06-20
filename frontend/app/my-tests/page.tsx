"use client";

import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { BookOpen, Headphones, ClipboardList } from "lucide-react";

interface Attempt {
  id: number;
  cambridge_book: number;
  test_number: number;
  band_score: string;
  raw_score: number;
  completed_at: string;
  type: "reading" | "listening";
}

export default function MyTestsPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [readingRes, listeningRes] = await Promise.all([
          api.get("/reading/attempts/"),
          api.get("/listening/attempts/"),
        ]);
        const reading: Attempt[] = (readingRes.data.results ?? readingRes.data).map(
          (a: any) => ({ ...a, type: "reading" as const })
        );
        const listening: Attempt[] = (listeningRes.data.results ?? listeningRes.data).map(
          (a: any) => ({ ...a, type: "listening" as const })
        );
        const merged = [...reading, ...listening].sort(
          (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
        );
        setAttempts(merged);
      } catch (err: any) {
        console.error("Failed to fetch attempts", err);
        setError("Could not load your test history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">My Tests</h2>
        <p className="text-gray-600 text-lg">Your completed Reading and Listening attempts.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 animate-pulse h-16" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center">
          <p className="text-lg font-medium">{error}</p>
        </div>
      ) : attempts.length === 0 ? (
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl flex flex-col items-center justify-center p-12 text-center h-[50vh]">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <ClipboardList className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No completed tests yet</h3>
          <p className="text-gray-500 max-w-sm">
            Head to{" "}
            <Link href="/reading" className="text-primary hover:underline">Reading</Link>
            {" "}or{" "}
            <Link href="/listening" className="text-purple-600 hover:underline">Listening</Link>
            {" "}to get started.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {attempts.map((attempt, idx) => {
            const isReading = attempt.type === "reading";
            const href = isReading
              ? `/reading/results/${attempt.id}`
              : `/listening/results/${attempt.id}`;
            const date = new Date(attempt.completed_at).toLocaleDateString("en-GB", {
              day: "numeric", month: "short", year: "numeric",
            });

            return (
              <Link
                key={`${attempt.type}-${attempt.id}`}
                href={href}
                className={`flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors ${
                  idx !== 0 ? "border-t border-gray-100" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isReading ? "bg-blue-50" : "bg-purple-50"
                  }`}>
                    {isReading
                      ? <BookOpen className="w-4 h-4 text-primary" />
                      : <Headphones className="w-4 h-4 text-purple-600" />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Cambridge {attempt.cambridge_book}, Test {attempt.test_number},{" "}
                      <span className={isReading ? "text-primary" : "text-purple-600"}>
                        {isReading ? "Reading" : "Listening"}
                      </span>
                    </p>
                    <p className="text-sm text-gray-400">{date}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-lg font-bold text-gray-900">Band {attempt.band_score}</span>
                  <p className="text-xs text-gray-400">{attempt.raw_score}/40 correct</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
