"use client";

import { useParams, useRouter } from "next/navigation";
import ReadingExam from "@/components/exam/ReadingExam";

export default function MockReadingPage() {
  const { id } = useParams();
  const router = useRouter();
  const mockId = String(id);
  return (
    <ReadingExam
      source={{
        fetchUrl: `/mock/${mockId}/section/reading/`,
        submitUrl: `/mock/${mockId}/section/reading/submit/`,
        storageKey: `mock${mockId}`,
        subtitle: "Mock test",
        backHref: `/mock/${mockId}`,
        exam: true,
        onSubmitted: () => router.replace(`/mock/${mockId}`),
      }}
    />
  );
}
