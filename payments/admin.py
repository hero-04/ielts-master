from django.contrib import admin
from django.utils import timezone
from unfold.admin import ModelAdmin, TabularInline
from unfold.decorators import display
from unfold.contrib.filters.admin import RangeDateFilter

from .models import LearningCenter, Subscription
from users.models import User


class CenterStudentInline(TabularInline):
    """Students attached to this center — read-only glance; manage them under Users."""
    model = User
    fk_name = 'learning_center'
    extra = 0
    fields = ('email', 'full_name', 'user_type', 'is_active', 'last_login')
    readonly_fields = fields
    can_delete = False
    verbose_name_plural = 'Students'
    show_change_link = True

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(LearningCenter)
class LearningCenterAdmin(ModelAdmin):
    list_display = ('name', 'contact_person', 'phone', 'student_count', 'student_limit', 'contract_start', 'contract_end', 'contract_active')
    list_filter = (('contract_end', RangeDateFilter),)
    list_filter_submit = True
    search_fields = ('name', 'contact_person', 'email', 'phone')
    inlines = [CenterStudentInline]
    fieldsets = (
        (None, {'fields': ('name', ('contact_person', 'phone', 'email'))}),
        ('Contract', {'fields': (('student_limit', 'price_per_student'), ('contract_start', 'contract_end'))}),
    )

    @display(description='Students')
    def student_count(self, obj):
        return obj.students.count()

    @display(description='Active', boolean=True)
    def contract_active(self, obj):
        today = timezone.localdate()
        return obj.contract_start <= today <= obj.contract_end


@admin.register(Subscription)
class SubscriptionAdmin(ModelAdmin):
    list_display = ('user', 'plan_type', 'payment_method', 'amount', 'status_badge', 'started_at', 'ends_at')
    list_filter = ('plan_type', 'status', 'payment_method', ('ends_at', RangeDateFilter))
    list_filter_submit = True
    search_fields = ('user__email', 'user__full_name')
    list_select_related = ('user',)
    autocomplete_fields = ('user',)
    ordering = ('-created_at',)

    @display(description='Status', label={'active': 'success', 'expired': 'default', 'cancelled': 'danger'})
    def status_badge(self, obj):
        return obj.status, obj.get_status_display()
