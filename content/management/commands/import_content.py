"""
Import tests, prompts and vocabulary from a JSON file.

    python manage.py import_content content/examples/sample_test.json
    python manage.py import_content my_tests/*.json --replace
    python manage.py import_content file.json --dry-run

Format: see content/README.md. The file is validated completely before any
write happens, and the whole import runs in one transaction — either every
item lands or nothing does.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from content.schema import validate, MULTI_BLANK_RE
from reading.models import ReadingTest, ReadingQuestion
from listening.models import ListeningTest, ListeningQuestion
from writing.models import WritingPrompt
from speaking.models import SpeakingTest, SpeakingQuestion
from vocabulary.models import VocabularyWord


class Command(BaseCommand):
    help = 'Import reading/listening/writing/speaking/vocabulary content from JSON files.'

    def add_arguments(self, parser):
        parser.add_argument('files', nargs='+', help='One or more JSON files')
        parser.add_argument('--replace', action='store_true',
                            help='If a test with the same book/test number exists, delete it (and its attempts!) and re-import.')
        parser.add_argument('--dry-run', action='store_true', help='Validate and report, write nothing.')

    def handle(self, *args, **opts):
        payloads = []
        for f in opts['files']:
            path = Path(f)
            if not path.exists():
                raise CommandError(f'File not found: {path}')
            try:
                data = json.loads(path.read_text(encoding='utf-8'))
            except json.JSONDecodeError as exc:
                raise CommandError(f'{path}: invalid JSON — {exc}')
            rep = validate(data)
            for w in rep.warnings:
                self.stdout.write(self.style.WARNING(f'  warn  {path.name} {w}'))
            for e in rep.errors:
                self.stdout.write(self.style.ERROR(f'  ERROR {path.name} {e}'))
            if not rep.ok:
                raise CommandError(f'{path.name}: {len(rep.errors)} error(s). Nothing imported.')
            payloads.append((path, data))

        if opts['dry_run']:
            self.stdout.write(self.style.SUCCESS('Dry run: all files valid. Nothing written.'))
            return

        counts = {'reading': 0, 'listening': 0, 'writing': 0, 'speaking': 0, 'vocabulary': 0, 'skipped': 0}
        with transaction.atomic():
            for path, data in payloads:
                self.stdout.write(f'Importing {path.name} …')
                for t in data.get('reading', []):
                    counts['reading' if self._import_reading(t, opts['replace']) else 'skipped'] += 1
                for t in data.get('listening', []):
                    counts['listening' if self._import_listening(t, opts['replace']) else 'skipped'] += 1
                for p in data.get('writing', []):
                    counts['writing' if self._import_writing(p, opts['replace']) else 'skipped'] += 1
                for t in data.get('speaking', []):
                    counts['speaking' if self._import_speaking(t, opts['replace']) else 'skipped'] += 1
                counts['vocabulary'] += self._import_vocabulary(data.get('vocabulary', []), opts['replace'])

        summary = ', '.join(f'{v} {k}' for k, v in counts.items() if v)
        self.stdout.write(self.style.SUCCESS(f'Done: {summary or "nothing to do"}.'))

    # ── helpers ───────────────────────────────────────────────────────────

    def _existing(self, model, book, test, **extra):
        return model.objects.filter(book_number=book, test_number=test, **extra).first()

    def _skip(self, label):
        self.stdout.write(self.style.WARNING(f'  skip  {label} already exists (use --replace to overwrite)'))
        return False

    @staticmethod
    def _expand_questions(q: dict) -> list[dict]:
        """
        Turn one JSON question into one or more DB rows.
        Multi-blank form/table blocks ("12 ........ 13 ........") become one row per
        blank, all sharing the same text — this is what the exam UI expects.
        """
        if q['type'] in ('form_completion', 'table_completion') and isinstance(q.get('answers'), dict):
            rows = []
            for n, ans in sorted(q['answers'].items(), key=lambda kv: int(kv[0])):
                rows.append({**q, 'order': int(n), 'answer': ans})
            return rows
        return [q]

    def _import_reading(self, t: dict, replace: bool) -> bool:
        label = f'reading Book {t["book_number"]} Test {t["test_number"]}'
        existing = self._existing(ReadingTest, t['book_number'], t['test_number'])
        if existing:
            if not replace:
                return self._skip(label)
            existing.delete()
        P = t['passages']
        test = ReadingTest.objects.create(
            title=t['title'], book_number=t['book_number'], test_number=t['test_number'],
            passage_a_title=P['A'].get('title', ''), passage_a=P['A']['text'],
            passage_b_title=P['B'].get('title', ''), passage_b=P['B']['text'],
            passage_c_title=P['C'].get('title', ''), passage_c=P['C']['text'],
        )
        rows = []
        for q in t['questions']:
            for r in self._expand_questions(q):
                rows.append(ReadingQuestion(
                    test=test, passage=r['passage'], question_type=r['type'], question_text=r['text'],
                    correct_answer=str(r['answer']), explanation=r.get('explanation') or None,
                    options=r.get('options', []), order_number=r['order'],
                ))
        ReadingQuestion.objects.bulk_create(rows)
        self.stdout.write(f'  ok    {label}: {len(rows)} questions')
        return True

    def _import_listening(self, t: dict, replace: bool) -> bool:
        label = f'listening Book {t["book_number"]} Test {t["test_number"]}'
        existing = self._existing(ListeningTest, t['book_number'], t['test_number'])
        if existing:
            if not replace:
                return self._skip(label)
            existing.delete()
        test = ListeningTest.objects.create(
            title=t['title'], book_number=t['book_number'], test_number=t['test_number'],
            audio_url=t['audio_url'], transcript=t.get('transcript') or None,
        )
        rows = []
        for q in t['questions']:
            for r in self._expand_questions(q):
                rows.append(ListeningQuestion(
                    test=test, section=r['section'], question_type=r['type'], question_text=r['text'],
                    correct_answer=str(r['answer']), options=r.get('options', []),
                    question_group=r.get('group', ''), order_number=r['order'],
                ))
        ListeningQuestion.objects.bulk_create(rows)
        self.stdout.write(f'  ok    {label}: {len(rows)} questions')
        return True

    def _import_writing(self, p: dict, replace: bool) -> bool:
        label = f'writing Book {p["book_number"]} Test {p["test_number"]} {p["task_type"]}'
        existing = self._existing(WritingPrompt, p['book_number'], p['test_number'], task_type=p['task_type'])
        if existing:
            if not replace:
                return self._skip(label)
            existing.delete()
        WritingPrompt.objects.create(
            book_number=p['book_number'], test_number=p['test_number'], task_type=p['task_type'],
            prompt_text=p['prompt_text'], prompt_image=p.get('prompt_image') or None,
            sample_answer=p['sample_answer'],
        )
        self.stdout.write(f'  ok    {label}')
        return True

    def _import_speaking(self, t: dict, replace: bool) -> bool:
        label = f'speaking Book {t["book_number"]} Test {t["test_number"]}'
        existing = self._existing(SpeakingTest, t['book_number'], t['test_number'])
        if existing:
            if not replace:
                return self._skip(label)
            existing.delete()
        test = SpeakingTest.objects.create(book_number=t['book_number'], test_number=t['test_number'])
        rows = []
        for i, it in enumerate(t['part1'], 1):
            rows.append(SpeakingQuestion(test=test, part=1, order_number=i,
                                         question_text=it['question'], sample_answer=it['sample_answer']))
        rows.append(SpeakingQuestion(test=test, part=2, order_number=1,
                                     question_text=t['part2']['question'], sample_answer=t['part2']['sample_answer']))
        for i, it in enumerate(t['part3'], 1):
            rows.append(SpeakingQuestion(test=test, part=3, order_number=i,
                                         question_text=it['question'], sample_answer=it['sample_answer']))
        SpeakingQuestion.objects.bulk_create(rows)
        self.stdout.write(f'  ok    {label}: {len(rows)} questions')
        return True

    def _import_vocabulary(self, words: list, replace: bool) -> int:
        n = 0
        for w in words:
            defaults = dict(
                definition=w['definition'], example_sentence=w['example_sentence'], topic=w['topic'],
                difficulty=w.get('difficulty', 'medium'), book_number=w['book_number'],
                audio_url=w.get('audio_url') or None,
            )
            if replace:
                VocabularyWord.objects.update_or_create(word=w['word'].strip(), defaults=defaults)
                n += 1
            else:
                _, created = VocabularyWord.objects.get_or_create(word=w['word'].strip(), defaults=defaults)
                n += int(created)
        if words:
            self.stdout.write(f'  ok    vocabulary: {n} word(s) written')
        return n
