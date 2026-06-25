"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { ChevronRight, CheckCircle, Eye, EyeOff } from "lucide-react";

interface SpeakingQuestion {
  id: number;
  part: number;
  question_text: string;
  sample_answer: string;
  order_number: number;
}

interface SpeakingTest {
  id: number;
  cambridge_book: number;
  test_number: number;
  questions: SpeakingQuestion[];
}

type Step = 'part1' | 'part2' | 'part3' | 'done';
type Part2Phase = 'idle' | 'prep' | 'speak';

export default function SpeakingPracticePage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const [test, setTest] = useState<SpeakingTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const initialStep: Step = (() => {
    const p = searchParams?.get('startPart');
    if (p === '2') return 'part2';
    if (p === '3') return 'part3';
    return 'part1';
  })();
  const [currentStep, setCurrentStep] = useState<Step>(initialStep);
  const [shownAnswers, setShownAnswers] = useState<Record<number, boolean>>({});
  const [part2Phase, setPart2Phase] = useState<Part2Phase>('idle');
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!id) return;
    const fetchTest = async () => {
      try {
        const res = await api.get(`/speaking/tests/${id}/`);
        setTest(res.data);
      } catch {
        setError("Could not load the test. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [id]);

  // Part 2 timer — handles prep→speak transition and speak→part3 advance
  useEffect(() => {
    if (part2Phase === 'idle') return;
    if (timeLeft <= 0) {
      if (part2Phase === 'prep') {
        setPart2Phase('speak');
        setTimeLeft(120);
      } else if (part2Phase === 'speak') {
        setCurrentStep('part3');
        setPart2Phase('idle');
      }
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [part2Phase, timeLeft]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const toggleAnswer = (questionId: number) =>
    setShownAnswers(prev => ({ ...prev, [questionId]: !prev[questionId] }));

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading test...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !test) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center">
          <p>{error || "Test not found"}</p>
          <Link href="/speaking" className="inline-block mt-4 text-green-600 hover:underline">
            ← Back to Speaking
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const part1Qs = test.questions.filter(q => q.part === 1).sort((a, b) => a.order_number - b.order_number);
  const part2Q  = test.questions.find(q => q.part === 2);
  const part3Qs = test.questions.filter(q => q.part === 3).sort((a, b) => a.order_number - b.order_number);

  const stepOrder: Step[] = ['part1', 'part2', 'part3', 'done'];
  const currentIdx = stepOrder.indexOf(currentStep);

  const renderAnswerToggle = (question: SpeakingQuestion) => (
    <div className="mt-4">
      <button
        onClick={() => toggleAnswer(question.id)}
        className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
      >
        {shownAnswers[question.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        {shownAnswers[question.id] ? 'Hide sample answer' : 'Show sample answer'}
      </button>
      {shownAnswers[question.id] && question.sample_answer && (
        <div className="mt-3 p-4 bg-green-50 rounded-xl border border-green-100">
          <p className="text-sm text-gray-700 leading-relaxed">{question.sample_answer}</p>
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {(['part1', 'part2', 'part3'] as const).map((key, i) => {
          const labels = { part1: 'Part 1', part2: 'Part 2', part3: 'Part 3' };
          const isDone = stepOrder.indexOf(key) < currentIdx;
          const isActive = currentStep === key;
          return (
            <div key={key} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive ? 'bg-green-600 text-white' :
                isDone   ? 'bg-green-100 text-green-700' :
                           'bg-gray-100 text-gray-400'
              }`}>
                {isDone && <CheckCircle className="w-3.5 h-3.5" />}
                {labels[key]}
              </div>
              {i < 2 && <ChevronRight className="w-4 h-4 text-gray-300" />}
            </div>
          );
        })}
      </div>

      {/* Part 1 */}
      {currentStep === 'part1' && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Part 1 — Introduction &amp; Interview</h2>
            <p className="text-gray-500 text-sm">Answer questions about familiar topics.</p>
          </div>
          <div className="space-y-4 mb-8">
            {part1Qs.map(q => (
              <div key={q.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <p className="font-medium text-gray-900 leading-relaxed">{q.order_number}. {q.question_text}</p>
                {renderAnswerToggle(q)}
              </div>
            ))}
          </div>
          <button
            onClick={() => setCurrentStep('part2')}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
          >
            Continue to Part 2 <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Part 2 */}
      {currentStep === 'part2' && part2Q && (
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Part 2 — Individual Long Turn</h2>
            <p className="text-gray-500 text-sm">1 minute to prepare, then speak for up to 2 minutes.</p>
          </div>
          <div className="bg-white border-2 border-green-200 rounded-2xl p-8 mb-8 text-center shadow-sm">
            <p className="text-lg font-medium text-gray-900 leading-relaxed">{part2Q.question_text}</p>
          </div>
          {part2Phase === 'idle' && (
            <div className="flex justify-center mb-8">
              <button
                onClick={() => { setPart2Phase('prep'); setTimeLeft(60); }}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
              >
                Start Preparation
              </button>
            </div>
          )}
          {part2Phase !== 'idle' && (
            <div className="flex flex-col items-center mb-8 gap-2">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                {part2Phase === 'prep' ? 'Prepare your answer' : 'Now speak'}
              </p>
              <div className={`font-mono text-6xl font-bold tabular-nums ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-green-600'}`}>
                {formatTime(timeLeft)}
              </div>
              {part2Phase === 'speak' && (
                <p className="text-xs text-gray-400 mt-1">Part 3 starts automatically when time is up</p>
              )}
            </div>
          )}
          {renderAnswerToggle(part2Q)}
        </div>
      )}

      {/* Part 3 */}
      {currentStep === 'part3' && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Part 3 — Two-way Discussion</h2>
            <p className="text-gray-500 text-sm">Discuss abstract questions related to the Part 2 topic.</p>
          </div>
          <div className="space-y-4 mb-8">
            {part3Qs.map(q => (
              <div key={q.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <p className="font-medium text-gray-900 leading-relaxed">{q.order_number}. {q.question_text}</p>
                {renderAnswerToggle(q)}
              </div>
            ))}
          </div>
          <button
            onClick={() => setCurrentStep('done')}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
          >
            Finish <CheckCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Done */}
      {currentStep === 'done' && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Great practice session!</h2>
          <p className="text-gray-500 mb-8 max-w-sm">
            You've completed all three parts. Keep practising to improve your fluency and confidence!
          </p>
          <Link
            href="/speaking"
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
          >
            Back to Speaking
          </Link>
        </div>
      )}
    </DashboardLayout>
  );
}
