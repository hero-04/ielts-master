"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { ArrowLeft, PlayCircle, Clock, MessageCircle, Mic } from "lucide-react";

interface SpeakingTest {
  id: number;
  cambridge_book: number;
  test_number: number;
}

const PART_META: Record<number, {
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  questionCount: string;
  tip: string;
  iconBg: string;
  headerGradient: string;
  badgeBg: string;
  badgeText: string;
  btnClass: string;
  startLabel: string;
}> = {
  1: {
    title: "Part 1",
    subtitle: "Introduction & Interview",
    description: "The examiner will ask you questions about yourself and familiar topics such as your home, family, work, studies and interests. This part lasts 4–5 minutes.",
    duration: "4–5 minutes",
    questionCount: "~10 questions",
    tip: "Speak naturally and give extended answers — aim for 2–3 sentences per response.",
    iconBg: "bg-green-500",
    headerGradient: "from-green-600 to-emerald-700",
    badgeBg: "bg-green-50",
    badgeText: "text-green-700",
    btnClass: "bg-green-600 hover:bg-green-700",
    startLabel: "Start Part 1",
  },
  2: {
    title: "Part 2",
    subtitle: "Individual Long Turn",
    description: "You will be given a topic card and have 1 minute to prepare your answer. You must then speak for 1–2 minutes. The examiner will then ask one or two questions on the same topic.",
    duration: "3–4 minutes",
    questionCount: "1 topic card",
    tip: "Use your preparation minute wisely — jot down key points for each bullet on the card.",
    iconBg: "bg-teal-500",
    headerGradient: "from-teal-600 to-cyan-700",
    badgeBg: "bg-teal-50",
    badgeText: "text-teal-700",
    btnClass: "bg-teal-600 hover:bg-teal-700",
    startLabel: "Start Part 2",
  },
  3: {
    title: "Part 3",
    subtitle: "Two-way Discussion",
    description: "The examiner will ask you further questions connected to the topic in Part 2. This gives you the opportunity to discuss more abstract ideas and issues. This part lasts 4–5 minutes.",
    duration: "4–5 minutes",
    questionCount: "~8 questions",
    tip: "Develop your answers with reasons and examples. Showing your reasoning earns higher marks.",
    iconBg: "bg-emerald-600",
    headerGradient: "from-emerald-600 to-green-800",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
    btnClass: "bg-emerald-600 hover:bg-emerald-700",
    startLabel: "Start Part 3",
  },
};

export default function SpeakingPartPage() {
  const params = useParams();
  const partNumber = Number(params?.partNumber);
  const meta = PART_META[partNumber];

  const [tests, setTests] = useState<SpeakingTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/speaking/tests/")
      .then((res) => setTests(res.data.results ?? res.data))
      .catch(() => setError("Could not load question sets. Please try again later."))
      .finally(() => setLoading(false));
  }, []);

  if (!meta) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center">
          <p>Invalid part number.</p>
          <Link href="/speaking" className="inline-block mt-4 text-green-600 hover:underline">← Back to Speaking</Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Back link */}
      <Link
        href="/speaking"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-6 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Speaking
      </Link>

      {/* Part info banner */}
      <div className={`bg-gradient-to-r ${meta.headerGradient} rounded-2xl p-8 mb-8 text-white shadow-md`}>
        <div className="flex items-start gap-5">
          <div className={`w-14 h-14 ${meta.iconBg} bg-white/20 rounded-xl flex items-center justify-center shrink-0 shadow`}>
            <Mic className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white/70 text-sm font-medium uppercase tracking-wider mb-1">{meta.title}</p>
            <h2 className="text-2xl font-bold mb-2">{meta.subtitle}</h2>
            <p className="text-white/85 leading-relaxed text-sm mb-4">{meta.description}</p>
            <div className="flex flex-wrap gap-3">
              <span className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1 text-sm font-medium">
                <Clock className="w-3.5 h-3.5" /> {meta.duration}
              </span>
              <span className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1 text-sm font-medium">
                <MessageCircle className="w-3.5 h-3.5" /> {meta.questionCount}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-5 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white/90">
          <span className="font-semibold">Tip: </span>{meta.tip}
        </div>
      </div>

      {/* Test selection */}
      <div className="mb-5">
        <h3 className="text-xl font-bold text-gray-900">Choose a Question Set</h3>
        <p className="text-gray-500 text-sm mt-1">Each set contains real IELTS exam questions.</p>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center">{error}</div>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
              <div className="w-32 h-5 bg-gray-200 rounded mb-3" />
              <div className="w-24 h-4 bg-gray-200 rounded mb-6" />
              <div className="w-full h-10 bg-gray-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : tests.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-12 text-center text-gray-400">
          <Mic className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No question sets available yet.</p>
          <p className="text-sm mt-1">Check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tests.map((test, index) => (
            <div
              key={test.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col"
            >
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${meta.badgeBg} ${meta.badgeText}`}>
                    Question Set {index + 1}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">
                  Set {index + 1}
                </h4>
                <p className="text-sm text-gray-500">{meta.title} — {meta.subtitle}</p>
                <div className="flex gap-2 mt-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${meta.badgeBg} ${meta.badgeText}`}>
                    {meta.duration}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${meta.badgeBg} ${meta.badgeText}`}>
                    {meta.questionCount}
                  </span>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
                <Link
                  href={`/speaking/practice/${test.id}?startPart=${partNumber}`}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 ${meta.btnClass} text-white font-semibold rounded-xl transition-colors`}
                >
                  <PlayCircle className="w-4 h-4" />
                  {meta.startLabel}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
