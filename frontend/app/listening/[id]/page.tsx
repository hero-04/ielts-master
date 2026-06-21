"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Clock, Headphones, CheckSquare } from "lucide-react";
import Link from "next/link";

interface ListeningQuestion {
  id: number;
  section: number;
  question_type: string;
  question_text: string;
  correct_answer: string;
  options?: string[];
  order_number: number;
}

interface ListeningTest {
  id: number;
  title: string;
  cambridge_book: number;
  test_number: number;
  audio_url: string;
  transcript: string;
  questions: ListeningQuestion[];
}

export default function ListeningTestPage() {
  const { id } = useParams();
  const [test, setTest] = useState<ListeningTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(40 * 60);

  useEffect(() => {
    if (id) {
      const fetchTest = async () => {
        try {
          const res = await api.get(`/listening/tests/${id}/`);
          setTest(res.data);
        } catch (err: any) {
          console.error("Failed to fetch listening test", err);
          setError("Could not load the test. Please try again later.");
        } finally {
          setLoading(false);
        }
      };
      fetchTest();
    }
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!test) return;
    setSubmitting(true);

    const payload = {
      answers: Object.entries(answers).map(([questionId, userAnswer]) => ({
        question_id: parseInt(questionId),
        user_answer: userAnswer,
      })),
    };

    try {
      const response = await api.post(`/listening/tests/${test.id}/submit/`, payload);
      alert(`Test submitted! Your band score: ${response.data.band_score}`);
      if (response.data.attempt_id) {
        window.location.href = `/listening/results/${response.data.attempt_id}`;
      }
    } catch (err) {
      console.error("Failed to submit test", err);
      alert("Error submitting test. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Функция для парсинга вариантов ответов из текста вопроса
  const parseOptions = (questionText: string): string[] => {
    const match = questionText.match(/[A-D]\)\s*[^A-D]*?(?=[A-D]\)|$)/gs);
    if (match) {
      return match.map(opt => opt.trim());
    }
    return [];
  };

  // Очищаем текст вопроса от вариантов ответов
  const cleanQuestionText = (questionText: string): string => {
    return questionText.replace(/[A-D]\)\s*[^A-D]*?(?=[A-D]\)|$)/gs, '').trim();
  };

  // Определяем тип вопроса и показываем нужный UI
  const renderQuestion = (question: ListeningQuestion, idx: number) => {
    const options = parseOptions(question.question_text);
    const cleanText = cleanQuestionText(question.question_text);
    const isMultipleChoice = options.length > 0;
    const isTrueFalse = question.question_type === 'tfng' || question.question_type === 'ynng';
    const isFormCompletion = question.question_type === 'form_completion' || question.question_type === 'table_completion' || question.question_type === 'short_answer';

    // Multiple Choice — красивые кнопки A, B, C, D
    // Multiple Choice — красивые кнопки A, B, C, D
  if (isMultipleChoice) {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const questionText = cleanText || question.question_text.split(/[A-D]\)/)[0];

    return (
      <div>
        <p className="font-medium text-gray-900 mb-3">
          {idx + 1}. {questionText}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          {options.map((option, optIdx) => {
            const letter = letters[optIdx];
            const isSelected = answers[question.id] === letter;
            const optionText = option.replace(/^[A-D]\)\s*/, '');

            return (
              <button
                key={optIdx}
                onClick={() => handleAnswerChange(question.id, letter)}
                className={`p-3 text-left border rounded-lg ${
                  isSelected
                    ? "border-purple-600 bg-purple-50 text-purple-700 ring-2 ring-purple-200 opacity-100"
                    : "border-gray-200 bg-white text-gray-900 opacity-100 hover:border-purple-300 hover:bg-gray-50"
                }`}
                style={{ opacity: 1, transition: "none" }}
              >
                <span className="font-bold mr-2 text-inherit">{letter}.</span>
                <span className="text-inherit">{optionText}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

    // True/False/Not Given — красивые кнопки
    if (isTrueFalse) {
      const tfOptions = [
        { value: "True", label: "✅ True", color: "green" },
        { value: "False", label: "❌ False", color: "red" },
        { value: "Not Given", label: "❓ Not Given", color: "gray" }
      ];
      return (
        <div>
          <p className="font-medium text-gray-900 mb-3">
            {idx + 1}. {question.question_text}
          </p>
          <div className="flex gap-3 flex-wrap">
            {tfOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleAnswerChange(question.id, opt.value)}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  answers[question.id] === opt.value
                    ? "border-purple-600 bg-purple-50 text-purple-700"
                    : "border-gray-200 hover:border-gray-300 bg-white text-gray-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Form / Table / Short Answer Completion — поле ввода
    if (isFormCompletion) {
      return (
        <div>
          <p className="font-medium text-gray-900 mb-3">
            {idx + 1}. {question.question_text}
          </p>
          <input
            type="text"
            placeholder="Type your answer here..."
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={answers[question.id] || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          />
        </div>
      );
    }

    // Default — обычное поле ввода
    return (
      <div>
        <p className="font-medium text-gray-900 mb-3">
          {idx + 1}. {question.question_text}
        </p>
        <input
          type="text"
          placeholder="Type your answer here..."
          className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          value={answers[question.id] || ""}
          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test...</p>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center">
          <p>{error || "Test not found"}</p>
          <Link href="/listening" className="inline-block mt-4 text-purple-600 hover:underline">
            ← Back to listening tests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-white flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#1a3a5f] text-white flex items-center justify-between px-6 py-3 shrink-0 shadow-md z-10">
        <div className="flex items-center gap-4">
          <div className="font-bold text-xl tracking-wide">IELTS</div>
          <div className="h-6 w-[1px] bg-white/30" />
          <div className="text-sm">Listening</div>
          <div className="h-6 w-[1px] bg-white/30" />
          <div className="text-sm text-gray-300">
            Cambridge {test.cambridge_book} • Test {test.test_number}
          </div>
        </div>
        <div className={`flex items-center gap-2 font-mono text-xl font-bold bg-black/20 px-4 py-1.5 rounded ${timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
          <Clock className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>
      </header>

      {/* Main — two panels */}
      <main className="flex-1 flex overflow-hidden bg-[#f0f2f5]">

        {/* Left Panel: Questions for active section */}
        <div className="flex-1 flex flex-col border-r border-gray-300 bg-white m-2 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-100 px-6 py-3 border-b border-gray-200 shrink-0">
            <h2 className="font-bold text-gray-800">Questions</h2>
          </div>
          <div className="flex-1 p-8 overflow-y-auto">
            {[1, 2, 3, 4].map((section) => {
              const qs = test.questions?.filter(q => q.section === section) || [];
              if (qs.length === 0) return null;
              return (
                <div key={section}>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-l-4 border-purple-600 pl-3">
                    Section {section}
                  </h3>
                  <div className="space-y-6 mb-8">
                    {qs.map((question, idx) => (
                      <div key={question.id} className="p-5 bg-gray-50 border border-gray-200 rounded-xl shadow-sm">
                        {renderQuestion(question, idx + 1)}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Audio player + transcript placeholder */}
        <div className="flex-1 flex flex-col bg-white m-2 rounded-xl shadow-sm overflow-hidden ml-0">
          <div className="bg-gray-100 px-6 py-3 border-b border-gray-200 shrink-0">
            <h2 className="font-bold text-gray-800">Audio Player</h2>
          </div>
          <div className="flex-1 p-8 overflow-y-auto">
            {test.audio_url ? (
              <div className="p-4 bg-gray-100 rounded-xl border border-gray-200">
                <audio controls className="w-full">
                  <source src={test.audio_url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            ) : (
              <div className="flex items-center justify-center h-24 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <div className="text-center text-gray-400">
                  <Headphones className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No audio available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-300 p-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div />
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold transition-colors shadow-sm disabled:opacity-50"
          >
            <CheckSquare className="w-5 h-5" /> {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </footer>
    </div>
  );
}
