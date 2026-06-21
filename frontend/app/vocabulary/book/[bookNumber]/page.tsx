"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

interface VocabularyWord {
  id: number;
  word: string;
  definition: string;
  example_sentence?: string;
  cambridge_book: number;
}

export default function VocabularyBookPage() {
  const { bookNumber } = useParams();
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (bookNumber) {
      const fetchWords = async () => {
        try {
          const res = await api.get("/vocabulary/words/", { params: { cambridge_book: bookNumber } });
          setWords(res.data.results ?? res.data);
        } catch {
          setError("Could not load vocabulary. Please try again later.");
        } finally {
          setLoading(false);
        }
      };
      fetchWords();
    }
  }, [bookNumber]);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link href="/vocabulary" className="inline-flex items-center gap-1 text-primary hover:underline mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to books
        </Link>
        <h2 className="text-3xl font-bold text-gray-900 mt-2">Cambridge {bookNumber} — Vocabulary</h2>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-pulse h-20" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center">{error}</div>
      ) : words.length === 0 ? (
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl flex flex-col items-center justify-center p-16 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No vocabulary yet</h3>
          <p className="text-gray-500 max-w-sm">No vocabulary has been added for Cambridge {bookNumber} yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {words.map((word) => (
            <div key={word.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-lg font-bold text-gray-900 mb-1">{word.word}</p>
              <p className="text-gray-700 mb-1">{word.definition}</p>
              {word.example_sentence && (
                <p className="text-gray-400 italic text-sm">"{word.example_sentence}"</p>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
