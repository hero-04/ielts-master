"use client";

import { useParams } from "next/navigation";
import ListeningExam from "@/components/exam/ListeningExam";

export default function ListeningTestPage() {
  const { id } = useParams();
  const testId = String(id);

  return (
    <ListeningExam
      source={{
        fetchUrl: `/listening/tests/${testId}/`,
        submitUrl: `/listening/tests/${testId}/submit/`,
        storageKey: testId,
        backHref: "/listening",
        onSubmitted: (data) => {
          alert("Test submitted!");
          if (data.attempt_id) window.location.href = `/listening/results/${data.attempt_id}`;
        },
      }}
    />
  );
}
