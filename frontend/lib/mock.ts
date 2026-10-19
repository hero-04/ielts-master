export type MockSection = "listening" | "reading" | "writing";

export interface MockStatus {
  started: boolean;
  completed: boolean;
  sections: MockSection[];
  done: MockSection[];
  in_progress: MockSection | null;
  next: MockSection | null;
  scores: { listening: number | null; reading: number | null; writing: number | null; overall: number | null } | null;
}

export interface MockSummary {
  id: number;
  number: number;
  title: string;
  sections: MockSection[];
  my_status: MockStatus;
}

export const SECTION_INFO: Record<MockSection, { title: string; time: string; note: string }> = {
  listening: {
    title: "Listening",
    time: "Listening test will take no more than 30 minutes",
    note: "The recording plays once and includes 2 minutes at the end to check your answers. The test closes automatically when it ends.",
  },
  reading: {
    title: "Reading",
    time: "Reading test will take 60 minutes",
    note: "3 passages, 40 questions. No extra time is given.",
  },
  writing: {
    title: "Writing",
    time: "Writing test will take 60 minutes",
    note: "Task 1 and Task 2 share one 60-minute clock. No extra time is given.",
  },
};
