"use client";

import DashboardLayout from "@/components/DashboardLayout";
import BookGrid from "@/components/BookGrid";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

export default function WritingTask2Page() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <Link
          href="/writing"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-4 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Task 2 — Essays</h2>
        <p className="text-gray-600 text-lg">Choose a book to practise Task 2 essays.</p>
      </div>
      <BookGrid
        endpoint="/writing/books/"
        params={{ task_type: "task_2" }}
        href={(b) => `/writing/task2/book/${b}`}
        icon={BookOpen}
        iconColor="text-orange-600"
        iconBg="bg-orange-50"
        hoverBorder="hover:border-orange-200"
        unit="prompt"
        emptyTitle="No tests available yet"
        emptyText="Coming soon — check back later for new Task 2 writing prompts."
      />
    </DashboardLayout>
  );
}
