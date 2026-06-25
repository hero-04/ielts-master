"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface ReadingTest {
  id: number;
  cambridge_book: number;
  test_number: number;
}

export default function ReadingListPage() {
  const [countByBook, setCountByBook] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await api.get("/reading/tests/");
        const data: ReadingTest[] = res.data.results || res.data;
        const counts: Record<number, number> = {};
        for (const test of data) {
          counts[test.cambridge_book] = (counts[test.cambridge_book] || 0) + 1;
        }
        setCountByBook(counts);
      } catch (err: any) {
        console.error("Failed to fetch reading tests", err);
        setError("Could not load reading tests. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  const books = Array.from({ length: 11 }, (_, i) => i + 10);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Reading Practice Tests</h2>
        <p className="text-gray-600 text-lg">Choose a Cambridge book to begin your IELTS reading practice.</p>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center">
          <p className="text-lg font-medium">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {books.map((bookNum) => {
            const count = countByBook[bookNum] ?? (loading ? null : 0);
            return (
              <Link
                key={bookNum}
                href={`/reading/book/${bookNum}`}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group flex flex-col items-center justify-center p-6 gap-3 min-h-[140px]"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                    Cambridge {bookNum}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {count === null
                      ? "Loading..."
                      : count === 0
                      ? "No tests yet"
                      : `${count} test${count !== 1 ? "s" : ""} available`}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
