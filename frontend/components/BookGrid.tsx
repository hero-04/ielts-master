"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { api } from "@/lib/api";

interface BookEntry {
  book_number: number;
  count: number;
}

interface BookGridProps {
  /** API path returning [{ book_number, count }], e.g. "/reading/books/" */
  endpoint: string;
  /** Extra query params, e.g. { task_type: "task_1" } */
  params?: Record<string, string>;
  /** Builds the link for a book card */
  href: (bookNumber: number) => string;
  icon: LucideIcon;
  /** Tailwind text colour for the icon, e.g. "text-blue-600" */
  iconColor: string;
  /** Tailwind bg colour for the icon circle, e.g. "bg-blue-50" */
  iconBg: string;
  /** Tailwind hover border colour, e.g. "hover:border-blue-200" */
  hoverBorder: string;
  /** Singular noun for the count badge: "test", "prompt", "word" */
  unit: string;
  emptyTitle: string;
  emptyText: string;
}

/**
 * Grid of "Book N" cards fed by a module's /books/ endpoint.
 * Shared by Reading, Listening, Vocabulary and Writing menus so every module
 * shows content the moment it's imported — no hard-coded empty states.
 */
export default function BookGrid({
  endpoint, params, href, icon: Icon, iconColor, iconBg, hoverBorder, unit, emptyTitle, emptyText,
}: BookGridProps) {
  const [books, setBooks] = useState<BookEntry[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .get<BookEntry[]>(endpoint, { params })
      .then((res) => { if (!cancelled) setBooks(res.data); })
      .catch((err) => {
        console.error(`Failed to load ${endpoint}`, err);
        if (!cancelled) setError("Could not load content. Please try again later.");
      });
    return () => { cancelled = true; };
    // params is a plain literal in every caller; stringify so a new object each render doesn't refetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, JSON.stringify(params ?? {})]);

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center">
        <p className="text-lg font-medium">{error}</p>
      </div>
    );
  }

  if (books === null) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse h-36" />
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl flex flex-col items-center justify-center p-16 text-center">
        <div className={`w-16 h-16 ${iconBg} rounded-full flex items-center justify-center mb-4`}>
          <Icon className={`w-8 h-8 ${iconColor}`} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{emptyTitle}</h3>
        <p className="text-gray-500 max-w-sm">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {books.map(({ book_number, count }) => (
        <Link
          key={book_number}
          href={href(book_number)}
          className={`bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md ${hoverBorder} transition-all text-center`}
        >
          <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Book {book_number}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {count} {unit}{count === 1 ? "" : "s"}
          </p>
        </Link>
      ))}
    </div>
  );
}
