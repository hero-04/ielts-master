"use client";

/**
 * Text highlighting for any exam screen: select text with the mouse → "Highlight" button.
 * Click a highlight to remove it. Works on plain React text and on question-block HTML alike,
 * because it wraps the selected text nodes in <mark class="exam-hl">. Inputs, drop boxes and
 * draggable options are never touched.
 */
import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { Highlighter } from "lucide-react";

const SKIP = "input, textarea, button, select, [draggable='true'], .gap-drop, .gap-slot";

function wrapRange(range: Range) {
  const root = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
    ? range.commonAncestorContainer.parentNode!
    : range.commonAncestorContainer;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) {
    const t = n as Text;
    if (!t.data.trim() || !range.intersectsNode(t)) continue;
    if ((t.parentElement as Element | null)?.closest(SKIP)) continue;
    if ((t.parentElement as Element | null)?.closest("mark.exam-hl")) continue;
    nodes.push(t);
  }
  for (const t of nodes) {
    let start = 0, end = t.data.length;
    if (t === range.startContainer) start = range.startOffset;
    if (t === range.endContainer) end = range.endOffset;
    if (start >= end) continue;
    let target = t;
    if (start > 0) target = target.splitText(start);
    if (end - start < target.data.length) target.splitText(end - start);
    const mark = document.createElement("mark");
    mark.className = "exam-hl";
    target.parentNode!.insertBefore(mark, target);
    mark.appendChild(target);
  }
}

function unwrap(mark: HTMLElement) {
  const parent = mark.parentNode!;
  while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
  parent.removeChild(mark);
  (parent as Element).normalize?.();
}

export function useHighlighter() {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const rangeRef = useRef<Range | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pos) return;
    // React listens on `document` in the App Router, so stopPropagation can't shield the toolbar:
    // check the target instead.
    const close = (e: MouseEvent) => {
      if (toolbarRef.current?.contains(e.target as Node)) return;
      setPos(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [pos]);

  const onMouseUp = (e: ReactMouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest(SKIP)) return;
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && sel.rangeCount) {
      const r = sel.getRangeAt(0);
      const box = r.getBoundingClientRect();
      rangeRef.current = r.cloneRange();
      setPos({ top: Math.max(box.top - 44, 8), left: box.left + box.width / 2 });
      return;
    }
    const mark = target.closest("mark.exam-hl") as HTMLElement | null;
    if (mark) unwrap(mark);
  };

  const apply = () => {
    if (rangeRef.current) wrapRange(rangeRef.current);
    window.getSelection()?.removeAllRanges();
    rangeRef.current = null;
    setPos(null);
  };

  const toolbar = pos ? (
    <div
      ref={toolbarRef}
      onMouseDown={(e) => { e.preventDefault(); }}
      style={{ position: "fixed", top: pos.top, left: pos.left, transform: "translateX(-50%)", zIndex: 50 }}
      className="bg-gray-900 text-[#ffffff] rounded-lg shadow-xl px-1 py-1 select-none"
    >
      <button onClick={apply} className="flex items-center gap-1.5 px-3 py-1 rounded hover:bg-gray-700 text-sm font-medium">
        <Highlighter className="w-3.5 h-3.5 text-yellow-300" /> Highlight
      </button>
    </div>
  ) : null;

  return { onMouseUp, toolbar };
}
