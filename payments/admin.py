from django.contrib import admin
from .models import LearningCenter, Subscription


@admin.register(LearningCenter)
class LearningCenterAdmin(admin.ModelAdmin):
    list_display = ['name', 'contact_person', 'phone', 'student_limit', 'contract_start', 'contract_end']
    search_fields = ['name', 'contact_person', 'email']


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'plan_type', 'payment_method', 'amount', 'status', 'ends_at']
    list_filter = ['plan_type', 'status', 'payment_method']
    search_fields = ['user__email', 'user__full_name']
    ordering = ['-created_at']
