from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class WritingPrompt(models.Model):
    class TaskType(models.TextChoices):
        TASK_1 = 'task_1', 'Task 1'
        TASK_2 = 'task_2', 'Task 2'

    cambridge_book = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(19)])
    test_number = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(4)])
    task_type = models.CharField(max_length=10, choices=TaskType.choices)
    prompt_text = models.TextField()
    prompt_image = models.ImageField(upload_to='writing_prompts/', blank=True, null=True)
    sample_answer = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'writing_prompts'
        unique_together = [['cambridge_book', 'test_number', 'task_type']]
        ordering = ['cambridge_book', 'test_number', 'task_type']

    def __str__(self):
        return f"Cambridge {self.cambridge_book} - Test {self.test_number} - {self.get_task_type_display()}"


class WritingSubmission(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='writing_submissions')
    prompt = models.ForeignKey(WritingPrompt, on_delete=models.CASCADE, related_name='submissions')
    submission_text = models.TextField()
    word_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'writing_submissions'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        self.word_count = len(self.submission_text.split())
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.email} - {self.prompt} ({self.word_count} words)"
