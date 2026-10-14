"use client";

import DashboardLayout from "@/components/DashboardLayout";
import BookGrid from "@/components/BookGrid";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

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
        <p className="text-gray-600 text-lg">Choose a book to practise Task 1 prompts.</p>
      </div>
      <BookGrid
        endpoint="/writing/books/"
        params={{ task_type: "task_1" }}
        href={(b) => `/writing/task1/book/${b}`}
        icon={BookOpen}
        iconColor="text-amber-600"
        iconBg="bg-amber-50"
        hoverBorder="hover:border-amber-200"
        unit="prompt"
        emptyTitle="No tests available yet"
        emptyText="Coming soon — check back later for new Task 1 writing prompts."
      />
    </DashboardLayout>
  );
}
