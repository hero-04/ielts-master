import DashboardLayout from "@/components/DashboardLayout";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";

export default function WritingTask1Page() {
  const books = Array.from({ length: 19 }, (_, i) => i + 1);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <Link
          href="/writing"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-4 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Task 1 Practice</h2>
        <p className="text-gray-600 text-lg">Choose a Cambridge book to practise Task 1 prompts.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {books.map((n) => (
          <Link key={n} href={`/writing/task1/book/${n}`}>
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-amber-300 transition-all cursor-pointer flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-amber-600" />
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
