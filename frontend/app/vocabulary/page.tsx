"use client";

import DashboardLayout from "@/components/DashboardLayout";
import BookGrid from "@/components/BookGrid";
import { BookOpen } from "lucide-react";

export default function VocabularyPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Vocabulary Builder</h2>
        <p className="text-gray-600 text-lg">Choose a book to study its vocabulary.</p>
      </div>
      <BookGrid
        endpoint="/vocabulary/books/"
        href={(b) => `/vocabulary/book/${b}`}
        icon={BookOpen}
        iconColor="text-primary"
        iconBg="bg-blue-50"
        hoverBorder="hover:border-blue-200"
        unit="word"
        emptyTitle="No vocabulary available yet"
        emptyText="Coming soon — check back later for new vocabulary sets."
      />
    </DashboardLayout>
  );
}
