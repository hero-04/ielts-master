import DashboardLayout from "@/components/DashboardLayout";
import { BookOpen } from "lucide-react";
import Link from "next/link";

export default function VocabularyPage() {
  const books = Array.from({ length: 11 }, (_, i) => i + 10);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Vocabulary Builder</h2>
        <p className="text-gray-600 text-lg">Choose a Cambridge book to study its vocabulary.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {books.map((n) => (
          <Link key={n} href={`/vocabulary/book/${n}`}>
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-primary transition-all cursor-pointer flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Cambridge</p>
                <p className="text-2xl font-bold text-gray-900">{n}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}
