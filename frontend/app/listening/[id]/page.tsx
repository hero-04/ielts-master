"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Clock, Headphones, ArrowLeft } from "lucide-react";
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
  difficulty: string;
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
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
          <Link href="/dashboard/listening" className="inline-block mt-4 text-purple-600 hover:underline">
            ← Back to listening tests
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-sm">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/listening" className="text-purple-600 hover:underline flex items-center gap-1 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to tests
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{test.title}</h1>
          <div className="flex gap-4 text-gray-600">
            <span className="flex items-center gap-1">
              <Headphones className="w-4 h-4" /> {test.difficulty}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> 40 minutes
            </span>
          </div>
        </div>

        {/* Audio Player */}
        {test.audio_url && (
          <div className="mb-8 p-4 bg-gray-100 rounded-xl border border-gray-200">
            <audio controls className="w-full">
              <source src={test.audio_url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {/* Questions by Section */}
        {[1, 2, 3, 4].map((section) => {
          const sectionQuestions = test.questions?.filter(q => q.section === section) || [];
          if (sectionQuestions.length === 0) return null;
          
          return (
            <div key={section} className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-purple-600 pl-3">
                Section {section}
              </h2>
              <div className="space-y-6">
                {sectionQuestions.map((question, idx) => (
                  <div key={question.id} className="p-5 bg-gray-50 border border-gray-200 rounded-xl shadow-sm">
                    {renderQuestion(question, idx + 1)}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-8 w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Test"}
        </button>
      </div>
    </DashboardLayout>
  );
}