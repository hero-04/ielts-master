"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { ArrowLeft, Award, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

interface AnswerDetail {
  question_id: number;
  question_order: number;
  question_text: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
}

interface AttemptResult {
  id: number;
  test_title: string;
  band_score: number;
  raw_score: number;
  total_questions: number;
  answers: AnswerDetail[];
}

export default function ReadingResultPage() {
  const { id } = useParams();
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      const fetchResult = async () => {
        try {
          const res = await api.get(`/reading/attempts/${id}/`);
          setResult(res.data);
        } catch (err) {
          console.error("Failed to fetch result", err);
          setError("Could not load results. Please try again.");
        } finally {
          setLoading(false);
        }
      };
      fetchResult();
    }
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading results...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !result) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center">
          <p>{error || "Results not found"}</p>
          <Link href="/reading" className="inline-block mt-4 text-purple-600 hover:underline">
            ← Back to reading tests
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-sm">
        <div className="mb-8">
          <Link href="/reading" className="text-purple-600 hover:underline flex items-center gap-1 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to tests
          </Link>
          
          <div className="text-center mb-8">
            <Award className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Results</h1>
            <p className="text-gray-600">{result.test_title}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Band Score</p>
              <p className="text-3xl font-bold text-purple-600">{result.band_score}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Correct Answers</p>
              <p className="text-3xl font-bold text-green-600">{result.raw_score} / {result.total_questions}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Accuracy</p>
              <p className="text-3xl font-bold text-blue-600">
                {result.total_questions === 0 ? "-" : `${Math.round((result.raw_score / result.total_questions) * 100)}%`}
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">Answer Review</h2>
        
        <div className="space-y-4">
          {result.answers?.map((answer, idx) => (
            <div key={answer.question_id} className="p-4 border rounded-lg">
              <div className="flex items-start gap-3">
                {answer.is_correct ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-2">{answer.question_order}. {answer.question_text}</p>
                  <div className="text-sm space-y-1">
                    <p><span className="text-gray-500">Your answer:</span> <span className={answer.is_correct ? "text-green-600" : "text-red-600"}>{answer.user_answer || "(not answered)"}</span></p>
                    {!answer.is_correct && (
                      <p><span className="text-gray-500">Correct answer:</span> <span className="text-green-600">{answer.correct_answer}</span></p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Link href="/reading">
          <button className="mt-8 w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors">
            Try Another Test
          </button>
        </Link>
      </div>
    </DashboardLayout>
  );
}