"use client";

import { Fragment, ReactNode, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useVolume } from "@/lib/volume";
import type { ExamSource } from "./types";
import QuestionBlock, { type QuestionBlockData } from "./QuestionBlock";
import { Clock, Headphones, CheckSquare, Play, Check, ChevronLeft, ChevronRight, Volume2 } from "lucide-react";
import Link from "next/link";

interface ListeningQuestion {
  id: number;
  section: number;
  question_type: string;
  question_text: string;
  correct_answer: string;
  options?: string[];
  order_number: number;
  question_group?: string;
  group?: number | null;
}

interface ListeningTest {
  id: number;
  title: string;
  book_number: number;
  test_number: number;
  audio_url: string;
  transcript: string;
  questions: ListeningQuestion[];
  groups?: (QuestionBlockData & { section_number: number | null })[];
}

export default function ListeningExam({ source }: { source: ExamSource }) {
  const id = source.storageKey;
  const [test, setTest] = useState<ListeningTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(40 * 60);
  // Exam mode (mock): the recording plays once; when it ends a short review period starts.
  const [reviewSeconds, setReviewSeconds] = useState(2 * 60);
  const [phase, setPhase] = useState<'ready' | 'blocked' | 'playing' | 'review'>('ready');
  const [activePart, setActivePart] = useState(1);
  const [focusedNumber, setFocusedNumber] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { volume } = useVolume();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    if (id) {
      const fetchTest = async () => {
        try {
          const res = await api.get(source.fetchUrl);
          setTest(res.data);
          if (typeof res.data.seconds_left === 'number') setTimeLeft(res.data.seconds_left);
          if (typeof res.data.review_seconds === 'number' && res.data.review_seconds > 0) setReviewSeconds(res.data.review_seconds);
        } catch (err: any) {
          console.error("Failed to fetch listening test", err);
          setError("Could not load the test. Please try again later.");
        } finally {
          setLoading(false);
        }
      };
      fetchTest();
    }
  }, [id, source.fetchUrl]);

  useEffect(() => {
    if (!id) return;
    const saved = localStorage.getItem(`listening_answers_${id}`);
    if (saved) { try { setAnswers(JSON.parse(saved)); } catch {} }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    localStorage.setItem(`listening_answers_${id}`, JSON.stringify(answers));
  }, [answers, id]);

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

  const handleAnswerChange = (key: string | number, value: string) => {
    setAnswers((prev) => ({ ...prev, [String(key)]: value }));
  };

  const handleSubmit = async (auto = false) => {
    if (!test || submitting) return;
    if (!auto && source.exam && !confirm("Submit your Listening answers? You cannot return to this section.")) return;
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
      localStorage.removeItem(`listening_answers_${id}`);
      source.onSubmitted(response.data);
    } catch (err) {
      console.error("Failed to submit test", err);
      alert("Error submitting test. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Exam mode: hard time limit, and the 2-minute review countdown after the recording ends.
  useEffect(() => {
    if (!source.exam || !test) return;
    if (timeLeft === 0 && !submitting) handleSubmit(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, test, source.exam]);

  useEffect(() => {
    if (!source.exam || phase !== 'review') return;
    if (reviewSeconds <= 0) { handleSubmit(true); return; }
    const t = setTimeout(() => setReviewSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, reviewSeconds, source.exam]);

  const startRecording = () => {
    const el = audioRef.current;
    if (!el) return;
    el.play().then(() => setPhase('playing')).catch(() => setPhase('blocked'));
  };

  // Exam mode: the recording starts by itself as soon as the section opens (the student already
  // pressed Start in the lobby). If the browser blocks autoplay, a single "Start audio" button appears.
  useEffect(() => {
    if (!source.exam || !test?.audio_url || phase !== 'ready') return;
    const t = setTimeout(startRecording, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test, source.exam]);

  const renderQuestion = (question: ListeningQuestion, idx: number) => {
    // Drag & Drop — inline drop zone + word bank
    if (question.question_type === 'drag_drop') {
      const currentAnswer = answers[`${question.id}`] || '';
      const wordBank = question.options || [];
      const BLANK_RE = /_{3,}|\[BLANK\]/;
      const parts = question.question_text.split(BLANK_RE);
      const hasBlank = parts.length > 1;

      const dropZone = (
        <span
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleAnswerChange(question.id, e.dataTransfer.getData('text/plain'));
          }}
          className={`inline-flex items-center gap-1 mx-1 px-3 py-0.5 rounded border-2 border-dashed text-sm align-middle transition-colors ${
            currentAnswer
              ? 'border-purple-400 bg-purple-50'
              : 'border-gray-400 bg-white min-w-[80px]'
          }`}
        >
          {currentAnswer ? (
            <>
              <span className="text-purple-700 font-medium">{currentAnswer}</span>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleAnswerChange(question.id, '')}
                className="text-gray-400 hover:text-red-500 leading-none"
              >
                ×
              </button>
            </>
          ) : (
            <span className="text-gray-400 italic">drop here</span>
          )}
        </span>
      );

      return (
        <div>
          <p className="font-medium text-gray-900 mb-4 leading-relaxed">
            {idx + 1}.{' '}
            {hasBlank ? (
              <>
                {parts[0]}{dropZone}{parts.slice(1).join('')}
              </>
            ) : (
              <>{question.question_text} {dropZone}</>
            )}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {wordBank.map((word, wIdx) => {
              const used = currentAnswer === word;
              return (
                <span
                  key={wIdx}
                  draggable={!used}
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', word)}
                  className={`rounded-full px-3 py-1 text-sm border select-none transition-opacity ${
                    used
                      ? 'bg-gray-100 border-gray-200 text-gray-300 opacity-40 cursor-not-allowed'
                      : 'bg-gray-100 border-gray-200 text-gray-700 cursor-grab hover:bg-purple-50 hover:border-purple-300'
                  }`}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </div>
      );
    }

    // Selection Grid — lettered option grid
    if (question.question_type === 'selection_grid') {
      const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
      const wordBank = question.options || [];
      return (
        <div>
          <p className="font-medium text-gray-900 mb-3">
            {idx + 1}. {question.question_text}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
            {wordBank.map((option, optIdx) => {
              const letter = letters[optIdx];
              const isSelected = answers[`${question.id}`] === letter;
              return (
                <button
                  key={optIdx}
                  onClick={() => handleAnswerChange(question.id, letter)}
                  className={`p-3 text-left border rounded-lg ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50 text-purple-700 ring-2 ring-purple-200'
                      : 'border-gray-200 bg-white text-gray-900 hover:border-purple-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-bold mr-2">{letter}.</span>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    const isTrueFalse = question.question_type === 'tfng' || question.question_type === 'ynng';
    const isFormCompletion = question.question_type === 'form_completion' || question.question_type === 'table_completion' || question.question_type === 'short_answer';

    if (question.question_type === 'multiple_choice') {
      // Inspera style: number in a bordered square, full-width radio rows, selected row light blue
      const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      const opts = question.options || [];
      return (
        <div>
          <p className="text-gray-900 mb-2 flex items-start gap-2">
            <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-1 border border-gray-500 rounded-sm font-bold text-sm">{question.order_number}</span>
            <span className="pt-0.5">{question.question_text}</span>
          </p>
          <div className="space-y-1">
            {opts.map((option, optIdx) => {
              const letter = letters[optIdx];
              const isSelected = answers[`${question.id}`] === letter;
              return (
                <label key={optIdx}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded cursor-pointer ${isSelected ? 'bg-[#bbd7f0]' : 'hover:bg-gray-100'}`}>
                  <input type="radio" name={`q-${question.id}`} checked={isSelected}
                    onChange={() => handleAnswerChange(question.id, letter)} className="w-4 h-4 accent-[#1a3a5f]" />
                  <span>{option}</span>
                </label>
              );
            })}
          </div>
        </div>
      );
    }

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
                  answers[`${question.id}`] === opt.value
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

    if (isFormCompletion) {
      if ((question.question_type === 'form_completion' || question.question_type === 'table_completion') && /\d+\s*\.{4,}/.test(question.question_text)) {
        const text = question.question_text;
        const re = /(\d+)\s*\.{4,}/g;
        const parts: ReactNode[] = [];
        let lastIdx = 0;
        let m: RegExpExecArray | null;
        while ((m = re.exec(text)) !== null) {
          const blankNum = parseInt(m[1]);
          if (m.index > lastIdx) parts.push(<span key={`t${lastIdx}`}>{text.slice(lastIdx, m.index)}</span>);
          const ansKey = `${question.id}_${blankNum}`;
          parts.push(
            <Fragment key={`b${blankNum}`}>
              <span className="font-bold text-gray-700">{blankNum}</span>
              <input
                type="text"
                className="inline-block border-b-2 border-gray-400 focus:border-purple-500 outline-none px-1 mx-1 w-28 text-purple-700 font-medium bg-transparent"
                value={answers[ansKey] || ''}
                onChange={(e) => handleAnswerChange(ansKey, e.target.value)}
                placeholder="..."
              />
            </Fragment>
          );
          lastIdx = m.index + m[0].length;
        }
        if (lastIdx < text.length) parts.push(<span key="tend">{text.slice(lastIdx)}</span>);
        return <div className="leading-loose text-gray-900 text-sm whitespace-pre-wrap">{parts}</div>;
      }
      return (
        <div>
          <p className="font-medium text-gray-900 mb-3">
            {idx + 1}. {question.question_text}
          </p>
          <input
            type="text"
            placeholder="Type your answer here..."
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={answers[`${question.id}`] || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          />
        </div>
      );
    }

    return (
      <div>
        <p className="font-medium text-gray-900 mb-3">
          {idx + 1}. {question.question_text}
        </p>
        <input
          type="text"
          placeholder="Type your answer here..."
          className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          value={answers[`${question.id}`] || ""}
          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
        />
      </div>
    );
  };

  const renderMatchingTable = (matchingQuestions: ListeningQuestion[]) => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
    const optionLabels = matchingQuestions[0]?.options || [];

    return (
      <div>
        <div className="mb-4 flex flex-wrap gap-x-6 gap-y-1">
          {optionLabels.map((opt, i) => (
            <span key={i} className="text-sm text-gray-600">
              <span className="font-bold text-gray-800">{letters[i]}.</span> {opt}
            </span>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left py-2 px-3 font-semibold text-gray-700 border border-gray-200">Question</th>
                {optionLabels.map((_, i) => (
                  <th key={i} className="text-center py-2 px-3 font-semibold text-gray-700 border border-gray-200 w-12">
                    {letters[i]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matchingQuestions.map((question) => {
                const selected = answers[`${question.id}`];
                return (
                  <tr key={question.id} className="hover:bg-gray-50">
                    <td className="py-3 px-3 text-gray-900 border border-gray-200">
                      {question.order_number}. {question.question_text}
                    </td>
                    {optionLabels.map((_, i) => {
                      const letter = letters[i];
                      return (
                        <td key={i} className="py-3 px-3 text-center border border-gray-200">
                          <input
                            type="radio"
                            name={`matching-${question.id}`}
                            checked={selected === letter}
                            onChange={() => handleAnswerChange(question.id, letter)}
                            className="w-4 h-4 accent-purple-600 cursor-pointer"
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
          <Link href={source.backHref} className="inline-block mt-4 text-purple-600 hover:underline">
            ← Back
          </Link>
        </div>
      </div>
    );
  }

  const parts = [1, 2, 3, 4].filter(p => (test.questions || []).some(q => q.section === p));
  const partQs = (p: number) => (test.questions || []).filter(q => q.section === p).sort((a, b) => a.order_number - b.order_number);
  const isAnswered = (q: ListeningQuestion) => {
    if ((answers[`${q.id}`] || '').trim()) return true;
    const suffix = `_${q.order_number}`;
    return Object.entries(answers).some(([k, v]) => k.includes('_') && k.endsWith(suffix) && (v || '').trim() !== '');
  };
  const goTo = (p: number, n?: number) => {
    if (p !== activePart) { setActivePart(p); scrollRef.current?.scrollTo({ top: 0 }); }
    if (n !== undefined) {
      setFocusedNumber(n);
      setTimeout(() => {
        const el = document.querySelector(`[data-q="${n}"]`) as HTMLElement | null
          ?? (document.querySelector(`[data-gap="${n}"]`) as HTMLElement | null);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  };
  const allNumbers = parts.flatMap(p => partQs(p).map(q => ({ p, n: q.order_number })));
  const curIdx = allNumbers.findIndex(x => x.n === focusedNumber);
  const step = (d: 1 | -1) => {
    const next = allNumbers[curIdx === -1 ? 0 : Math.min(Math.max(curIdx + d, 0), allNumbers.length - 1)];
    if (next) goTo(next.p, next.n);
  };

  const renderPart = (section: number) => {
    const qs = partQs(section);
    const first = qs[0]?.order_number, last = qs[qs.length - 1]?.order_number;
    const grouped: Array<ListeningQuestion | ListeningQuestion[] | QuestionBlockData> = [];
    const seenBlocks = new Set<number>();
    let i = 0;
    while (i < qs.length) {
      const q = qs[i];
      if (q.group) {
        if (!seenBlocks.has(q.group)) {
          seenBlocks.add(q.group);
          const b = test.groups?.find(g => g.id === q.group);
          if (b) grouped.push(b);
        }
        i++;
        continue;
      }
      if (q.question_type === 'matching' && q.question_group) {
        const group: ListeningQuestion[] = [q];
        let j = i + 1;
        while (j < qs.length && qs[j].question_type === 'matching' && qs[j].question_group === q.question_group) { group.push(qs[j]); j++; }
        grouped.push(group);
        i = j;
      } else { grouped.push(q); i++; }
    }
    // consecutive plain questions (e.g. MCQ 31–32) get one "Questions x–y" heading
    const out: ReactNode[] = [];
    let k = 0;
    while (k < grouped.length) {
      const item = grouped[k];
      if (!Array.isArray(item) && 'content' in item) {
        out.push(
          <section key={`block-${item.id}`}>
            <QuestionBlock
              block={item}
              questionIdFor={(n) => qs.find(x => x.order_number === n)?.id}
              answers={answers}
              setAnswer={(qid, v) => handleAnswerChange(qid, v)}
              focusedNumber={focusedNumber}
              onFocusNumber={(n) => setFocusedNumber(n)}
            />
          </section>
        );
        k++; continue;
      }
      if (Array.isArray(item)) {
        out.push(<section key={`m-${item[0].id}`}>{renderMatchingTable(item)}</section>);
        k++; continue;
      }
      const run: ListeningQuestion[] = [];
      while (k < grouped.length && !Array.isArray(grouped[k]) && !('content' in (grouped[k] as object))) { run.push(grouped[k] as ListeningQuestion); k++; }
      out.push(
        <section key={`run-${run[0].id}`} className="space-y-6">
          <div>
            <p className="font-bold">Questions {run[0].order_number}{run.length > 1 ? `–${run[run.length - 1].order_number}` : ''}</p>
            {run.every(r => r.question_type === 'multiple_choice') && <p className="text-sm text-gray-700 mt-1">Choose the correct answer.</p>}
          </div>
          {run.map(q => (
            <div key={q.id} data-q={q.order_number} onClick={() => setFocusedNumber(q.order_number)}
              className={`rounded-lg p-3 -m-3 ${focusedNumber === q.order_number ? 'bg-blue-50/60' : ''}`}>
              {renderQuestion(q, q.order_number)}
            </div>
          ))}
        </section>
      );
    }
    return (
      <div className="space-y-10">
        <div className="bg-[#f1f1ec] border border-gray-300 rounded px-5 py-3">
          <p className="font-bold">Part {section}</p>
          <p className="text-gray-700">Listen and answer questions {first}–{last}.</p>
        </div>
        {out}
      </div>
    );
  };

  const statusText = !source.exam ? null
    : phase === 'playing' ? 'Audio is playing'
    : phase === 'review' ? `Review time ${formatTime(reviewSeconds)}`
    : phase === 'blocked' ? 'Audio waiting to start'
    : 'Starting audio…';

  return (
    <div className="h-screen overflow-hidden bg-white flex flex-col font-sans text-gray-900">
      {/* Header */}
      <header className="bg-[#1a3a5f] text-[#ffffff] flex items-center justify-between px-6 h-14 shrink-0 shadow-md z-10">
        <div className="flex items-center gap-4">
          <div className="font-bold text-xl tracking-wide">IELTS</div>
          <div className="h-6 w-[1px] bg-[#ffffff4d]" />
          <div className="text-sm">Listening</div>
          <div className="h-6 w-[1px] bg-[#ffffff4d]" />
          <div className="text-sm text-[#cbd5e1]">
            {(test as any).mock_number ? `Mock ${(test as any).mock_number}` : source.subtitle ?? `Book ${test.book_number} • Test ${test.test_number}`}
          </div>
          {statusText && (
            <div className="flex items-center gap-2 text-sm text-[#cbd5e1] ml-2">
              <Volume2 className="w-4 h-4" /> {statusText}
            </div>
          )}
        </div>
        <div className={`flex items-center gap-2 tabular-nums text-base font-semibold ${timeLeft < 300 ? 'text-[#fca5a5]' : 'text-[#ffffff]'}`}>
          <Clock className="w-4 h-4" /> {formatTime(timeLeft)} left
        </div>
      </header>

      {/* Audio */}
      {test.audio_url && source.exam && (
        <audio ref={audioRef} className="hidden" onEnded={() => setPhase('review')} preload="auto">
          <source src={test.audio_url} type="audio/mpeg" />
        </audio>
      )}
      {source.exam && phase === 'blocked' && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 max-w-md text-center shadow-2xl">
            <Headphones className="w-10 h-10 mx-auto mb-3 text-[#1a3a5f]" />
            <p className="font-bold text-lg mb-2">Put your headphones on</p>
            <p className="text-sm text-gray-600 mb-5">Your browser needs one click before it plays sound. The recording plays once and cannot be paused.</p>
            <button onClick={startRecording} className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1a3a5f] text-[#ffffff] rounded font-bold hover:bg-[#244b78]">
              <Play className="w-4 h-4" /> Start audio
            </button>
          </div>
        </div>
      )}

      {/* Questions — one part at a time, full width */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-6xl px-8 py-6">
          {!source.exam && test.audio_url && (
            <div className="mb-6 p-3 bg-gray-100 rounded-xl border border-gray-200">
              <audio ref={audioRef} controls className="w-full"><source src={test.audio_url} type="audio/mpeg" /></audio>
            </div>
          )}
          {parts.includes(activePart) ? renderPart(activePart) : null}
        </div>
      </main>

      {/* Bottom navigator */}
      <footer className="bg-white border-t border-gray-300 shrink-0 flex items-stretch h-16">
        <div className="flex-1 flex items-stretch min-w-0">
          {parts.map((p) => {
            const qs = partQs(p);
            const done = qs.filter(isAnswered).length;
            const active = p === activePart;
            return (
              <div key={p} className={`flex items-center min-w-0 ${active ? 'flex-[3]' : 'flex-1'}`}>
                <button onClick={() => goTo(p)} className={`flex items-center gap-2 px-5 h-full shrink-0 ${active ? 'font-bold' : 'text-gray-700 hover:bg-gray-50'}`}>
                  {qs.length > 0 && done === qs.length && <Check className="w-4 h-4 text-green-600" />}
                  <span>Part {p}</span>
                  {!active && <span className="text-gray-500 font-normal text-sm ml-1">{done} of {qs.length}</span>}
                </button>
                {active && (
                  <div className="flex items-center gap-0.5 overflow-x-auto py-2 pr-3">
                    {qs.map((q) => {
                      const ans = isAnswered(q);
                      const cur = focusedNumber === q.order_number;
                      return (
                        <button key={q.id} onClick={() => goTo(p, q.order_number)}
                          className={`relative min-w-[30px] h-9 px-1 text-sm rounded ${cur ? 'border-2 border-[#1a3a5f] font-bold text-[#1a3a5f]' : 'border-2 border-transparent text-gray-700 hover:bg-gray-100'}`}>
                          <span className={`absolute left-1 right-1 -top-2 h-1 rounded-full ${ans ? 'bg-green-600' : 'bg-gray-200'}`} />
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
          <button onClick={() => step(-1)} className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded" title="Previous question">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => step(1)} className="w-10 h-10 flex items-center justify-center bg-[#1a3a5f] hover:bg-[#244b78] text-[#ffffff] rounded" title="Next question">
            <ChevronRight className="w-5 h-5" />
          </button>
          <button onClick={() => handleSubmit()} disabled={submitting}
            className="flex items-center gap-2 px-5 h-10 ml-2 bg-green-600 hover:bg-green-700 text-[#ffffff] rounded font-bold disabled:opacity-50">
            <CheckSquare className="w-5 h-5" /> {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </footer>
    </div>
  );
}
