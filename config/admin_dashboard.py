"""
Context for the admin landing page (templates/admin/index.html).
Wired via UNFOLD['DASHBOARD_CALLBACK'].
"""
from django.contrib.auth import get_user_model
from django.db.models import Avg
from django.utils import timezone
from datetime import timedelta

from reading.models import ReadingTest, ReadingAttempt
from listening.models import ListeningTest, ListeningAttempt
from writing.models import WritingPrompt, WritingSubmission
from speaking.models import SpeakingTest
from vocabulary.models import VocabularyWord
from payments.models import LearningCenter


def dashboard_callback(request, context):
    User = get_user_model()
    week_ago = timezone.now() - timedelta(days=7)

    content = [
        {'label': 'Reading tests', 'value': ReadingTest.objects.count(), 'icon': 'menu_book',
         'url': 'admin:reading_readingtest_changelist'},
        {'label': 'Listening tests', 'value': ListeningTest.objects.count(), 'icon': 'headphones',
         'url': 'admin:listening_listeningtest_changelist'},
        {'label': 'Writing prompts', 'value': WritingPrompt.objects.count(), 'icon': 'edit_note',
         'url': 'admin:writing_writingprompt_changelist'},
        {'label': 'Speaking tests', 'value': SpeakingTest.objects.count(), 'icon': 'mic',
         'url': 'admin:speaking_speakingtest_changelist'},
        {'label': 'Vocabulary words', 'value': VocabularyWord.objects.count(), 'icon': 'dictionary',
         'url': 'admin:vocabulary_vocabularyword_changelist'},
    ]

    reading_attempts = ReadingAttempt.objects.filter(completed_at__isnull=False)
    listening_attempts = ListeningAttempt.objects.filter(completed_at__isnull=False)

    students = [
        {'label': 'Users', 'value': User.objects.count(), 'icon': 'group',
         'url': 'admin:users_user_changelist'},
        {'label': 'Active this week', 'value': User.objects.filter(last_login__gte=week_ago).count(),
         'icon': 'person_check', 'url': 'admin:users_user_changelist'},
        {'label': 'Learning centers', 'value': LearningCenter.objects.count(), 'icon': 'apartment',
         'url': 'admin:payments_learningcenter_changelist'},
        {'label': 'Reading attempts', 'value': reading_attempts.count(), 'icon': 'fact_check',
         'url': 'admin:reading_readingattempt_changelist',
         'sub': _avg_band(reading_attempts)},
        {'label': 'Listening attempts', 'value': listening_attempts.count(), 'icon': 'fact_check',
         'url': 'admin:listening_listeningattempt_changelist',
         'sub': _avg_band(listening_attempts)},
        {'label': 'Writing submissions', 'value': WritingSubmission.objects.count(), 'icon': 'draft',
         'url': 'admin:writing_writingsubmission_changelist'},
    ]

    recent = []
    for a in reading_attempts.select_related('user', 'test').order_by('-completed_at')[:8]:
        recent.append({'when': a.completed_at, 'user': a.user, 'module': 'Reading', 'test': str(a.test),
                       'score': f'{a.raw_score}/40', 'band': a.band_score})
    for a in listening_attempts.select_related('user', 'test').order_by('-completed_at')[:8]:
        recent.append({'when': a.completed_at, 'user': a.user, 'module': 'Listening', 'test': str(a.test),
                       'score': f'{a.raw_score}/40', 'band': a.band_score})
    for s in WritingSubmission.objects.select_related('user', 'prompt').order_by('-created_at')[:8]:
        recent.append({'when': s.created_at, 'user': s.user, 'module': 'Writing', 'test': str(s.prompt),
                       'score': f'{s.word_count} words', 'band': None})
    recent.sort(key=lambda r: r['when'], reverse=True)

    context.update({
        'content_stats': content,
        'student_stats': students,
        'recent_activity': recent[:10],
    })
    return context


def _avg_band(qs):
    avg = qs.aggregate(a=Avg('band_score'))['a']
    return f'avg band {avg:.1f}' if avg else 'no attempts yet'
