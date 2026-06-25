"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Book, Headphones, PenTool, Mic, ArrowRight, BarChart2 } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Attempt {
  band_score: string;
}

export default function DashboardPage() {
  const { user } = useAuthStore();

  const [readingAttempts, setReadingAttempts] = useState<Attempt[]>([]);
  const [listeningAttempts, setListeningAttempts] = useState<Attempt[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/reading/attempts/"),
      api.get("/listening/attempts/"),
    ]).then(([r, l]) => {
      setReadingAttempts(r.data.results ?? r.data);
      setListeningAttempts(l.data.results ?? l.data);
    }).finally(() => setLoadingStats(false));
  }, []);

  const avg = (attempts: Attempt[]) =>
    attempts.length === 0
      ? "-"
      : (attempts.reduce((s, a) => s + parseFloat(a.band_score), 0) / attempts.length).toFixed(1);

  const quotes = [
    { text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.", author: "Dr. Seuss" },
    { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
    { text: "The more you learn, the more you earn.", author: "Warren Buffett" },
    { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "Once you learn to read, you will be forever free.", author: "Frederick Douglass" },
    { text: "The beautiful thing about learning is that nobody can take it away from you.", author: "B.B. King" },
  ];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  const stats = [
    { name: "Reading Tests Completed", value: loadingStats ? null : String(readingAttempts.length), icon: Book, color: "text-blue-500", bg: "bg-blue-50" },
    { name: "Average Reading Score", value: loadingStats ? null : avg(readingAttempts), icon: BarChart2, color: "text-green-500", bg: "bg-green-50" },
    { name: "Listening Tests Completed", value: loadingStats ? null : String(listeningAttempts.length), icon: Headphones, color: "text-purple-500", bg: "bg-purple-50" },
    { name: "Average Listening Score", value: loadingStats ? null : avg(listeningAttempts), icon: BarChart2, color: "text-amber-500", bg: "bg-amber-50" },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.full_name?.split(" ")[0] || "Student"}!</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">Ready to continue your IELTS preparation journey?</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
              {stat.value === null
                ? <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1" />
                : <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-12 p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-900/40">
        <p className="italic text-gray-800 dark:text-gray-200 text-2xl font-semibold leading-relaxed mb-4">&ldquo;{quote.text}&rdquo;</p>
        <p className="text-base font-bold text-primary">— {quote.author}</p>
      </div>

      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Start</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {/* Practice Cards */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-primary text-white rounded-xl flex items-center justify-center mb-6 shadow-md">
              <Book className="w-7 h-7" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Reading Practice</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Full 60-minute CD IELTS simulation with all 3 passages and 40 questions.</p>
            <Link href="/reading" className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-dark transition-colors">
              Start new test <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 dark:bg-purple-900/20 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-purple-600 text-white rounded-xl flex items-center justify-center mb-6 shadow-md">
              <Headphones className="w-7 h-7" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Listening Practice</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Adjustable audio, real exam interface, and instant band score calculation.</p>
            <Link href="/listening" className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:text-purple-800 transition-colors">
              Start new test <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 dark:bg-amber-900/20 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-amber-500 text-white rounded-xl flex items-center justify-center mb-6 shadow-md">
              <PenTool className="w-7 h-7" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Writing Practice</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Timed Task 1 and Task 2 practice with word count tracking and Band 8+ sample answers.</p>
            <Link href="/writing" className="inline-flex items-center gap-2 text-amber-600 font-semibold hover:text-amber-800 transition-colors">
              Start writing <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 dark:bg-green-900/20 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-green-500 text-white rounded-xl flex items-center justify-center mb-6 shadow-md">
              <Mic className="w-7 h-7" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Speaking Practice</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Practise all three parts of the speaking test with structured question prompts.</p>
            <Link href="/speaking" className="inline-flex items-center gap-2 text-green-600 font-semibold hover:text-green-800 transition-colors">
              Start speaking <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
