"use client";

import { useParams, useRouter } from "next/navigation";
import ReadingExam from "@/components/exam/ReadingExam";

export default function ReadingTestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params?.id as string;

  return (
    <ReadingExam
      source={{
        fetchUrl: `/reading/tests/${testId}/`,
        submitUrl: `/reading/tests/${testId}/submit/`,
        storageKey: testId,
        backHref: "/reading",
        onSubmitted: (data) => {
          alert("Test submitted!");
          router.push(data.attempt_id ? `/reading/results/${data.attempt_id}` : "/reading");
        },
      }}
    />
  );
}
