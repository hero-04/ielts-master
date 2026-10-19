"""
Validation for the IELTS Master content JSON format.

See content/README.md for the full format. The validator is deliberately strict:
a typo in a question type or a multiple-choice answer letter that points outside
the options list is caught here, before anything touches the database.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field

from reading.models import ReadingQuestion
from listening.models import ListeningQuestion
from writing.models import WritingPrompt
from vocabulary.models import VocabularyWord
from mock.models import MockQuestion

READING_TYPES = {c.value for c in ReadingQuestion.QuestionType}
LISTENING_TYPES = {c.value for c in ListeningQuestion.QuestionType}
WRITING_TASKS = {c.value for c in WritingPrompt.TaskType}
MOCK_TYPES = {c.value for c in MockQuestion.QuestionType}
VOCAB_TOPICS = {c.value for c in VocabularyWord.Topic}
VOCAB_DIFFICULTIES = {c.value for c in VocabularyWord.Difficulty}

MODULES = ('reading', 'listening', 'writing', 'speaking', 'vocabulary', 'mocks')

LETTER_RE = re.compile(r'^[A-Z]$')
MULTI_BLANK_RE = re.compile(r'(\d+)\s*\.{4,}')
TFNG_ANSWERS = {'true', 'false', 'not given'}
YNNG_ANSWERS = {'yes', 'no', 'not given'}


@dataclass
class Report:
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)

    def error(self, where: str, msg: str):
        self.errors.append(f'{where}: {msg}')

    def warn(self, where: str, msg: str):
        self.warnings.append(f'{where}: {msg}')

    @property
    def ok(self) -> bool:
        return not self.errors


def _require(obj: dict, keys: tuple[str, ...], where: str, rep: Report) -> bool:
    missing = [k for k in keys if k not in obj or obj[k] in (None, '')]
    if missing:
        rep.error(where, f'missing required field(s): {", ".join(missing)}')
        return False
    return True


def _check_book_test(obj: dict, where: str, rep: Report):
    b, t = obj.get('book_number'), obj.get('test_number')
    if not isinstance(b, int) or not 1 <= b <= 20:
        rep.error(where, f'book_number must be an integer 1-20, got {b!r}')
    if not isinstance(t, int) or not 1 <= t <= 4:
        rep.error(where, f'test_number must be an integer 1-4, got {t!r}')


def _check_question_common(q: dict, where: str, allowed_types: set[str], rep: Report):
    if not _require(q, ('order', 'type', 'text'), where, rep):
        return
    is_block = q.get('type') in ('form_completion', 'table_completion') and isinstance(q.get('answers'), dict)
    if not is_block and not _require(q, ('answer',), where, rep):
        return
    if q['type'] not in allowed_types:
        rep.error(where, f'unknown type {q["type"]!r}. Allowed: {", ".join(sorted(allowed_types))}')
        return
    if not isinstance(q['order'], int) or q['order'] < 1:
        rep.error(where, f'order must be a positive integer, got {q["order"]!r}')
    opts = q.get('options', [])
    if not isinstance(opts, list) or not all(isinstance(o, str) for o in opts):
        rep.error(where, 'options must be a list of strings')
        opts = []

    qtype, answer = q['type'], str(q.get('answer', '')).strip()
    if qtype in ('multiple_choice',):
        if len(opts) < 2:
            rep.error(where, 'multiple_choice needs at least 2 options')
        for letter in (a.strip().upper() for a in answer.split(',')):
            if not LETTER_RE.match(letter):
                rep.error(where, f'multiple_choice answer must be a letter (A, B, C…), got {letter!r}')
            elif ord(letter) - ord('A') >= len(opts):
                rep.error(where, f'answer {letter} points past the {len(opts)} option(s)')
    elif qtype == 'multiple_choice_multiple':
        if len(opts) < 3:
            rep.error(where, 'multiple_choice_multiple needs at least 3 options')
        if ',' not in answer:
            rep.warn(where, 'multiple_choice_multiple usually has several comma-separated answer letters')
    elif qtype == 'tfng' and answer.lower() not in TFNG_ANSWERS:
        rep.error(where, f'tfng answer must be True / False / Not Given, got {answer!r}')
    elif qtype == 'ynng' and answer.lower() not in YNNG_ANSWERS:
        rep.error(where, f'ynng answer must be Yes / No / Not Given, got {answer!r}')
    elif qtype in ('matching_headings', 'matching_information', 'matching', 'drag_drop', 'selection_grid') and not opts:
        rep.warn(where, f'{qtype} normally has an options list (headings / word bank / letters)')
    elif qtype in ('form_completion', 'table_completion') and MULTI_BLANK_RE.search(q['text']):
        # A multi-blank block: one row is created per blank number found in the text.
        if 'answers' not in q:
            rep.error(where, 'a multi-blank block (text contains "12 ........") needs an "answers" object: {"12": "...", "13": "..."}')
        else:
            blanks = {int(n) for n in MULTI_BLANK_RE.findall(q['text'])}
            given = {int(k) for k in q['answers'].keys()}
            if blanks != given:
                rep.error(where, f'blanks in text {sorted(blanks)} do not match answers keys {sorted(given)}')


def validate_reading(tests: list, rep: Report):
    for i, t in enumerate(tests):
        where = f'reading[{i}]'
        if not isinstance(t, dict):
            rep.error(where, 'must be an object'); continue
        _require(t, ('book_number', 'test_number', 'title', 'passages', 'questions'), where, rep)
        _check_book_test(t, where, rep)
        passages = t.get('passages') or {}
        for key in ('A', 'B', 'C'):
            p = passages.get(key)
            if not isinstance(p, dict) or not p.get('text'):
                rep.error(where, f'passages.{key}.text is required')
        orders: list[int] = []
        for j, q in enumerate(t.get('questions') or []):
            qwhere = f'{where}.questions[{j}]'
            if q.get('passage') not in ('A', 'B', 'C'):
                rep.error(qwhere, 'passage must be "A", "B" or "C"')
            _check_question_common(q, qwhere, READING_TYPES, rep)
            orders.extend(_expanded_orders(q))
        _check_orders(orders, where, rep, expected=40)


def validate_listening(tests: list, rep: Report):
    for i, t in enumerate(tests):
        where = f'listening[{i}]'
        if not isinstance(t, dict):
            rep.error(where, 'must be an object'); continue
        _require(t, ('book_number', 'test_number', 'title', 'audio_url', 'questions'), where, rep)
        _check_book_test(t, where, rep)
        orders: list[int] = []
        for j, q in enumerate(t.get('questions') or []):
            qwhere = f'{where}.questions[{j}]'
            if q.get('section') not in (1, 2, 3, 4):
                rep.error(qwhere, 'section must be 1, 2, 3 or 4')
            _check_question_common(q, qwhere, LISTENING_TYPES, rep)
            orders.extend(_expanded_orders(q))
        _check_orders(orders, where, rep, expected=40)


def validate_writing(prompts: list, rep: Report):
    for i, p in enumerate(prompts):
        where = f'writing[{i}]'
        if not isinstance(p, dict):
            rep.error(where, 'must be an object'); continue
        _require(p, ('book_number', 'test_number', 'task_type', 'prompt_text'), where, rep)
        if not p.get('sample_answer'):
            rep.warn(where, 'no sample_answer — the "Sample answer" button will show nothing for this prompt')
        _check_book_test(p, where, rep)
        if p.get('task_type') not in WRITING_TASKS:
            rep.error(where, f'task_type must be one of {sorted(WRITING_TASKS)}')
        if p.get('task_type') == 'task_1' and not p.get('prompt_image'):
            rep.warn(where, 'task_1 usually needs a prompt_image URL (chart / diagram)')


def validate_speaking(tests: list, rep: Report):
    for i, t in enumerate(tests):
        where = f'speaking[{i}]'
        if not isinstance(t, dict):
            rep.error(where, 'must be an object'); continue
        _require(t, ('book_number', 'test_number', 'part1', 'part2', 'part3'), where, rep)
        _check_book_test(t, where, rep)
        for part in ('part1', 'part3'):
            items = t.get(part) or []
            if not isinstance(items, list) or not items:
                rep.error(where, f'{part} must be a non-empty list of {{"question", "sample_answer"}}')
                continue
            for j, it in enumerate(items):
                _require(it, ('question', 'sample_answer'), f'{where}.{part}[{j}]', rep)
        p2 = t.get('part2')
        if not isinstance(p2, dict):
            rep.error(where, 'part2 must be an object {"question", "sample_answer"}')
        else:
            _require(p2, ('question', 'sample_answer'), f'{where}.part2', rep)


def validate_vocabulary(words: list, rep: Report):
    seen = set()
    for i, w in enumerate(words):
        where = f'vocabulary[{i}]'
        if not isinstance(w, dict):
            rep.error(where, 'must be an object'); continue
        if not _require(w, ('word', 'definition', 'example_sentence', 'topic', 'book_number'), where, rep):
            continue
        if w['topic'] not in VOCAB_TOPICS:
            rep.error(where, f'topic must be one of {sorted(VOCAB_TOPICS)}')
        if w.get('difficulty', 'medium') not in VOCAB_DIFFICULTIES:
            rep.error(where, f'difficulty must be one of {sorted(VOCAB_DIFFICULTIES)}')
        b = w['book_number']
        if not isinstance(b, int) or not 1 <= b <= 20:
            rep.error(where, f'book_number must be an integer 1-20, got {b!r}')
        key = w['word'].strip().lower()
        if key in seen:
            rep.error(where, f'duplicate word {w["word"]!r} in file')
        seen.add(key)


def validate_mocks(mocks: list, rep: Report):
    """
    A mock is one object with its own listening / reading / writing content:
      {"number": 1, "title": "…",
       "listening": {"audio_url": "…", "transcript": "…", "questions": [{"order", "section": 1-4, "type", "text", "answer", "options"}]},
       "reading":   {"passages": {"A": {"title","text"}, …}, "questions": [{"order", "passage": "A", …}]},
       "writing":   {"task1": {"prompt_text", "prompt_image"}, "task2": {"prompt_text"}}}
    Any of the three sections may be omitted (it is then skipped in the exam).
    """
    for i, m in enumerate(mocks):
        where = f'mocks[{i}]'
        if not isinstance(m, dict):
            rep.error(where, 'must be an object'); continue
        n = m.get('number')
        if not isinstance(n, int) or n < 1:
            rep.error(where, f'number must be a positive integer, got {n!r}')
        if not any(k in m for k in ('listening', 'reading', 'writing')):
            rep.error(where, 'a mock needs at least one of: listening, reading, writing')

        L = m.get('listening')
        if L is not None:
            lw = f'{where}.listening'
            if not isinstance(L, dict):
                rep.error(lw, 'must be an object')
            else:
                if not L.get('audio_url'):
                    rep.warn(lw, 'no audio_url — the Listening section will be skipped until one is added')
                orders: list[int] = []
                for j, q in enumerate(L.get('questions') or []):
                    qw = f'{lw}.questions[{j}]'
                    if q.get('section') not in (1, 2, 3, 4):
                        rep.error(qw, 'section must be 1, 2, 3 or 4')
                    _check_question_common(q, qw, MOCK_TYPES, rep)
                    orders.extend(_expanded_orders(q))
                _check_orders(orders, lw, rep, expected=40)

        R = m.get('reading')
        if R is not None:
            rw = f'{where}.reading'
            if not isinstance(R, dict):
                rep.error(rw, 'must be an object')
            else:
                passages = R.get('passages') or {}
                for key in ('A', 'B', 'C'):
                    p = passages.get(key)
                    if not isinstance(p, dict) or not p.get('text'):
                        rep.error(rw, f'passages.{key}.text is required')
                orders = []
                for j, q in enumerate(R.get('questions') or []):
                    qw = f'{rw}.questions[{j}]'
                    if q.get('passage') not in ('A', 'B', 'C'):
                        rep.error(qw, 'passage must be "A", "B" or "C"')
                    _check_question_common(q, qw, MOCK_TYPES, rep)
                    orders.extend(_expanded_orders(q))
                _check_orders(orders, rw, rep, expected=40)

        W = m.get('writing')
        if W is not None:
            ww = f'{where}.writing'
            if not isinstance(W, dict):
                rep.error(ww, 'must be an object')
            else:
                for task in ('task1', 'task2'):
                    t = W.get(task)
                    if not isinstance(t, dict) or not t.get('prompt_text'):
                        rep.error(ww, f'{task}.prompt_text is required')
                if isinstance(W.get('task1'), dict) and not W['task1'].get('prompt_image'):
                    rep.warn(ww, 'task1 usually needs a prompt_image URL (chart / diagram)')


def _expanded_orders(q: dict) -> list[int]:
    """A multi-blank block expands into one question row per blank number."""
    if q.get('type') in ('form_completion', 'table_completion') and isinstance(q.get('answers'), dict):
        return [int(k) for k in q['answers'].keys()]
    return [q['order']] if isinstance(q.get('order'), int) else []


def _check_orders(orders: list[int], where: str, rep: Report, expected: int):
    dupes = sorted({o for o in orders if orders.count(o) > 1})
    if dupes:
        rep.error(where, f'duplicate question order number(s): {dupes}')
    if orders and len(orders) != expected:
        rep.warn(where, f'{len(orders)} questions — a full IELTS test has {expected}')
    if orders and sorted(orders) != list(range(1, len(orders) + 1)):
        rep.warn(where, 'question order numbers are not a contiguous 1..N sequence')


def validate(data: dict) -> Report:
    rep = Report()
    if not isinstance(data, dict):
        rep.error('root', 'file must be a JSON object with module keys (reading, listening, writing, speaking, vocabulary, mocks)')
        return rep
    unknown = set(data) - set(MODULES) - {'$schema', 'comment', '_comment'}
    if unknown:
        rep.error('root', f'unknown top-level key(s): {sorted(unknown)}. Allowed: {MODULES}')
    if not any(k in data for k in MODULES):
        rep.error('root', 'nothing to import — no module keys found')
    for key, fn in (
        ('reading', validate_reading), ('listening', validate_listening), ('writing', validate_writing),
        ('speaking', validate_speaking), ('vocabulary', validate_vocabulary),
        ('mocks', validate_mocks),
    ):
        if key in data:
            if not isinstance(data[key], list):
                rep.error(key, 'must be a list')
            else:
                fn(data[key], rep)
    return rep
