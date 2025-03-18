


from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    CustomUser, MentorProfile, StudentProfile, Skill, StudentSkill,
    SDG, CompetitionType, Competition
)

# Custom User Admin
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('username', 'email', 'role', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('role',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('role',)}),
    )
    search_fields = ('username', 'email')
    ordering = ('username',)

admin.site.register(CustomUser, CustomUserAdmin)

# MentorProfile Admin
@admin.register(MentorProfile)
class MentorProfileAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'mentor_type', 'department', 'availability_status', 'is_verified', 'created_at')
    list_filter = ('mentor_type', 'availability_status', 'is_verified', 'department')
    search_fields = ('full_name', 'user__username', 'department', 'skills__name', 'city', 'country')
    readonly_fields = ('created_at', 'updated_at')

# StudentProfile Admin
@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'student_id', 'department', 'education_level', 'year_of_study', 'is_active')
    list_filter = ('education_level', 'year_of_study', 'department', 'is_active')
    search_fields = ('full_name', 'student_id', 'user__username', 'skills__name', 'city', 'country')
    readonly_fields = ('created_at', 'updated_at')

# Skill Admin
@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'category')
    list_filter = ('category',)
    search_fields = ('name',)

# StudentSkill Admin
@admin.register(StudentSkill)
class StudentSkillAdmin(admin.ModelAdmin):
    list_display = ('student', 'skill', 'proficiency_level', 'years_of_experience', 'projects_completed')
    list_filter = ('proficiency_level',)
    search_fields = ('student__full_name', 'skill__name')

# SDG Admin
@admin.register(SDG)
class SDGAdmin(admin.ModelAdmin):
    list_display = ('number', 'title')
    search_fields = ('title', 'description')

# CompetitionType Admin
@admin.register(CompetitionType)
class CompetitionTypeAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name', 'description')

# Competition Admin
@admin.register(Competition)
class CompetitionAdmin(admin.ModelAdmin):
    list_display = ('name', 'competition_type', 'start_date', 'end_date', 'status')
    list_filter = ('competition_type', 'status', 'start_date')
    search_fields = ('name', 'competition_type__name', 'description')

