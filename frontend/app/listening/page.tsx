"use client";

import DashboardLayout from "@/components/DashboardLayout";
import BookGrid from "@/components/BookGrid";
import { Headphones } from "lucide-react";

export default function ListeningListPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Listening Practice Tests</h2>
        <p className="text-gray-600 text-lg">Choose a book, then a test, to begin your IELTS listening practice.</p>
      </div>
      <BookGrid
        endpoint="/listening/books/"
        href={(b) => `/listening/book/${b}`}
        icon={Headphones}
        iconColor="text-purple-600"
        iconBg="bg-purple-50"
        hoverBorder="hover:border-purple-200"
        unit="test"
        emptyTitle="No tests available yet"
        emptyText="Coming soon — check back later for new IELTS listening practice tests."
      />
    </DashboardLayout>
  );
}
