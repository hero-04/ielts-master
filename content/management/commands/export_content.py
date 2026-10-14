"""
Export existing content back to the JSON import format.

    python manage.py export_content --reading 10 1 > book10_test1_reading.json
    python manage.py export_content --all > all_content.json

Useful for backing up content, editing a test in a text editor and re-importing
with --replace, or moving content between databases.
"""
from __future__ import annotations

import json
from collections import defaultdict

from django.core.management.base import BaseCommand, CommandError

from reading.models import ReadingTest
from listening.models import ListeningTest
from writing.models import WritingPrompt
from speaking.models import SpeakingTest
from vocabulary.models import VocabularyWord


class Command(BaseCommand):
    help = 'Export content as JSON in the import_content format.'

    def add_arguments(self, parser):
        parser.add_argument('--all', action='store_true', help='Export everything')
        parser.add_argument('--reading', nargs=2, type=int, metavar=('BOOK', 'TEST'))
        parser.add_argument('--listening', nargs=2, type=int, metavar=('BOOK', 'TEST'))
        parser.add_argument('--writing', nargs=2, type=int, metavar=('BOOK', 'TEST'))
        parser.add_argument('--speaking', nargs=2, type=int, metavar=('BOOK', 'TEST'))
        parser.add_argument('--vocabulary', action='store_true')

    def handle(self, *args, **o):
        out: dict = {}
        if o['all'] or o['reading']:
            qs = ReadingTest.objects.prefetch_related('questions')
            if o['reading']:
                qs = qs.filter(book_number=o['reading'][0], test_number=o['reading'][1])
            out['reading'] = [self._reading(t) for t in qs]
        if o['all'] or o['listening']:
            qs = ListeningTest.objects.prefetch_related('questions')
            if o['listening']:
                qs = qs.filter(book_number=o['listening'][0], test_number=o['listening'][1])
            out['listening'] = [self._listening(t) for t in qs]
        if o['all'] or o['writing']:
            qs = WritingPrompt.objects.all()
            if o['writing']:
                qs = qs.filter(book_number=o['writing'][0], test_number=o['writing'][1])
            out['writing'] = [self._writing(p) for p in qs]
        if o['all'] or o['speaking']:
            qs = SpeakingTest.objects.prefetch_related('questions')
            if o['speaking']:
                qs = qs.filter(book_number=o['speaking'][0], test_number=o['speaking'][1])
            out['speaking'] = [self._speaking(t) for t in qs]
        if o['all'] or o['vocabulary']:
            out['vocabulary'] = [self._word(w) for w in VocabularyWord.objects.all()]
        if not out:
            raise CommandError('Nothing selected. Use --all or one of --reading/--listening/--writing/--speaking/--vocabulary.')
        self.stdout.write(json.dumps(out, ensure_ascii=False, indent=2))

    @staticmethod
    def _collapse_blocks(questions, extra_key):
        """Re-merge multi-blank rows (same text, form/table type) into one block with an answers map."""
        groups: dict = defaultdict(list)
        singles = []
        for q in questions:
            if q.question_type in ('form_completion', 'table_completion'):
                groups[(q.question_type, q.question_text, getattr(q, extra_key))].append(q)
            else:
                singles.append(q)
        out = []
        for q in singles:
            out.append(q)
        for (qtype, text, extra), rows in groups.items():
            if len(rows) == 1:
                out.append(rows[0])
            else:
                out.append((qtype, text, extra, rows))
        return out

    def _reading(self, t):
        qs = []
        for item in self._collapse_blocks(t.questions.all(), 'passage'):
            if isinstance(item, tuple):
                qtype, text, passage, rows = item
                qs.append({'order': min(r.order_number for r in rows), 'passage': passage, 'type': qtype,
                           'text': text, 'answers': {str(r.order_number): r.correct_answer for r in rows},
                           'options': rows[0].options})
            else:
                q = item
                qs.append({'order': q.order_number, 'passage': q.passage, 'type': q.question_type,
                           'text': q.question_text, 'answer': q.correct_answer, 'options': q.options,
                           **({'explanation': q.explanation} if q.explanation else {})})
        qs.sort(key=lambda q: q['order'])
        return {
            'book_number': t.book_number, 'test_number': t.test_number, 'title': t.title,
            'passages': {
                'A': {'title': t.passage_a_title, 'text': t.passage_a},
                'B': {'title': t.passage_b_title, 'text': t.passage_b},
                'C': {'title': t.passage_c_title, 'text': t.passage_c},
            },
            'questions': qs,
        }

    def _listening(self, t):
        qs = []
        for item in self._collapse_blocks(t.questions.all(), 'section'):
            if isinstance(item, tuple):
                qtype, text, section, rows = item
                qs.append({'order': min(r.order_number for r in rows), 'section': section, 'type': qtype,
                           'text': text, 'answers': {str(r.order_number): r.correct_answer for r in rows},
                           'options': rows[0].options, 'group': rows[0].question_group})
            else:
                q = item
                qs.append({'order': q.order_number, 'section': q.section, 'type': q.question_type,
                           'text': q.question_text, 'answer': q.correct_answer, 'options': q.options,
                           'group': q.question_group})
        qs.sort(key=lambda q: q['order'])
        return {'book_number': t.book_number, 'test_number': t.test_number, 'title': t.title,
                'audio_url': t.audio_url, 'transcript': t.transcript or '', 'questions': qs}

    @staticmethod
    def _writing(p):
        return {'book_number': p.book_number, 'test_number': p.test_number, 'task_type': p.task_type,
                'prompt_text': p.prompt_text, 'prompt_image': p.prompt_image or '', 'sample_answer': p.sample_answer}

    @staticmethod
    def _speaking(t):
        by_part = defaultdict(list)
        for q in t.questions.all():
            by_part[q.part].append({'question': q.question_text, 'sample_answer': q.sample_answer})
        return {'book_number': t.book_number, 'test_number': t.test_number,
                'part1': by_part[1], 'part2': (by_part[2] or [{}])[0], 'part3': by_part[3]}

    @staticmethod
    def _word(w):
        return {'word': w.word, 'definition': w.definition, 'example_sentence': w.example_sentence,
                'topic': w.topic, 'difficulty': w.difficulty, 'book_number': w.book_number,
                'audio_url': w.audio_url or ''}
