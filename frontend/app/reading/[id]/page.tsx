"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Clock, ArrowLeft, ArrowRight, Settings, HelpCircle, CheckSquare, Highlighter, X } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

interface ReadingQuestion {
  id: number;
  question_type: string;
  question_text: string;
  correct_answer: string;
  order_number: number;
  options?: string[];
}

interface ReadingTest {
  id: number;
  title: string;
  difficulty: string;
  passage_a: string;
  passage_b: string;
  passage_c: string;
  questions: ReadingQuestion[];
}

export default function ReadingTestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params?.id as string;

  const [test, setTest] = useState<ReadingTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes
  const [fontSize, setFontSize] = useState("text-base");
  const [activePassage, setActivePassage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [highlights, setHighlights] = useState<Record<string, { start: number; end: number }[]>>({});
  const [pendingSelection, setPendingSelection] = useState<{
    paraIndex: number; start: number; end: number; top: number; left: number;
  } | null>(null);

  const toolbarRef = useRef<HTMLDivElement>(null);

  // Загрузка теста из API
  useEffect(() => {
    if (testId) {
      const fetchTest = async () => {
        try {
          const res = await api.get(`/reading/tests/${testId}/`);
          setTest(res.data);
        } catch (err) {
          console.error("Failed to fetch reading test", err);
          setError("Could not load the test. Please try again later.");
        } finally {
          setLoading(false);
        }
      };
      fetchTest();
    }
  }, [testId]);

  // Таймер
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setPendingSelection(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (qId: number, val: string) => {
    setAnswers({ ...answers, [qId]: val });
  };

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount) return;

    const getParagraphEl = (node: Node | null): Element | null => {
      while (node) {
        if (node.nodeType === Node.ELEMENT_NODE && (node as Element).hasAttribute('data-paragraph-index'))
          return node as Element;
        node = node.parentNode;
      }
      return null;
    };

    const anchorPara = getParagraphEl(selection.anchorNode);
    const focusPara = getParagraphEl(selection.focusNode);
    if (!anchorPara || anchorPara !== focusPara) return;

    const paraIndex = parseInt(anchorPara.getAttribute('data-paragraph-index') || '0');

    const getOffset = (container: Element, targetNode: Node, targetOffset: number): number => {
      let offset = 0;
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        if (walker.currentNode === targetNode) return offset + targetOffset;
        offset += walker.currentNode.textContent?.length ?? 0;
      }
      return offset + targetOffset;
    };

    const a = getOffset(anchorPara, selection.anchorNode!, selection.anchorOffset);
    const b = getOffset(anchorPara, selection.focusNode!, selection.focusOffset);
    const start = Math.min(a, b);
    const end = Math.max(a, b);
    if (start === end) return;

    const rect = selection.getRangeAt(0).getBoundingClientRect();
    setPendingSelection({
      paraIndex,
      start,
      end,
      top: rect.top - 48,
      left: rect.left + rect.width / 2,
    });
  };

  const applyHighlight = () => {
    if (!pendingSelection) return;
    const { paraIndex, start, end } = pendingSelection;
    const key = `${activePassage}-${paraIndex}`;
    setHighlights(prev => ({ ...prev, [key]: [...(prev[key] ?? []), { start, end }] }));
    setPendingSelection(null);
    window.getSelection()?.removeAllRanges();
  };

  const removeHighlight = () => {
    if (!pendingSelection) return;
    const { paraIndex, start, end } = pendingSelection;
    const key = `${activePassage}-${paraIndex}`;
    setHighlights(prev => ({
      ...prev,
      [key]: (prev[key] ?? []).filter(r => r.end <= start || r.start >= end),
    }));
    setPendingSelection(null);
    window.getSelection()?.removeAllRanges();
  };

  const renderHighlightedParagraph = (text: string, ranges: { start: number; end: number }[]) => {
    if (!ranges.length) return text;
    const sorted = [...ranges].sort((a, b) => a.start - b.start);
    const out: (string | JSX.Element)[] = [];
    let cursor = 0;
    for (const r of sorted) {
      if (r.start > cursor) out.push(text.slice(cursor, r.start));
      out.push(<mark key={`${r.start}-${r.end}`} className="bg-yellow-200 rounded-sm">{text.slice(r.start, r.end)}</mark>);
      cursor = Math.max(cursor, r.end);
    }
    if (cursor < text.length) out.push(text.slice(cursor));
    return out;
  };

  // Парсинг вариантов для Multiple Choice
  const parseOptions = (questionText: string): string[] => {
    const match = questionText.match(/[A-D]\)\s*[^A-D]*?(?=[A-D]\)|$)/gs);
    if (match) {
      return match.map(opt => opt.trim());
    }
    return [];
  };

  const cleanQuestionText = (questionText: string): string => {
    return questionText.replace(/[A-D]\)\s*[^A-D]*?(?=[A-D]\)|$)/gs, '').trim();
  };

  const handleSubmit = async () => {
    if (!test) return;
    if (!confirm("Are you sure you want to submit your test?")) return;
    
    setSubmitting(true);

    const payload = {
      answers: Object.entries(answers).map(([questionId, userAnswer]) => ({
        question_id: parseInt(questionId),
        user_answer: userAnswer,
      })),
    };

    try {
      const response = await api.post(`/reading/tests/${test.id}/submit/`, payload);
      alert(`Test submitted! Your band score: ${response.data.band_score}`);
      if (response.data.attempt_id) {
        router.push(`/reading/results/${response.data.attempt_id}`);
      } else {
        router.push("/dashboard/reading");
      }
    } catch (err) {
      console.error("Failed to submit test", err);
      alert("Error submitting test. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: ReadingQuestion, idx: number) => {
    const options = parseOptions(question.question_text);
    const cleanText = cleanQuestionText(question.question_text);
    const isMultipleChoice = options.length > 0;
    const isTrueFalse = question.question_type === 'tfng' || question.question_type === 'ynng';
    const isShortAnswer = question.question_type === 'short_answer' || question.question_type === 'sentence_completion';

    // Multiple Choice
    if (isMultipleChoice) {
      const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
      return (
        <div>
          <p className="font-medium mb-4">
            <span className="w-7 h-7 bg-primary text-white rounded-full inline-flex items-center justify-center shrink-0 text-sm mr-3">{idx + 1}</span>
            <span>{cleanText || question.question_text.split(/[A-D]\)/)[0]}</span>
          </p>
          <div className="pl-10 space-y-3">
            {options.map((option, optIdx) => {
              const letter = letters[optIdx];
              const optionText = option.replace(/^[A-D]\)\s*/, '');
              const isSelected = answers[question.id] === letter;
              
              return (
                <label key={optIdx} className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg border transition-all ${
                  isSelected ? "border-primary bg-primary/10" : "border-gray-200 hover:border-gray-300"
                }`}>
                  <input
                    type="radio"
                    name={`q-${question.id}`}
                    value={letter}
                    checked={isSelected}
                    onChange={() => handleAnswerChange(question.id, letter)}
                    className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <span className="font-bold mr-2">{letter}.</span>
                  <span>{optionText}</span>
                </label>
              );
            })}
          </div>
        </div>
      );
    }

    // True/False/Not Given
    if (isTrueFalse) {
      const tfOptions = ["True", "False", "Not Given"];
      return (
        <div>
          <p className="font-medium mb-4">
            <span className="w-7 h-7 bg-primary text-white rounded-full inline-flex items-center justify-center shrink-0 text-sm mr-3">{idx + 1}</span>
            <span>{question.question_text}</span>
          </p>
          <div className="pl-10 space-y-3">
            {tfOptions.map((opt) => (
              <label key={opt} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg border hover:border-gray-300">
                <input
                  type="radio"
                  name={`q-${question.id}`}
                  value={opt}
                  checked={answers[question.id] === opt}
                  onChange={() => handleAnswerChange(question.id, opt)}
                  className="w-4 h-4 text-primary focus:ring-primary"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }

    // Short Answer / Sentence Completion
    if (isShortAnswer) {
      return (
        <div>
          <p className="font-medium mb-4">
            <span className="w-7 h-7 bg-primary text-white rounded-full inline-flex items-center justify-center shrink-0 text-sm mr-3">{idx + 1}</span>
            <span>{question.question_text}</span>
          </p>
          <div className="pl-10">
            <input
              type="text"
              value={answers[question.id] || ""}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              placeholder="Type your answer..."
            />
          </div>
        </div>
      );
    }

    // Default
    return (
      <div>
        <p className="font-medium mb-4">
          <span className="w-7 h-7 bg-primary text-white rounded-full inline-flex items-center justify-center shrink-0 text-sm mr-3">{idx + 1}</span>
          <span>{question.question_text}</span>
        </p>
        <div className="pl-10">
          <input
            type="text"
            value={answers[question.id] || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            placeholder="Type your answer..."
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test...</p>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center">
          <p>{error || "Test not found"}</p>
          <Link href="/dashboard/reading" className="inline-block mt-4 text-primary hover:underline">
            ← Back to reading tests
          </Link>
        </div>
      </div>
    );
  }

  // Получаем текущий текст пассажа
  const getCurrentPassageText = () => {
    switch(activePassage) {
      case 1: return test.passage_a;
      case 2: return test.passage_b;
      case 3: return test.passage_c;
      default: return test.passage_a;
    }
  };

  const passageText = getCurrentPassageText();
  const paragraphs = passageText?.split('\n\n') || [];

  return (
    <div className="h-screen overflow-hidden bg-white flex flex-col font-sans">
      {/* Top Header - CD IELTS Style */}
      <header className="bg-[#1a3a5f] text-white flex items-center justify-between px-6 py-3 shrink-0 shadow-md z-10">
        <div className="flex items-center gap-4">
          <div className="font-bold text-xl tracking-wide">IELTS</div>
          <div className="h-6 w-[1px] bg-white/30"></div>
          <div className="text-sm">Reading</div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 font-mono text-xl font-bold bg-black/20 px-4 py-1.5 rounded ${timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
          <div className="flex items-center gap-4 text-sm">
            <button 
              className="flex items-center gap-1 hover:text-blue-200 transition-colors"
              onClick={() => {
                if (fontSize === "text-base") setFontSize("text-lg");
                else if (fontSize === "text-lg") setFontSize("text-xl");
                else setFontSize("text-base");
              }}
            >
              <Settings className="w-4 h-4" /> Text Size
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Split View */}
      <main className="flex-1 flex overflow-hidden bg-[#f0f2f5]">
        {/* Left Panel: Passage */}
        <div className="flex-1 flex flex-col border-r border-gray-300 bg-white m-2 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-100 px-6 py-3 border-b border-gray-200 shrink-0 flex justify-between items-center">
            <h2 className="font-bold text-gray-800">Passage {activePassage}</h2>
            <button
              onClick={() => setHighlights(prev => {
                const next = { ...prev };
                Object.keys(next).filter(k => k.startsWith(`${activePassage}-`)).forEach(k => delete next[k]);
                return next;
              })}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
            >
              Clear Highlights
            </button>
          </div>
          <div className={`p-8 overflow-y-auto ${fontSize} leading-relaxed text-gray-800 text-justify font-serif`} onMouseUp={handleMouseUp}>
            <h1 className="text-2xl font-bold text-center mb-8">{test.title}</h1>
            {paragraphs.map((paragraph, i) => (
              <p key={i} data-paragraph-index={i} className="mb-6 indent-8">
                {renderHighlightedParagraph(paragraph, highlights[`${activePassage}-${i}`] ?? [])}
              </p>
            ))}
          </div>
        </div>

        {/* Right Panel: Questions */}
        <div className="flex-1 flex flex-col bg-white m-2 rounded-xl shadow-sm overflow-hidden ml-0">
          <div className="bg-gray-100 px-6 py-3 border-b border-gray-200 shrink-0">
            <h2 className="font-bold text-gray-800">Questions</h2>
          </div>
          <div className="p-8 overflow-y-auto text-base text-gray-800 space-y-8">
            {test.questions?.map((question, idx) => (
              <div key={question.id} className="p-4 bg-blue-50/30 rounded-xl border border-blue-100">
                {renderQuestion(question, idx)}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="bg-white border-t border-gray-300 p-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActivePassage(Math.max(1, activePassage - 1))}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" /> Previous
            </button>
            <button 
              onClick={() => setActivePassage(Math.min(3, activePassage + 1))}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium transition-colors"
            >
              Next <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold transition-colors shadow-sm disabled:opacity-50"
          >
            <CheckSquare className="w-5 h-5" /> {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </footer>

      {pendingSelection && (
        <div
          ref={toolbarRef}
          style={{ position: 'fixed', top: pendingSelection.top, left: pendingSelection.left, transform: 'translateX(-50%)', zIndex: 50 }}
          className="bg-gray-900 text-white rounded-lg shadow-xl flex items-center gap-1 px-2 py-1.5 select-none"
        >
          <button
            onMouseDown={e => e.preventDefault()}
            onClick={applyHighlight}
            className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-gray-700 text-sm font-medium transition-colors"
          >
            <Highlighter className="w-3.5 h-3.5 text-yellow-300" />
            Highlight
          </button>
          <div className="w-px h-4 bg-gray-600" />
          <button
            onMouseDown={e => e.preventDefault()}
            onClick={removeHighlight}
            className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-gray-700 text-sm font-medium transition-colors"
          >
            <X className="w-3.5 h-3.5 text-red-400" />
            Remove
          </button>
        </div>
      )}
    </div>
  );
}