# Content import / export

Load tests into IELTS Master from JSON files instead of clicking through the Django admin.

```bash
# validate only
python manage.py import_content my_tests/book10_test1.json --dry-run

# import (skips tests that already exist)
python manage.py import_content my_tests/*.json

# overwrite an existing test — this also deletes attempts made on it
python manage.py import_content my_tests/book10_test1.json --replace

# export what's in the database (to back up, edit and re-import)
python manage.py export_content --reading 10 1 > book10_test1_reading.json
python manage.py export_content --all > all_content.json
```

To import into production (Neon), point `DATABASE_URL` at it for that one command:

```bash
DATABASE_URL='postgresql://…neon.tech/neondb?sslmode=require' python manage.py import_content my_tests/*.json
```

A full example with every module is in `examples/sample_test.json`. Everything is validated before any write; the import is one transaction.

## File layout

```json
{
  "reading":    [ …tests… ],
  "listening":  [ …tests… ],
  "writing":    [ …prompts… ],
  "speaking":   [ …tests… ],
  "vocabulary": [ …words… ]
}
```

Any key may be omitted. One file per test, or one file per book, or everything in one file — all fine.

`book_number` is 1–20 and `test_number` is 1–4 everywhere. A (book, test) pair identifies a test; re-importing the same pair is skipped unless `--replace`.

## Reading test

```json
{
  "book_number": 10, "test_number": 1, "title": "Book 10 — Reading Test 1",
  "passages": {
    "A": {"title": "…", "text": "Paragraphs separated by a blank line"},
    "B": {"title": "…", "text": "…"},
    "C": {"title": "…", "text": "…"}
  },
  "questions": [ … ]
}
```

Each question: `order` (1–40), `passage` (`"A"`/`"B"`/`"C"`), `type`, `text`, `answer`, optional `options` (list of strings) and `explanation`.

| type | `options` | `answer` |
|---|---|---|
| `multiple_choice` | option texts, in order | the letter: `"B"` |
| `multiple_choice_multiple` | option texts | letters, comma-separated: `"A,C"` |
| `tfng` | – | `"True"` / `"False"` / `"Not Given"` |
| `ynng` | – | `"Yes"` / `"No"` / `"Not Given"` |
| `matching_headings` | the list of headings | the heading label/text the UI shows, e.g. `"ii"` |
| `matching_information` | paragraph letters | `"C"` |
| `sentence_completion`, `summary_completion` | – | the word(s); alternatives comma-separated: `"taps,water taps"` |
| `short_answer` | – | the word(s) |
| `form_completion`, `table_completion` | – | see multi-blank below |

Answers are compared case-insensitively after trimming. Several acceptable answers go in one string separated by commas.

### Multi-blank blocks (form / table / note completion)

Write the whole block once, marking each gap with its question number followed by at least four dots, and supply an `answers` object (no `answer` field needed):

```json
{"order": 8, "passage": "C", "type": "table_completion",
 "text": "Water sources\nBefore 1998: the 8 ........\nAfter 1998: household 9 ........",
 "answers": {"8": "well", "9": "taps"}}
```

The importer creates one question row per blank (8 and 9) so scoring is per blank, exactly as the exam UI renders it.

## Listening test

Same as reading, but each question has `section` (1–4) instead of `passage`, the test has `audio_url` (a direct MP3 link — Cloudinary, R2, any public URL) and an optional `transcript`. Extra types:

| type | `options` | `answer` |
|---|---|---|
| `matching` | the shared option list; put the same `group` name on every question of the set so they render as one block | the letter |
| `drag_drop` | word bank | the word |
| `selection_grid` | word bank | the word |
| `diagram_labelling` | labels | the label |

Mark the gap in `drag_drop` text with `___` or `[BLANK]`.

## Writing prompt

```json
{"book_number": 10, "test_number": 1, "task_type": "task_1",
 "prompt_text": "…", "prompt_image": "https://…/chart.png", "sample_answer": "…"}
```

`task_type` is `task_1` or `task_2`. `prompt_image` is an image URL (Task 1 charts); Task 2 leaves it out. `sample_answer` is optional (a warning is shown if missing).

Keep files you must not publish in `content/private/` — that folder is git-ignored.

## Speaking test

```json
{"book_number": 10, "test_number": 1,
 "part1": [{"question": "…", "sample_answer": "…"}, …],
 "part2": {"question": "Describe …\n\nYou should say:\n• …", "sample_answer": "…"},
 "part3": [{"question": "…", "sample_answer": "…"}, …]}
```

## Vocabulary

```json
{"word": "sustainable", "definition": "…", "example_sentence": "…",
 "topic": "environment", "difficulty": "medium", "book_number": 10, "audio_url": ""}
```

`topic`: environment, technology, health, education, society, science, business, culture. `difficulty`: easy, medium, hard. Words are unique; `--replace` updates an existing word.

## Tips for building test files fast

- Ask an AI assistant to convert your typed-up questions into this JSON — paste this README as the format spec. Then run `--dry-run`; it will tell you exactly which question is wrong and why.
- Keep one folder per book: `my_tests/book10/test1.json`, etc. Import the folder with a glob.
- Host audio and chart images somewhere with a direct link (Cloudinary free tier works) and paste the URL.
