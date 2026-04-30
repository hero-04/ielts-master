from django.db import models
from django.conf import settings


class LearningCenter(models.Model):
    """Represents an IELTS learning center that buys bulk student subscriptions."""

    name = models.CharField(max_length=255, verbose_name='Center name')
    contact_person = models.CharField(max_length=255, verbose_name='Contact person')
    phone = models.CharField(max_length=30, verbose_name='Phone number')
    email = models.EmailField(verbose_name='Email')

    student_limit = models.PositiveIntegerField(default=10, verbose_name='Student limit')
    price_per_student = models.DecimalField(
        max_digits=10, decimal_places=2,
        verbose_name='Price per student (UZS)',
    )

    contract_start = models.DateField(verbose_name='Contract start')
    contract_end = models.DateField(verbose_name='Contract end')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'learning_centers'
        verbose_name = 'Learning Center'
        verbose_name_plural = 'Learning Centers'
        ordering = ['name']

    def __str__(self):
        return self.name


class Subscription(models.Model):
    """Individual student subscription record."""

    class PlanType(models.TextChoices):
        INDIVIDUAL = 'individual', 'Individual'
        CENTER = 'center', 'Learning Center'

    class PaymentMethod(models.TextChoices):
        PAYME = 'payme', 'Payme'
        CLICK = 'click', 'Click'
        XAZNA = 'xazna', 'Xazna'

    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        EXPIRED = 'expired', 'Expired'
        CANCELLED = 'cancelled', 'Cancelled'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='subscriptions',
        verbose_name='User',
    )
    plan_type = models.CharField(max_length=20, choices=PlanType.choices)
    amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name='Amount (UZS)')
    currency = models.CharField(max_length=5, default='UZS')
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices)
    started_at = models.DateTimeField(verbose_name='Started at')
    ends_at = models.DateTimeField(verbose_name='Ends at')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'subscriptions'
        verbose_name = 'Subscription'
        verbose_name_plural = 'Subscriptions'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user} — {self.plan_type} ({self.status})'
