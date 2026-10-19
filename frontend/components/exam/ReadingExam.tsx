"use client";
import React from "react";

import { useState, useEffect, useRef } from "react";
import { Clock, ChevronLeft, ChevronRight, Settings, HelpCircle, CheckSquare, Highlighter, X, Check } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { ExamSource } from "./types";

interface ReadingQuestion {
  id: number;
  passage: string;
  question_type: string;
  question_text: string;
  correct_answer: string;
  order_number: number;
  options?: string[];
}

interface ReadingTest {
  id: number;
  title: string;
  passage_a_title: string;
  passage_b_title: string;
  passage_c_title: string;
  difficulty: string;
  passage_a: string;
  passage_b: string;
  passage_c: string;
  questions: ReadingQuestion[];
}

export default function ReadingExam({ source }: { source: ExamSource }) {
  const testId = source.storageKey;

  const [test, setTest] = useState<ReadingTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`reading_timer_${testId}`);
      if (saved) return parseInt(saved);
    }
    return 60 * 60;
  });
  const [fontSize, setFontSize] = useState("text-base");
  const [activePassage, setActivePassage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [focusedOrderNumber, setFocusedOrderNumber] = useState<number | null>(null);
  // Matching headings: a heading picked by click (alternative to dragging)
  const [pickedHeading, setPickedHeading] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<Record<string, { start: number; end: number }[]>>({});
  const [pendingSelection, setPendingSelection] = useState<{
    paraIndex: number; start: number; end: number; top: number; left: number;
  } | null>(null);

  const toolbarRef = useRef<HTMLDivElement>(null);
  const questionRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Загрузка теста из API
  useEffect(() => {
    if (testId) {
      const fetchTest = async () => {
        try {
          const res = await api.get(source.fetchUrl);
          setTest(res.data);
          if (typeof res.data.seconds_left === 'number') setTimeLeft(res.data.seconds_left);
        } catch (err) {
          console.error("Failed to fetch reading test", err);
          setError("Could not load the test. Please try again later.");
        } finally {
          setLoading(false);
        }
      };
      fetchTest();
    }
  }, [testId, source.fetchUrl]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev > 0 ? prev - 1 : 0;
        localStorage.setItem(`reading_timer_${testId}`, String(next));
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [testId]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setPendingSelection(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!testId) return;
    const saved = localStorage.getItem(`reading_answers_${testId}`);
    if (saved) { try { setAnswers(JSON.parse(saved)); } catch {} }
  }, [testId]);

  useEffect(() => {
    if (!testId) return;
    localStorage.setItem(`reading_answers_${testId}`, JSON.stringify(answers));
  }, [answers, testId]);

  useEffect(() => {
    if (focusedOrderNumber === null || !test) return;
    const letter = ({ 1: 'A', 2: 'B', 3: 'C' } as Record<number, string>)[activePassage];
    const q = test.questions.filter(q => q.passage === letter)
                            .find(q => q.order_number === focusedOrderNumber);
    if (q && questionRefs.current[q.id]) {
      questionRefs.current[q.id]!.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [focusedOrderNumber, activePassage, test]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (key: string | number, val: string) => {
    setAnswers(prev => ({ ...prev, [String(key)]: val }));
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
    const key = paraIndex >= 10000 ? `qs-${paraIndex - 10000}` : `${activePassage}-${paraIndex}`;
    setHighlights(prev => ({ ...prev, [key]: [...(prev[key] ?? []), { start, end }] }));
    setPendingSelection(null);
    window.getSelection()?.removeAllRanges();
  };

  const removeHighlight = () => {
    if (!pendingSelection) return;
    const { paraIndex, start, end } = pendingSelection;
    const key = paraIndex >= 10000 ? `qs-${paraIndex - 10000}` : `${activePassage}-${paraIndex}`;
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
    const out: (string | React.ReactElement)[] = [];
    let cursor = 0;
    for (const r of sorted) {
      if (r.start > cursor) out.push(text.slice(cursor, r.start));
      out.push(<mark key={`${r.start}-${r.end}`} className="bg-yellow-200 rounded-sm">{text.slice(r.start, r.end)}</mark>);
      cursor = Math.max(cursor, r.end);
    }
    if (cursor < text.length) out.push(text.slice(cursor));
    return out;
  };

  const handleSubmit = async (auto = false) => {
    if (!test || submitting) return;
    if (!auto && !confirm("Are you sure you want to submit your test?")) return;
    
    setSubmitting(true);

    const payload = {
      answers: Object.entries(answers).flatMap(([key, userAnswer]) => {
        if (key.includes('_')) {
          const blankNum = parseInt(key.split('_')[1]);
          const q = test.questions.find(q => q.order_number === blankNum);
          return q ? [{ question_id: q.id, user_answer: userAnswer }] : [];
        }
        return [{ question_id: parseInt(key), user_answer: userAnswer }];
      }),
    };

    try {
      const response = await api.post(source.submitUrl, payload);
      localStorage.removeItem(`reading_answers_${testId}`);
      localStorage.removeItem(`reading_timer_${testId}`);
      source.onSubmitted(response.data);
    } catch (err) {
      console.error("Failed to submit test", err);
      alert("Error submitting test. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Exam mode: time is up → hand the paper in automatically.
  useEffect(() => {
    if (source.exam && test && timeLeft === 0 && !submitting) handleSubmit(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, test, source.exam]);

  const renderQuestion = (question: ReadingQuestion, idx: number) => {
    const isTrueFalse = question.question_type === 'tfng' || question.question_type === 'ynng';
    const isShortAnswer = question.question_type === 'short_answer';
    const isInlineBlank = question.question_type === 'sentence_completion' || question.question_type === 'summary_completion';

    if (question.question_type === 'multiple_choice') {
      const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
      const opts = question.options || [];
      return (
        <div>
          <p className="font-medium mb-4">
            <span className="w-7 h-7 bg-primary text-white rounded-full inline-flex items-center justify-center shrink-0 text-sm mr-3">{idx + 1}</span>
            <span data-paragraph-index={10000 + question.order_number}>{renderHighlightedParagraph(question.question_text, highlights[`qs-${question.order_number}`] ?? [])}</span>
          </p>
          <div className="pl-10 space-y-3">
            {opts.map((option, optIdx) => {
              const letter = letters[optIdx];
              const isSelected = answers[`${question.id}`] === letter;
              
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
                  <span>{option}</span>
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
            <span data-paragraph-index={10000 + question.order_number}>{renderHighlightedParagraph(question.question_text, highlights[`qs-${question.order_number}`] ?? [])}</span>
          </p>
          <div className="pl-10 space-y-3">
            {tfOptions.map((opt) => (
              <label key={opt} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg border hover:border-gray-300">
                <input
                  type="radio"
                  name={`q-${question.id}`}
                  value={opt}
                  checked={answers[`${question.id}`] === opt}
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

    // Sentence / Summary Completion — inline blank
    if (isInlineBlank) {
      const parts = question.question_text.split('[BLANK]');
      return (
        <div>
          <p className="font-medium leading-relaxed">
            <span className="w-7 h-7 bg-primary text-white rounded-full inline-flex items-center justify-center shrink-0 text-sm mr-3 align-middle">{idx + 1}</span>
            {parts.map((part, i) => (
              <React.Fragment key={i}>
                <span>{part}</span>
                {i < parts.length - 1 && (
                  <input
                    type="text"
                    value={answers[`${question.id}`] || ""}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="inline-block w-[150px] border-b-2 border-gray-400 focus:border-primary focus:outline-none mx-1 px-1 text-sm bg-transparent align-baseline"
                  />
                )}
              </React.Fragment>
            ))}
          </p>
        </div>
      );
    }

    // Short Answer
    if (isShortAnswer) {
      return (
        <div>
          <p className="font-medium mb-4">
            <span className="w-7 h-7 bg-primary text-white rounded-full inline-flex items-center justify-center shrink-0 text-sm mr-3">{idx + 1}</span>
            <span data-paragraph-index={10000 + question.order_number}>{renderHighlightedParagraph(question.question_text, highlights[`qs-${question.order_number}`] ?? [])}</span>
          </p>
          <div className="pl-10">
            <input
              type="text"
              value={answers[`${question.id}`] || ""}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              placeholder="Type your answer..."
            />
          </div>
        </div>
      );
    }

    // Form / Table completion — multi-blank block
    if (question.question_type === 'form_completion' || question.question_type === 'table_completion') {
      if (/\d+\s*\.{4,}/.test(question.question_text)) {
        const text = question.question_text;
        const re = /(\d+)\s*\.{4,}/g;
        const parts: React.ReactNode[] = [];
        let lastIdx = 0;
        let m: RegExpExecArray | null;
        while ((m = re.exec(text)) !== null) {
          const blankNum = parseInt(m[1]);
          if (m.index > lastIdx) parts.push(<span key={`t${lastIdx}`}>{text.slice(lastIdx, m.index)}</span>);
          const ansKey = `${question.id}_${blankNum}`;
          parts.push(
            <React.Fragment key={`b${blankNum}`}>
              <span className="font-bold text-gray-700">{blankNum}</span>
              <input
                type="text"
                className="inline-block border-b-2 border-gray-400 focus:border-primary outline-none px-1 mx-1 w-28 text-primary font-medium bg-transparent"
                value={answers[ansKey] || ''}
                onChange={(e) => handleAnswerChange(ansKey, e.target.value)}
                placeholder="..."
              />
            </React.Fragment>
          );
          lastIdx = m.index + m[0].length;
        }
        if (lastIdx < text.length) parts.push(<span key="tend">{text.slice(lastIdx)}</span>);
        return <div className="leading-loose text-sm whitespace-pre-wrap">{parts}</div>;
      }
      return (
        <div>
          <p className="font-medium mb-4">
            <span className="w-7 h-7 bg-primary text-white rounded-full inline-flex items-center justify-center shrink-0 text-sm mr-3">{idx + 1}</span>
            <span>{question.question_text}</span>
          </p>
          <div className="pl-10">
            <input
              type="text"
              value={answers[`${question.id}`] || ""}
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
          <span data-paragraph-index={10000 + question.order_number}>{renderHighlightedParagraph(question.question_text, highlights[`qs-${question.order_number}`] ?? [])}</span>
        </p>
        <div className="pl-10">
          <input
            type="text"
            value={answers[`${question.id}`] || ""}
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
          <Link href={source.backHref} className="inline-block mt-4 text-primary hover:underline">
            ← Back
          </Link>
        </div>
      </div>
    );
  }

  const passageLetterMap: Record<number, string> = { 1: 'A', 2: 'B', 3: 'C' };

  const getPassageQuestions = (passage: number) =>
    (test?.questions ?? [])
      .filter(q => q.passage === passageLetterMap[passage])
      .sort((a, b) => a.order_number - b.order_number);

  const navigate = (dir: 'prev' | 'next') => {
    if (!test) return;
    const qs = getPassageQuestions(activePassage);
    const currentIdx = qs.findIndex(q => q.order_number === focusedOrderNumber);
    if (dir === 'next') {
      if (currentIdx === -1 || currentIdx < qs.length - 1) {
        const target = currentIdx === -1 ? qs[0] : qs[currentIdx + 1];
        if (target) setFocusedOrderNumber(target.order_number);
      } else if (activePassage < 3) {
        const nextQs = getPassageQuestions(activePassage + 1);
        setActivePassage(p => p + 1);
        if (nextQs[0]) setFocusedOrderNumber(nextQs[0].order_number);
      }
    } else {
      if (currentIdx > 0) {
        setFocusedOrderNumber(qs[currentIdx - 1].order_number);
      } else if (activePassage > 1) {
        const prevQs = getPassageQuestions(activePassage - 1);
        setActivePassage(p => p - 1);
        const last = prevQs[prevQs.length - 1];
        if (last) setFocusedOrderNumber(last.order_number);
      }
    }
  };

  const passageQuestions = getPassageQuestions(activePassage);

  // A question counts as answered when its box has something in it
  // (multi-blank form/table rows store their value under "<rowId>_<number>").
  const isAnswered = (q: ReadingQuestion) => {
    if ((answers[`${q.id}`] || '').trim()) return true;
    const suffix = `_${q.order_number}`;
    return Object.entries(answers).some(([k, v]) => k.endsWith(suffix) && k.includes('_') && (v || '').trim() !== '');
  };

  const goTo = (passage: number, orderNumber?: number) => {
    setActivePassage(passage);
    if (orderNumber !== undefined) setFocusedOrderNumber(orderNumber);
  };

  // ── Matching headings (drag & drop) ────────────────────────────────────
  // A passage paragraph written as "SECTION 14 — [choose heading]" becomes the drop box
  // for question 14. Without such markers the drop boxes are shown in the questions panel.
  const SECTION_MARK = /^\s*SECTION\s+(\d+)\s*[—–-]\s*\[choose heading\]\s*$/i;
  const headingQs = passageQuestions.filter(q => q.question_type === 'matching_headings');
  const headingOptions = headingQs[0]?.options ?? [];
  const letterOf = (opt: string) => (opt.match(/^([A-Za-z]+)[.)]\s*/)?.[1] ?? opt).toUpperCase();
  const usedHeadings = new Set(headingQs.map(q => answers[`${q.id}`]).filter(Boolean));
  const markedSections = new Set(
    ((activePassage === 1 ? test.passage_a : activePassage === 2 ? test.passage_b : test.passage_c) || '').split('\n\n').map(p => p.match(SECTION_MARK)?.[1]).filter(Boolean).map(Number)
  );

  const placeHeading = (q: ReadingQuestion, letter: string) => {
    setAnswers(prev => {
      const next = { ...prev };
      // each heading can be used once — take it off any other box first
      headingQs.forEach(o => { if (next[`${o.id}`] === letter) next[`${o.id}`] = ''; });
      next[`${q.id}`] = letter;
      return next;
    });
    setPickedHeading(null);
    setFocusedOrderNumber(q.order_number);
  };

  const HeadingDropBox = ({ q }: { q: ReadingQuestion }) => {
    const val = answers[`${q.id}`] || '';
    const label = headingOptions.find(o => letterOf(o) === val);
    return (
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const l = e.dataTransfer.getData('text/plain'); if (l) placeHeading(q, l); }}
        onClick={(e) => {
          e.stopPropagation();
          if (pickedHeading) placeHeading(q, pickedHeading);
          else setFocusedOrderNumber(q.order_number);
        }}
        className={`not-italic font-sans text-base text-left flex items-center gap-3 min-h-[52px] px-3 py-2 rounded-lg border-2 transition-colors cursor-pointer ${
          val ? 'border-[#1a3a5f] bg-blue-50' : pickedHeading ? 'border-dashed border-[#1a3a5f] bg-blue-50/50' : 'border-dashed border-gray-400 bg-white'
        } ${focusedOrderNumber === q.order_number ? 'ring-2 ring-[#1a3a5f]/30' : ''}`}
      >
        <span className="w-7 h-7 shrink-0 rounded border border-gray-400 bg-white text-sm font-bold flex items-center justify-center text-gray-700">{q.order_number}</span>
        {val ? (
          <>
            <span
              draggable
              onDragStart={(e) => e.dataTransfer.setData('text/plain', val)}
              className="flex-1 text-gray-900"
            >{label ?? val}</span>
            <button
              onClick={(e) => { e.stopPropagation(); handleAnswerChange(q.id, ''); }}
              className="text-gray-400 hover:text-red-500 text-sm px-1"
              title="Remove"
            >✕</button>
          </>
        ) : (
          <span className="text-gray-400 text-sm">{pickedHeading ? 'Click to place the heading here' : 'Drag a heading here'}</span>
        )}
      </div>
    );
  };

  const HeadingBank = () => (
    <div className="space-y-4">
      <p className="font-medium">
        Questions {headingQs[0].order_number}–{headingQs[headingQs.length - 1].order_number}
      </p>
      <p className="text-sm text-gray-600">
        Choose the correct heading for each section from the list of headings below.
        {markedSections.size > 0 ? ' Drag a heading into the box above each section of the passage' : ' Drag a heading into a box'} (or click a heading, then click a box).
      </p>
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="font-bold text-sm mb-3">List of Headings</p>
        <div className="space-y-2">
          {headingOptions.map(opt => {
            const l = letterOf(opt);
            if (usedHeadings.has(l)) return null;
            return (
              <div
                key={l}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', l)}
                onClick={(e) => { e.stopPropagation(); setPickedHeading(pickedHeading === l ? null : l); }}
                className={`px-3 py-2 rounded-lg border text-sm cursor-grab active:cursor-grabbing select-none transition-colors ${
                  pickedHeading === l ? 'border-[#1a3a5f] bg-[#1a3a5f] text-white' : 'border-gray-300 bg-gray-50 hover:border-[#1a3a5f]'
                }`}
              >{opt}</div>
            );
          })}
          {usedHeadings.size === headingOptions.length && (
            <p className="text-xs text-gray-400">All headings placed.</p>
          )}
        </div>
      </div>
      {headingQs.filter(q => !markedSections.has(q.order_number)).map(q => (
        <div key={q.id}>
          <p className="text-sm mb-2">{q.question_text}</p>
          <HeadingDropBox q={q} />
        </div>
      ))}
    </div>
  );

  // ── Choose-TWO multiple choice (one group, several question numbers) ───
  // A "Questions 18–19, choose TWO" block is stored as one row per question number.
  // Group consecutive choose-many rows that share the same options; if the first row's
  // text names a range ("Questions 18–19"), that range caps the group size.
  const mcmGroups = (() => {
    const sorted = passageQuestions
      .filter(o => o.question_type === 'multiple_choice_multiple')
      .sort((a, b) => a.order_number - b.order_number);
    const groups: ReadingQuestion[][] = [];
    let cur: ReadingQuestion[] = [];
    let cap = Infinity;
    for (const q of sorted) {
      const prev = cur[cur.length - 1];
      const joins = prev
        && q.order_number === prev.order_number + 1
        && JSON.stringify(q.options || []) === JSON.stringify(prev.options || [])
        && cur.length < cap;
      if (!joins) {
        if (cur.length) groups.push(cur);
        cur = [q];
        const m = q.question_text.match(/Questions?\s+(\d+)\s*[–-]\s*(\d+)/);
        cap = m ? Number(m[2]) - Number(m[1]) + 1 : Infinity;
      } else {
        cur.push(q);
      }
    }
    if (cur.length) groups.push(cur);
    return groups;
  })();
  const groupOf = (q: ReadingQuestion) => mcmGroups.find(g => g.some(x => x.id === q.id)) || [q];

  const MultiChoiceGroup = ({ group }: { group: ReadingQuestion[] }) => {
    const letters = 'ABCDEFGHIJ'.split('');
    const opts = group[0].options || [];
    const selected = group.map(q => answers[`${q.id}`]).filter(Boolean);
    const toggle = (l: string) => {
      let next = selected.includes(l) ? selected.filter(x => x !== l) : selected.length < group.length ? [...selected, l] : selected;
      next = [...next].sort();
      setAnswers(prev => {
        const out = { ...prev };
        group.forEach((q, i) => { out[`${q.id}`] = next[i] || ''; });
        return out;
      });
    };
    const first = group[0].order_number, last = group[group.length - 1].order_number;
    const text = group[0].question_text.replace(/^Questions?\s+[\d–-]+\.?\s*/, '').replace(/\s*Write (TWO|THREE) letters.*$/i, '');
    return (
      <div>
        <p className="font-medium mb-2 flex items-start gap-3">
          <span className="px-2 h-7 bg-primary text-white rounded-full inline-flex items-center justify-center shrink-0 text-sm">{first}–{last}</span>
          <span>{text}</span>
        </p>
        <p className="text-sm text-gray-500 mb-3 pl-1">Choose <strong className="text-gray-700">{group.length === 2 ? 'TWO' : group.length === 3 ? 'THREE' : group.length}</strong> letters. ({selected.length} of {group.length} selected)</p>
        <div className="space-y-2">
          {opts.map((opt, i) => {
            const l = letters[i];
            const on = selected.includes(l);
            const full = !on && selected.length >= group.length;
            return (
              <label key={l} className={`flex items-center gap-3 p-2 rounded-lg border transition-all ${
                on ? 'border-primary bg-primary/10' : full ? 'border-gray-200 opacity-50 cursor-not-allowed' : 'border-gray-200 hover:border-gray-300 cursor-pointer'
              }`}>
                <input type="checkbox" checked={on} disabled={full} onChange={() => toggle(l)} className="w-4 h-4 accent-[#1a3a5f]" />
                <span className="font-bold">{l}.</span>
                <span>{opt}</span>
              </label>
            );
          })}
        </div>
      </div>
    );
  };
  const currentQIdx = passageQuestions.findIndex(q => q.order_number === focusedOrderNumber);
  const isPrevDisabled = activePassage === 1 && currentQIdx <= 0;
  const isNextDisabled = activePassage === 3 &&
    currentQIdx === passageQuestions.length - 1 && currentQIdx >= 0;

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
          {source.subtitle && (<><div className="h-6 w-[1px] bg-white/30"></div><div className="text-sm text-gray-300">{(test as any).mock_number ? `Mock ${(test as any).mock_number}` : source.subtitle}</div></>)}
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
            <h1 className="text-2xl font-bold text-center mb-8">
              {activePassage === 1 ? test.passage_a_title : activePassage === 2 ? test.passage_b_title : test.passage_c_title}
            </h1>
            {paragraphs.map((paragraph, i) => {
              const sec = paragraph.match(SECTION_MARK)?.[1];
              const hq = sec ? headingQs.find(q => q.order_number === Number(sec)) : undefined;
              if (hq) {
                return (
                  <div key={i} className="mb-4 mt-2">
                    <HeadingDropBox q={hq} />
                  </div>
                );
              }
              return (
                <p key={i} data-paragraph-index={i} className="mb-6 indent-8">
                  {renderHighlightedParagraph(paragraph, highlights[`${activePassage}-${i}`] ?? [])}
                </p>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Questions */}
        <div className="flex-1 flex flex-col bg-white m-2 rounded-xl shadow-sm overflow-hidden ml-0">
          <div className="bg-gray-100 px-6 py-3 border-b border-gray-200 shrink-0">
            <h2 className="font-bold text-gray-800">Questions</h2>
          </div>
          <div className={`p-8 overflow-y-auto ${fontSize} text-gray-800 space-y-8`} onMouseUp={handleMouseUp}>
            {passageQuestions.length > 0 && (() => {
              const qNums = passageQuestions.map(q => q.order_number);
              const min = Math.min(...qNums);
              const max = Math.max(...qNums);
              return (
                <p className="text-sm text-gray-600 italic border-l-4 border-primary/40 pl-3 py-1 bg-blue-50/50 rounded-r">
                  You should spend about 20 minutes on <strong>Questions {min}–{max}</strong>, which are based on Reading Passage {activePassage}.
                </p>
              );
            })()}
            {passageQuestions.map((question) => {
              if (question.question_type === 'matching_headings') {
                if (question.id !== headingQs[0]?.id) return null;
                return (
                  <div key={question.id} ref={el => { questionRefs.current[question.id] = el; }}
                    className="p-4 rounded-xl border bg-blue-50/30 border-blue-100">
                    <HeadingBank />
                  </div>
                );
              }
              if (question.question_type === 'multiple_choice_multiple') {
                const group = groupOf(question);
                if (question.id !== group[0].id) return null;
                return (
                  <div key={question.id} ref={el => { group.forEach(g => { questionRefs.current[g.id] = el; }); }}
                    onClick={() => setFocusedOrderNumber(question.order_number)}
                    className={`p-4 rounded-xl border transition-all ${
                      group.some(g => g.order_number === focusedOrderNumber) ? 'bg-blue-50 border-l-4 border-primary' : 'bg-blue-50/30 border-blue-100 hover:border-blue-200'
                    }`}>
                    <MultiChoiceGroup group={group} />
                  </div>
                );
              }
              return (
              <div
                key={question.id}
                ref={el => { questionRefs.current[question.id] = el; }}
                onClick={() => setFocusedOrderNumber(question.order_number)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  focusedOrderNumber === question.order_number
                    ? 'bg-blue-50 border-l-4 border-primary'
                    : 'bg-blue-50/30 border-blue-100 hover:border-blue-200'
                }`}
              >
                {renderQuestion(question, question.order_number - 1)}
              </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Bottom navigator — Inspera style: one block per passage; the active one expands
          into question numbers, answered numbers get a green bar, the current one is outlined. */}
      <footer className="bg-white border-t border-gray-300 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex items-stretch">
        <div className="flex-1 flex items-stretch min-w-0">
          {[1, 2, 3].map((pn) => {
            const qs = getPassageQuestions(pn);
            const done = qs.filter(isAnswered).length;
            const active = pn === activePassage;
            const complete = qs.length > 0 && done === qs.length;
            return (
              <div key={pn} className={`flex items-center min-w-0 ${active ? 'flex-[3]' : 'flex-1'} border-r border-gray-100 last:border-r-0`}>
                <button
                  onClick={() => goTo(pn, qs[0]?.order_number)}
                  className={`flex items-center gap-2 px-5 h-full shrink-0 transition-colors ${active ? 'font-bold text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  {complete && <Check className="w-4 h-4 text-green-600" />}
                  <span>Passage {pn}</span>
                  {!active && <span className="text-gray-500 font-normal text-sm ml-1">{done} of {qs.length}</span>}
                </button>
                {active && (
                  <div className="flex items-center gap-0.5 overflow-x-auto py-2 pr-3">
                    {qs.map((q) => {
                      const answered = isAnswered(q);
                      const current = focusedOrderNumber === q.order_number;
                      return (
                        <button
                          key={q.id}
                          onClick={() => goTo(pn, q.order_number)}
                          title={answered ? `Question ${q.order_number} — answered` : `Question ${q.order_number}`}
                          className={`relative min-w-[30px] h-9 px-1 text-sm rounded transition-colors ${
                            current ? 'border-2 border-[#1a3a5f] font-bold text-[#1a3a5f]' : 'border-2 border-transparent text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <span className={`absolute left-1 right-1 -top-2 h-1 rounded-full ${answered ? 'bg-green-600' : 'bg-gray-200'}`} />
                          {q.order_number}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2 px-4 border-l border-gray-200 shrink-0">
          <button
            onClick={() => navigate('prev')}
            disabled={isPrevDisabled}
            className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Previous question"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('next')}
            disabled={isNextDisabled}
            className="w-10 h-10 flex items-center justify-center bg-[#1a3a5f] hover:bg-[#244b78] text-white rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Next question"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleSubmit()}
            disabled={submitting}
            className="flex items-center gap-2 px-5 h-10 ml-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold transition-colors shadow-sm disabled:opacity-50"
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
