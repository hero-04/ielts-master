/** Where an exam screen loads from and submits to — practice tests and mock sections share the same UI. */
export interface ExamSource {
  /** GET: test/section content (passages, questions, audio_url, optional seconds_left) */
  fetchUrl: string;
  /** POST: { answers: [{question_id, user_answer}] } */
  submitUrl: string;
  /** localStorage namespace for answers / timer */
  storageKey: string;
  /** Label next to the module name in the exam header, e.g. "Book 1 • Test 2" or "Mock 1" */
  subtitle?: string;
  /** Where the "back" link on an error screen goes */
  backHref: string;
  /** Called with the submit response; the caller navigates. */
  onSubmitted: (data: any) => void;
  /**
   * Mock mode: the clock comes from the server (seconds_left), the test auto-submits at zero,
   * there is no confirm dialog on auto-submit, and (Listening) the recording plays once, in exam style.
   */
  exam?: boolean;
}
