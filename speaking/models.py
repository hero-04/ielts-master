from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class SpeakingTest(models.Model):
    cambridge_book = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(19)])
    test_number = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(4)])
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'speaking_tests'
        unique_together = [['cambridge_book', 'test_number']]
        ordering = ['cambridge_book', 'test_number']

    def __str__(self):
        return f"Cambridge {self.cambridge_book} - Test {self.test_number}"


class SpeakingQuestion(models.Model):
    class Part(models.IntegerChoices):
        PART_1 = 1, 'Part 1'
        PART_2 = 2, 'Part 2'
        PART_3 = 3, 'Part 3'

    test = models.ForeignKey(SpeakingTest, on_delete=models.CASCADE, related_name='questions')
    part = models.IntegerField(choices=Part.choices)
    question_text = models.TextField()
    sample_answer = models.TextField()
    order_number = models.PositiveIntegerField()

    class Meta:
        db_table = 'speaking_questions'
        ordering = ['test', 'part', 'order_number']
        unique_together = [['test', 'part', 'order_number']]

    def __str__(self):
        return f"{self.test} | Part {self.part} | Q{self.order_number}"
