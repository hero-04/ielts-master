from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.admin import GroupAdmin as BaseGroupAdmin
from django.contrib.auth.models import Group

from unfold.admin import ModelAdmin
from unfold.forms import AdminPasswordChangeForm, UserChangeForm, UserCreationForm
from unfold.decorators import display

User = get_user_model()

admin.site.unregister(Group)

# simplejwt registers its token tables with the plain admin; they're internal bookkeeping,
# not something to manage by hand, so keep them out of the sidebar.
try:
    from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
    admin.site.unregister(BlacklistedToken)
    admin.site.unregister(OutstandingToken)
except Exception:  # pragma: no cover - app not installed / already unregistered
    pass


@admin.register(Group)
class GroupAdmin(BaseGroupAdmin, ModelAdmin):
    pass


@admin.register(User)
class UserAdmin(BaseUserAdmin, ModelAdmin):
    form = UserChangeForm
    add_form = UserCreationForm
    change_password_form = AdminPasswordChangeForm

    list_display = ['email', 'full_name', 'role_badge', 'learning_center', 'is_active', 'last_login', 'date_joined']
    list_filter = ['user_type', 'is_active', 'is_staff', 'learning_center']
    list_filter_submit = True
    search_fields = ['email', 'full_name']
    ordering = ['-date_joined']
    readonly_fields = ['date_joined', 'last_login']
    list_per_page = 50
    filter_horizontal = ['groups', 'user_permissions']
    autocomplete_fields = ['learning_center']

    fieldsets = (
        ('Account', {'fields': ('email', 'password')}),
        ('Personal', {'fields': ('full_name',)}),
        ('Role & subscription', {
            'fields': ('user_type', 'subscription_end_date', 'learning_center'),
            'description': 'Premium access requires a future subscription end date (super admins always have access).',
        }),
        ('Permissions', {
            'classes': ['tab'],
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Dates', {'classes': ['tab'], 'fields': ('date_joined', 'last_login')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'user_type', 'learning_center', 'password1', 'password2'),
        }),
    )

    @display(description='Role', label={
        'guest': 'default', 'free': 'info', 'premium': 'success',
        'center_admin': 'warning', 'super_admin': 'danger',
    })
    def role_badge(self, obj):
        return obj.user_type, obj.get_user_type_display()
