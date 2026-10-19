"use client";

import { useParams, useRouter } from "next/navigation";
import ListeningExam from "@/components/exam/ListeningExam";

export default function MockListeningPage() {
  const { id } = useParams();
  const router = useRouter();
  const mockId = String(id);
  return (
    <ListeningExam
      source={{
        fetchUrl: `/mock/${mockId}/section/listening/`,
        submitUrl: `/mock/${mockId}/section/listening/submit/`,
        storageKey: `mock${mockId}`,
        subtitle: "Mock test",
        backHref: `/mock/${mockId}`,
        exam: true,
        onSubmitted: () => router.replace(`/mock/${mockId}`),
      }}
    />
  );
}
