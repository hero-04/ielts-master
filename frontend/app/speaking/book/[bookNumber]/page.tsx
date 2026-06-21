"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { ArrowLeft, Mic, Lock } from "lucide-react";

interface SpeakingTest {
  id: number;
  cambridge_book: number;
  test_number: number;
}

export default function SpeakingBookPage() {
  const params = useParams();
  const bookNumber = Number(params?.bookNumber);

  const [testsByNumber, setTestsByNumber] = useState<Record<number, SpeakingTest>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await api.get("/speaking/tests/");
        const data: SpeakingTest[] = res.data.results ?? res.data;
        const map: Record<number, SpeakingTest> = {};
        for (const t of data) {
          if (t.cambridge_book === bookNumber) {
            map[t.test_number] = t;
          }
        }
        setTestsByNumber(map);
      } catch {
        setError("Could not load tests. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, [bookNumber]);

  const slots = [1, 2, 3, 4];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <Link
          href="/speaking"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-4 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to books
        </Link>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Cambridge {bookNumber}</h2>
        <p className="text-gray-600 text-lg">Select a test to begin your speaking practice.</p>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {slots.map((testNum) => {
            const test = loading ? null : (testsByNumber[testNum] ?? undefined);
            const exists = test !== null && test !== undefined;

            if (loading) {
              return (
                <div key={testNum} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse min-h-[180px]">
                  <div className="w-24 h-5 bg-gray-200 rounded mb-3" />
                  <div className="w-3/4 h-5 bg-gray-200 rounded mb-6" />
                  <div className="w-full h-10 bg-gray-200 rounded-xl" />
                </div>
              );
            }

            if (exists) {
              return (
                <div key={testNum} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col">
                  <div className="p-6 flex-1">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-3">
                      <Mic className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-1">Test {testNum}</p>
                    <p className="text-sm text-gray-500">Parts 1, 2 &amp; 3</p>
                  </div>
                  <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
                    <Link
                      href={`/speaking/practice/${test!.id}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
                    >
                      <Mic className="w-4 h-4" />
                      Start Practice
                    </Link>
                  </div>
                </div>
              );
            }

            return (
              <div key={testNum} className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center p-6 min-h-[180px] gap-3 opacity-60">
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
