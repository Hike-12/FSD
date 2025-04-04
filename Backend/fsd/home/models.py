from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator, RegexValidator

class CustomUser(AbstractUser):
    id = models.AutoField(primary_key=True)  # Explicitly define the id field
    ROLES = (
        ('STUDENT', 'Student'),
        ('HOST', 'Host'),
        ('MENTOR', 'Mentor'),
        ('MANAGEMENT', 'Management')
    )
    role = models.CharField(max_length=20, choices=ROLES, default='STUDENT')
    # Add other fields as needed
    email = models.EmailField(unique=True)

# Enhanced MentorProfile
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator, RegexValidator

class MentorProfile(models.Model):
    id = models.AutoField(primary_key=True)  # Explicitly define the id field
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('non_binary', 'Non-binary'),
        ('prefer_not_to_say', 'Prefer not to say'),
        ('other', 'Other'),
    ]
    
    AVAILABILITY_STATUS = [
        ('available', 'Available'),
        ('limited', 'Limited Availability'),
        ('unavailable', 'Unavailable'),
    ]
    
    MENTOR_TYPES = [
        ('faculty', 'Faculty'),
        ('industry', 'Industry Expert'),
        ('alumni', 'Alumni'),
        ('other', 'Other'),
    ]

    # User Relationship
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='mentor_profile',
        null=True, blank=True
    )
    
    # Basic Info
    full_name = models.CharField(max_length=100, null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, default='prefer_not_to_say', null=True, blank=True)
    phone_number = models.CharField(
        max_length=15,
        validators=[RegexValidator(r'^\+?1?\d{9,15}$', message="Phone number must be entered in format: '+999999999'")],
        null=True, blank=True
    )
    
    # Location
    address = models.TextField(blank=True, null=True)
    country = models.CharField(max_length=50, null=True, blank=True)
    state = models.CharField(max_length=50, blank=True, null=True)
    city = models.CharField(max_length=50, null=True, blank=True)
    postal_code = models.CharField(max_length=10, blank=True, null=True)
    
    # Professional Details
    mentor_type = models.CharField(max_length=20, choices=MENTOR_TYPES, default='faculty', null=True, blank=True)
    department = models.CharField(max_length=100, null=True, blank=True)
    expertise = models.CharField(max_length=200, null=True, blank=True)
    years_of_experience = models.PositiveIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(70)],
        null=True, blank=True
    )
    current_company = models.CharField(max_length=100, blank=True, null=True)
    current_position = models.CharField(max_length=100, null=True, blank=True)
    
    # Skills and Competition Expertise
    skills = models.ManyToManyField('Skill', related_name='mentors', blank=True)
    competition_types = models.ManyToManyField('CompetitionType', related_name='mentors', blank=True)
    past_mentorship_count = models.PositiveIntegerField(default=0, null=True, blank=True)
    
    # Online Presence
    linkedin = models.URLField(blank=True, null=True)
    github = models.URLField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    
    # Bio and Additional Info
    bio = models.TextField(blank=True, null=True)
    certifications = models.TextField(help_text="List of certifications", blank=True, null=True)
    achievements = models.TextField(blank=True, null=True)
    languages_spoken = models.CharField(max_length=200, help_text="Comma separated languages", blank=True, null=True)
    
    # Mentorship Availability
    availability_status = models.CharField(max_length=15, choices=AVAILABILITY_STATUS, default='available', null=True, blank=True)
    available_days = models.CharField(max_length=100, help_text="E.g., Monday, Wednesday", blank=True, null=True)
    available_times = models.CharField(max_length=100, help_text="E.g., 10am - 2pm", blank=True, null=True)
    max_teams = models.PositiveIntegerField(default=3, help_text="Maximum number of teams to mentor simultaneously", null=True, blank=True)
    current_teams_count = models.PositiveIntegerField(default=0, null=True, blank=True)
    
    # Profile Picture
    profile_picture = models.ImageField(upload_to='mentor_profiles/', null=True, blank=True)
    
    # Metadata and Ratings
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_verified = models.BooleanField(default=False, null=True, blank=True)
    average_rating = models.DecimalField(
        max_digits=3, 
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        null=True, blank=True
    )
    
    class Meta:
        verbose_name = "Mentor Profile"
        verbose_name_plural = "Mentor Profiles"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Mentor: {self.full_name or 'Unnamed Mentor'}"

    

class StudentProfile(models.Model):
    id = models.AutoField(primary_key=True)  # Explicitly define the id field
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('non_binary', 'Non-binary'),
        ('prefer_not_to_say', 'Prefer not to say'),
        ('other', 'Other'),
    ]
    
    EDUCATION_LEVEL_CHOICES = [
        ('undergraduate', 'Undergraduate'),
        ('graduate', 'Graduate'),
        ('phd', 'PhD'),
        ('other', 'Other'),
    ]
    
    YEAR_CHOICES = [
        ('first', 'First Year'),
        ('second', 'Second Year'),
        ('third', 'Third Year'),
        ('fourth', 'Fourth Year'),
        ('fifth', 'Fifth Year'),
        ('other', 'Other'),
    ]

    # User Relationship
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='student_profile',
        null=True, 
        blank=True
    )
    
    # Basic Info
    full_name = models.CharField(max_length=100, null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, default='prefer_not_to_say', null=True, blank=True)
    phone_number = models.CharField(
        max_length=15,
        validators=[RegexValidator(r'^\+?1?\d{9,15}$', message="Phone number must be entered in format: '+999999999'")],
        null=True,
        blank=True
    )
    
    # Location
    address = models.TextField(blank=True, null=True)
    country = models.CharField(max_length=50, null=True, blank=True)
    state = models.CharField(max_length=50, blank=True, null=True)
    city = models.CharField(max_length=50, null=True, blank=True)
    postal_code = models.CharField(max_length=10, blank=True, null=True)
    
    # Academic Details
    education_level = models.CharField(max_length=15, choices=EDUCATION_LEVEL_CHOICES, null=True, blank=True)
    student_id = models.CharField(max_length=20, unique=True, null=True, blank=True)
    department = models.CharField(max_length=100, null=True, blank=True)
    year_of_study = models.CharField(max_length=10, choices=YEAR_CHOICES, null=True, blank=True)
    gpa = models.FloatField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(0.0), MaxValueValidator(10.0)]
    )
    
    # Skills and Experience
    skills = models.ManyToManyField('Skill', related_name='students', blank=True)
    extracurricular_activities = models.TextField(blank=True, null=True)
    achievements = models.TextField(blank=True, null=True)
    certifications = models.TextField(blank=True, null=True)
    projects = models.TextField(blank=True, null=True)
    internships = models.TextField(blank=True, null=True)

    
    # Competition Preferences
    preferred_competition_types = models.ManyToManyField('CompetitionType', related_name='interested_students', blank=True)
    preferred_team_roles = models.CharField(max_length=200, blank=True, null=True, help_text="E.g., Team Lead, Designer, Developer")
    past_competitions = models.ManyToManyField('Competition', related_name='past_participants', blank=True)
    
    # Contact Info
    emergency_contact_name = models.CharField(max_length=100, blank=True, null=True)
    emergency_contact_number = models.CharField(max_length=15, blank=True, null=True)
    
    # Interests & Goals
    hobbies = models.CharField(max_length=200, help_text="Comma separated hobbies", blank=True, null=True)
    career_goal = models.TextField(blank=True, null=True)
    languages_spoken = models.CharField(max_length=200, help_text="Comma separated languages", blank=True, null=True)
    learning_style = models.CharField(max_length=100, blank=True, null=True, help_text="E.g., Visual, Auditory, Kinesthetic")
    
    # Profile Picture
    profile_picture = models.ImageField(upload_to='student_profiles/', null=True, blank=True)
    
    # Online Presence
    linkedin = models.URLField(blank=True, null=True)
    github = models.URLField(blank=True, null=True)
    portfolio = models.URLField(blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    is_active = models.BooleanField(default=True, null=True, blank=True)
    
    class Meta:
        verbose_name = "Student Profile"
        verbose_name_plural = "Student Profiles"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Student: {self.full_name or 'Unnamed'}"


# New Models

class Skill(models.Model):
    id = models.AutoField(primary_key=True)  # Explicitly define the id field
    SKILL_CATEGORIES = [
        ('technical', 'Technical'),
        ('design', 'Design'),
        ('management', 'Management'),
        ('communication', 'Communication'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=SKILL_CATEGORIES)
    description = models.TextField(blank=True)
    
    class Meta:
        ordering = ['category', 'name']
        unique_together = ['name', 'category']
    
    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"

# class StudentSkill(models.Model):
#     PROFICIENCY_LEVELS = [
#         ('beginner', 'Beginner'),
#         ('intermediate', 'Intermediate'),
#         ('advanced', 'Advanced'),
#         ('expert', 'Expert'),
#     ]
    
#     student = models.ForeignKey('StudentProfile', on_delete=models.CASCADE)
#     skill = models.ForeignKey('Skill', on_delete=models.CASCADE)
#     proficiency_level = models.CharField(max_length=15, choices=PROFICIENCY_LEVELS)
#     years_of_experience = models.FloatField(default=0)
#     projects_completed = models.PositiveIntegerField(default=0)
    
#     class Meta:
#         unique_together = ['student', 'skill']
    
#     def __str__(self):
#         return f"{self.student.full_name} - {self.skill.name} ({self.proficiency_level})"

class SDG(models.Model):
    id = models.AutoField(primary_key=True)  # Explicitly define the id field
    number = models.PositiveIntegerField(unique=True)
    title = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.ImageField(upload_to='sdg_icons/', null=True, blank=True)
    
    def __str__(self):
        return f"SDG {self.number}: {self.title}"

class CompetitionType(models.Model):
    id = models.AutoField(primary_key=True)  # Explicitly define the id field
    name = models.CharField(max_length=100)
    description = models.TextField()
    required_skills = models.ManyToManyField('Skill', related_name='competition_types')
    
    def __str__(self):
        return self.name

class Competition(models.Model):
    id = models.AutoField(primary_key=True)  # Explicitly define the id field
    STATUS_CHOICES = [
        ('upcoming', 'Upcoming'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    name = models.CharField(max_length=200)
    competition_type = models.ForeignKey('CompetitionType', on_delete=models.CASCADE)
    description = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField()
    registration_deadline = models.DateField()
    min_team_size = models.PositiveIntegerField(default=1)
    max_team_size = models.PositiveIntegerField(default=5)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='upcoming')
    
    # Requirements
    required_skills = models.ManyToManyField('Skill', related_name='competitions')
    
    # SDG Mapping
    related_sdgs = models.ManyToManyField('SDG', related_name='competitions', blank=True)
    
    competition_picture = models.ImageField(upload_to='competition_picture/', null=True, blank=True)
    
    # Organization
    organizer = models.CharField(max_length=100)
    venue = models.CharField(max_length=200, blank=True)
    website = models.URLField(blank=True)
    
    # Metadata
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-start_date']
    
    def __str__(self):
        return self.name

class Team(models.Model):
    id = models.AutoField(primary_key=True)  # Explicitly define the id field
    STATUS_CHOICES = [
        ('forming', 'Forming'),
        ('complete', 'Complete'),
        ('active', 'Active'),
        ('disbanded', 'Disbanded'),
    ]
    
    name = models.CharField(max_length=100)
    competition = models.ForeignKey('Competition', on_delete=models.CASCADE, related_name='teams')
    team_leader = models.ForeignKey('StudentProfile', on_delete=models.CASCADE, related_name='led_teams')
    mentor = models.ForeignKey('MentorProfile', on_delete=models.SET_NULL, null=True, blank=True, related_name='mentored_teams')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='forming')
    max_team_size = models.PositiveIntegerField(default=5)
    team_code = models.CharField(max_length=8, unique=True, blank=True)
    
    members = models.ManyToManyField('StudentProfile', related_name='teams', blank=True)
    # SDG Mapping
    related_sdgs = models.ManyToManyField('SDG', related_name='teams', blank=True)
    
    # Team formation
    is_open_for_members = models.BooleanField(default=True)
    required_skills = models.ManyToManyField('Skill', related_name='required_by_teams', blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['name', 'competition']
    
    def __str__(self):
        return f"{self.name} - {self.competition.name}"

class TeamInvitation(models.Model):
    id = models.AutoField(primary_key=True)  # Explicitly define the id field
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('expired', 'Expired'),
    ]
    
    team = models.ForeignKey('Team', on_delete=models.CASCADE, related_name='invitations')
    invited_by = models.ForeignKey('StudentProfile', on_delete=models.CASCADE, related_name='sent_invitations')
    student = models.ForeignKey('StudentProfile', on_delete=models.CASCADE, related_name='received_invitations')
    proposed_role = models.CharField(max_length=100)
    message = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    response_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['team', 'student']
    
    def __str__(self):
        return f"Invitation for {self.student.full_name} to join {self.team.name}"

class MentorshipSession(models.Model):
    id = models.AutoField(primary_key=True)  # Explicitly define the id field
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('rescheduled', 'Rescheduled'),
    ]
    
    team = models.ForeignKey('Team', on_delete=models.CASCADE, related_name='mentorship_sessions')
    mentor = models.ForeignKey('MentorProfile', on_delete=models.CASCADE, related_name='sessions')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='scheduled')
    location = models.CharField(max_length=200, blank=True)
    meeting_link = models.URLField(blank=True)
    
    # Feedback
    mentor_notes = models.TextField(blank=True)
    team_feedback = models.TextField(blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', '-start_time']
    
    def __str__(self):
        return f"{self.title} - {self.team.name} with {self.mentor.full_name}"

class ProjectSubmission(models.Model):
    id = models.AutoField(primary_key=True)  # Explicitly define the id field
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('reviewed', 'Reviewed'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    team = models.ForeignKey('Team', on_delete=models.CASCADE, related_name='submissions')
    competition = models.ForeignKey('Competition', on_delete=models.CASCADE, related_name='submissions')
    title = models.CharField(max_length=200)
    description = models.TextField()
    submission_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    
    # Files
    project_file = models.FileField(upload_to='project_submissions/', null=True, blank=True)
    presentation_file = models.FileField(upload_to='presentations/', null=True, blank=True)
    
    # Evaluation
    evaluator = models.ForeignKey('MentorProfile', on_delete=models.SET_NULL, null=True, blank=True, related_name='evaluations')
    evaluation_date = models.DateTimeField(null=True, blank=True)
    score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    feedback = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-submission_date']
    
    def __str__(self):
        return f"{self.title} by {self.team.name}"
    
    


class Host(models.Model):
    id = models.AutoField(primary_key=True)  # Explicitly define the id field
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    contact_number = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return self.full_name


class Task(models.Model):
    id = models.AutoField(primary_key=True)
    team = models.ForeignKey('Team', on_delete=models.CASCADE, related_name='tasks')
    assigned_by = models.ForeignKey('StudentProfile', on_delete=models.SET_NULL, null=True, related_name='assigned_tasks')
    assigned_to = models.ForeignKey('StudentProfile', on_delete=models.SET_NULL, null=True, related_name='tasks')
    title = models.CharField(max_length=200)
    description = models.TextField()
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} (Assigned to: {self.assigned_to.full_name if self.assigned_to else 'Unassigned'})"

class TeamFile(models.Model):
    id = models.AutoField(primary_key=True)
    team = models.ForeignKey('Team', on_delete=models.CASCADE, related_name='files')
    uploaded_by = models.ForeignKey('StudentProfile', on_delete=models.SET_NULL, null=True, related_name='uploaded_files')
    file = models.FileField(upload_to='team_files/')
    name = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} uploaded by {self.uploaded_by.full_name if self.uploaded_by else 'Unknown'}"
    