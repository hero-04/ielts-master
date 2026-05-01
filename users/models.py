from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    """Custom manager for the User model that uses email as the unique identifier."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email address is required.')
        email = self.normalize_email(email)
        extra_fields.setdefault('user_type', 'free')
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('user_type', 'super_admin')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model for IELTS Master.
    Uses email (not username) as the primary login identifier.
    """

    class UserType(models.TextChoices):
        GUEST = 'guest', 'Guest'
        FREE = 'free', 'Free Student'
        PREMIUM = 'premium', 'Premium Student'
        CENTER_ADMIN = 'center_admin', 'Learning Center Admin'
        SUPER_ADMIN = 'super_admin', 'Super Admin'

    # ── Core fields ──────────────────────────────────────────────
    from django.core.validators import RegexValidator
    email = models.CharField(
        max_length=255, 
        unique=True, 
        verbose_name='Email address',
        validators=[RegexValidator(r'^[^@]+@[^@]+\.[^@]+$', message='Enter a valid email address.')]
    )
    full_name = models.CharField(max_length=255, verbose_name='Full name')

    # ── Role & subscription ──────────────────────────────────────
    user_type = models.CharField(
        max_length=20,
        choices=UserType.choices,
        default=UserType.FREE,
        verbose_name='User type',
    )
    subscription_end_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Subscription end date',
    )

    # ── Learning center (nullable for individual students) ────────
    learning_center = models.ForeignKey(
        'payments.LearningCenter',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='students',
        verbose_name='Learning center',
    )

    # ── Django internals ─────────────────────────────────────────
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now, verbose_name='Date joined')

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-date_joined']

    def __str__(self):
        return f'{self.full_name} <{self.email}>'

    # ── Convenience properties ────────────────────────────────────
    @property
    def is_premium(self):
        """True if user has an active premium subscription."""
        if self.user_type in (self.UserType.PREMIUM, self.UserType.SUPER_ADMIN):
            return True
        if self.subscription_end_date and self.subscription_end_date > timezone.now():
            return True
        return False

    @property
    def is_center_admin(self):
        return self.user_type == self.UserType.CENTER_ADMIN

    @property
    def is_super_admin(self):
        return self.user_type == self.UserType.SUPER_ADMIN
