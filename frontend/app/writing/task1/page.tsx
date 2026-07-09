import DashboardLayout from "@/components/DashboardLayout";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";

export default function WritingTask1Page() {
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
        <p className="text-gray-600 text-lg">Choose a test to practise Task 1 prompts.</p>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl flex flex-col items-center justify-center p-16 text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-amber-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No tests available yet</h3>
        <p className="text-gray-500 max-w-sm">Coming soon — check back later for new Task 1 writing prompts.</p>
      </div>
    </DashboardLayout>
  );
}
