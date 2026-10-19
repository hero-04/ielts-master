"use client";

/**
 * Renders a "question block": HTML written exactly like the paper (form, table, notes,
 * flow-chart, map…) with gaps marked [[N]]. Each gap becomes a live input (or a drop box
 * when the block has a word bank). Inputs are mounted into the HTML with React portals,
 * so the layout is pure HTML/CSS while answers stay in React state like every other question.
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface QuestionBlockData {
  id: number;
  part: string;
  order: number;
  title: string;
  instructions: string;
  content: string;
  word_bank: string[];
}

interface Props {
  block: QuestionBlockData;
  /** question id for a gap number in this block */
  questionIdFor: (n: number) => number | undefined;
  answers: Record<string, string>;
  setAnswer: (questionId: number, value: string) => void;
  focusedNumber?: number | null;
  onFocusNumber?: (n: number) => void;
}

const GAP_RE = /\[\[(\d+)\]\]/g;
const letterOf = (opt: string) => (opt.trim().match(/^([A-Za-z]{1,2})[\s.)]/)?.[1] ?? opt.trim()).toUpperCase();
const textOf = (opt: string) => opt.trim().replace(/^([A-Za-z]{1,2})[\s.)]+/, "");

export default function QuestionBlock({ block, questionIdFor, answers, setAnswer, focusedNumber, onFocusNumber }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [slots, setSlots] = useState<{ n: number; el: HTMLElement }[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const hasBank = block.word_bank.length > 0;

  const html = useMemo(
    () => block.content.replace(GAP_RE, '<span class="gap-slot" data-gap="$1"></span>'),
    [block.content]
  );

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const els = Array.from(host.querySelectorAll<HTMLElement>("[data-gap]"));
    setSlots(els.map((el) => ({ n: Number(el.dataset.gap), el })));
  }, [html]);

  // Scroll the gap into view when it is selected from the bottom navigator.
  useEffect(() => {
    if (focusedNumber == null) return;
    const s = slots.find((x) => x.n === focusedNumber);
    s?.el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusedNumber, slots]);

  const gapNumbers = slots.map((s) => s.n);
  const used = new Set(
    gapNumbers.map((n) => {
      const id = questionIdFor(n);
      return id ? answers[`${id}`] : "";
    }).filter(Boolean)
  );

  const place = (n: number, letter: string) => {
    // each option once per block (IELTS rule for these tasks)
    gapNumbers.forEach((m) => {
      const id = questionIdFor(m);
      if (id && answers[`${id}`] === letter && m !== n) setAnswer(id, "");
    });
    const id = questionIdFor(n);
    if (id) setAnswer(id, letter);
    setPicked(null);
    onFocusNumber?.(n);
  };

  const renderGap = (n: number) => {
    const id = questionIdFor(n);
    if (!id) return <span className="gap-missing">[{n}]</span>;
    const val = answers[`${id}`] || "";
    const focused = focusedNumber === n;

    if (!hasBank) {
      return (
        <input
          type="text"
          value={val}
          placeholder={String(n)}
          onFocus={() => onFocusNumber?.(n)}
          onChange={(e) => setAnswer(id, e.target.value)}
          className={`gap-input ${focused ? "gap-focused" : ""}`}
          autoComplete="off"
          spellCheck={false}
        />
      );
    }
    const opt = block.word_bank.find((o) => letterOf(o) === val);
    return (
      <span
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const l = e.dataTransfer.getData("text/plain"); if (l) place(n, l); }}
        onClick={() => (picked ? place(n, picked) : onFocusNumber?.(n))}
        className={`gap-drop ${val ? "gap-filled" : ""} ${picked && !val ? "gap-ready" : ""} ${focused ? "gap-focused" : ""}`}
      >
        {val ? (
          <>
            <span draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", val)}>{opt ? textOf(opt) : val}</span>
            <button type="button" className="gap-clear" onClick={(e) => { e.stopPropagation(); setAnswer(id, ""); }} title="Remove">✕</button>
          </>
        ) : (
          <span className="gap-num">{n}</span>
        )}
      </span>
    );
  };

  return (
    <div className="space-y-3">
      {block.title && <p className="font-bold">{block.title}</p>}
      {block.instructions && <p className="text-sm text-gray-700 whitespace-pre-line">{block.instructions}</p>}
      <div ref={hostRef} className="exam-html" dangerouslySetInnerHTML={{ __html: html }} />
      {slots.map((s) => createPortal(renderGap(s.n), s.el, `gap-${block.id}-${s.n}`))}
      {hasBank && (
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <div className="flex flex-wrap gap-2">
            {block.word_bank.map((o) => {
              const l = letterOf(o);
              if (used.has(l)) return null;
              return (
                <span
                  key={l}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", l)}
                  onClick={() => setPicked(picked === l ? null : l)}
                  className={`px-3 py-1.5 rounded-lg border text-sm cursor-grab active:cursor-grabbing select-none transition-colors ${
                    picked === l ? "border-[#1a3a5f] bg-[#1a3a5f] text-[#ffffff]" : "border-gray-300 bg-gray-50 hover:border-[#1a3a5f]"
                  }`}
                >
                  {textOf(o)}
                </span>
              );
            })}
            {used.size >= block.word_bank.length && <span className="text-xs text-gray-400">All options placed.</span>}
          </div>
        </div>
      )}
    </div>
  );
}
