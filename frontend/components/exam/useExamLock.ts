"use client";

import { useEffect } from "react";

/**
 * Mock exam mode: the student cannot leave a section before its time is up (as in Inspera).
 * - the browser Back button does nothing
 * - closing / reloading the tab asks for confirmation (the server clock keeps running anyway,
 *   and the section resumes where it was)
 * The section is handed in automatically when its timer ends; the caller then navigates away.
 */
export function useExamLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    const onPopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("popstate", onPopState);
    };
  }, [active]);
}
