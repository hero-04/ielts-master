"use client";

import DashboardLayout from "@/components/DashboardLayout";
import BookGrid from "@/components/BookGrid";
import { BookOpen } from "lucide-react";

export default function ReadingListPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Reading Practice Tests</h2>
        <p className="text-gray-600 text-lg">Choose a book, then a test, to begin your IELTS reading practice.</p>
      </div>
      <BookGrid
        endpoint="/reading/books/"
        href={(b) => `/reading/book/${b}`}
        icon={BookOpen}
        iconColor="text-primary"
        iconBg="bg-blue-50"
        hoverBorder="hover:border-blue-200"
        unit="test"
        emptyTitle="No tests available yet"
        emptyText="Coming soon — check back later for new IELTS reading practice tests."
      />
    </DashboardLayout>
  );
}
