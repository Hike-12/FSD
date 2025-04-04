from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import *

# Custom User Admin
@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('username', 'email', 'role', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active')
    fieldsets = UserAdmin.fieldsets + ((None, {'fields': ('role',)}),)
    add_fieldsets = UserAdmin.add_fieldsets + ((None, {'fields': ('role',)}),)
    search_fields = ('username', 'email')
    ordering = ('username',)

# Generic Admin for simple models
class DefaultAdmin(admin.ModelAdmin):
    pass

# Register all models with DefaultAdmin unless customized
admin.site.register(MentorProfile, DefaultAdmin)
admin.site.register(StudentProfile, DefaultAdmin)
admin.site.register(Skill, DefaultAdmin)
admin.site.register(SDG, DefaultAdmin)
admin.site.register(CompetitionType, DefaultAdmin)
admin.site.register(Competition, DefaultAdmin)
admin.site.register(Team, DefaultAdmin)
admin.site.register(TeamInvitation, DefaultAdmin)
admin.site.register(MentorshipSession, DefaultAdmin)
admin.site.register(ProjectSubmission, DefaultAdmin)
admin.site.register(Host, DefaultAdmin)
admin.site.register(Task, DefaultAdmin)

