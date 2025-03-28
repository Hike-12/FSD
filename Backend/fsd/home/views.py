from django.views.decorators.csrf import ensure_csrf_cookie, get_token
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login, logout as django_logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.db.utils import IntegrityError
from home.models import CustomUser
import json
from django.views.decorators.csrf import csrf_exempt
from functools import wraps
from django.core.cache import cache
import random
import string


# Modified decorator for token auth
def api_token_required(view_func):
    @wraps(view_func)
    def wrapped(request, *args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Token '):
            print("Authorization Header:", auth_header)
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        token = auth_header.split(' ')[1]
        user_id = cache.get(f'auth_token_{token}')

        print("Authorization Header:", auth_header)
        print("Token:", token)
        print("User ID from cache:", user_id)

        if not user_id:
            return JsonResponse({'error': 'Invalid or expired token'}, status=401)

        try:
            request.user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)

        return view_func(request, *args, **kwargs)
    return wrapped


@csrf_exempt
@require_http_methods(["POST"])
def create_user(request):
    try:
        data = json.loads(request.body)
        print(data)

        required_fields = ['username', 'password', 'role', 'email']
        for field in required_fields:
            if field not in data:
                return JsonResponse({'error': f'Missing field: {field}'}, status=400)

        user = CustomUser.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            role=data['role']
        )

        # Auto-login user after registration (optional)
        # login(request, user)

        return JsonResponse({
            'message': 'User created successfully',
            'role': user.role,
            'username': user.username
        }, status=201)

    except IntegrityError as e:
        if 'home_customuser.email' in str(e):
            return JsonResponse({'error': 'Email must be unique'}, status=400)
        return JsonResponse({'error': 'Integrity error: ' + str(e)}, status=400)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def custom_login(request):
    try:
        print("At start of login", request.body)
        data = json.loads(request.body)
        print("Data", data)
        username = data.get('username')
        password = data.get('password')

        user = authenticate(username=username, password=password)
        print(user)
        if user:
            login(request, user)
            token = ''.join(random.choices(string.ascii_letters + string.digits, k=40))
            
            # Store token in database or cache
            cache.set(f'auth_token_{token}', user.id, timeout=3600*24)
            print("Session ID after login:", request.session.session_key)
            print("Session contents:", dict(request.session))
            print("Is user authenticated after login:", request.user.is_authenticated)
            response = JsonResponse({
                'message': 'Login successful',
                'role': user.role,
                'username': user.username,
                'token':token,
            })
            print("Cookies being set:", response.cookies)
            return response
        return JsonResponse({'error': 'Invalid credentials'}, status=400)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@require_http_methods(["POST"])
def custom_logout(request):
    try:
        django_logout(request)
        return JsonResponse({'message': 'User logged out successfully'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

# Utility decorator for role-based access
def role_required(allowed_roles):
    def decorator(view_func):
        def wrapper(request, *args, **kwargs):
            if request.user.is_authenticated and request.user.role in allowed_roles:
                return view_func(request, *args, **kwargs)
            return JsonResponse({'error': 'Forbidden'}, status=403)
        return wrapper
    return decorator


##############################################################################################################################################
##############################################################################################################################################

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import MentorProfile, Skill, CompetitionType
import json
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.http import QueryDict
import os
from django.shortcuts import get_object_or_404


@api_token_required
def my_profile(request):
    print("User ID:", request.user.id)
    print("User:", request.user)

    if request.method == 'GET':
        try:
            profile = MentorProfile.objects.get(user=request.user)

            data = {
                'id': profile.id,
                'full_name': profile.full_name,
                'date_of_birth': profile.date_of_birth,
                'gender': profile.gender,
                'phone_number': profile.phone_number,
                'address': profile.address,
                'country': profile.country,
                'state': profile.state,
                'city': profile.city,
                'postal_code': profile.postal_code,
                'mentor_type': profile.mentor_type,
                'department': profile.department,
                'expertise': profile.expertise,
                'years_of_experience': profile.years_of_experience,
                'current_company': profile.current_company,
                'current_position': profile.current_position,
                'skills': [skill.name for skill in profile.skills.all()],
                'competition_types': [ct.name for ct in profile.competition_types.all()],
                'past_mentorship_count': profile.past_mentorship_count,
                'linkedin': profile.linkedin,
                'github': profile.github,
                'website': profile.website,
                'bio': profile.bio,
                'certifications': profile.certifications,
                'achievements': profile.achievements,
                'languages_spoken': profile.languages_spoken,
                'availability_status': profile.availability_status,
                'available_days': profile.available_days,
                'available_times': profile.available_times,
                'max_teams': profile.max_teams,
                'current_teams_count': profile.current_teams_count,
                'profile_picture': request.build_absolute_uri(profile.profile_picture.url) if profile.profile_picture else None,
                'created_at': profile.created_at.isoformat() if profile.created_at else None,
                'updated_at': profile.updated_at.isoformat() if profile.updated_at else None,
                'is_verified': profile.is_verified,
                'average_rating': float(profile.average_rating) if profile.average_rating is not None else None,
            }

            return JsonResponse(data, status=200)

        except MentorProfile.DoesNotExist:
            return JsonResponse({'error': 'Mentor profile not found for this user.'}, status=404)

    return JsonResponse({'error': 'Invalid HTTP method'}, status=405)

@api_token_required
@csrf_exempt
def get_all_mentors(request):
    mentors = MentorProfile.objects.all().values(
        'id', 'full_name', 'date_of_birth', 'gender', 'phone_number', 
        'address', 'country', 'state', 'city', 'postal_code', 
        'mentor_type', 'department', 'expertise', 'years_of_experience', 
        'current_company', 'current_position', 'past_mentorship_count', 
        'linkedin', 'github', 'website', 'bio', 'certifications', 
        'achievements', 'languages_spoken', 'availability_status', 
        'available_days', 'available_times', 'max_teams', 'current_teams_count', 
        'profile_picture', 'is_verified', 'average_rating', 'created_at', 'updated_at'
    )
    
    return JsonResponse(list(mentors), safe=False)

@api_token_required
@csrf_exempt
def mentor_detail(request, id):
    mentor = get_object_or_404(MentorProfile, id=id)
    
    mentor_data = {
        "id": mentor.id,
        "full_name": mentor.full_name,
        "gender": mentor.gender,
        "date_of_birth": str(mentor.date_of_birth),
        "phone_number": mentor.phone_number,
        "email": mentor.user.email if mentor.user else None,
        "mentor_type": mentor.mentor_type,
        "address": mentor.address,
        "city": mentor.city,
        "state": mentor.state,
        "country": mentor.country,
        "postal_code": mentor.postal_code,
        "department": mentor.department,
        "expertise": mentor.expertise,
        "years_of_experience": mentor.years_of_experience,
        "current_position": mentor.current_position,
        "current_company": mentor.current_company,
        "current_teams_count": mentor.current_teams_count,
        "max_teams": mentor.max_teams,
        "past_mentorship_count": mentor.past_mentorship_count,
        "availability_status": mentor.availability_status,
        "available_days": mentor.available_days,
        "available_times": mentor.available_times,
        "languages_spoken": mentor.languages_spoken,
        "bio": mentor.bio,
        "certifications": mentor.certifications,
        "achievements": mentor.achievements,
        "average_rating": str(mentor.average_rating),
        "created_at": mentor.created_at,
        "updated_at": mentor.updated_at,
        "is_verified": mentor.is_verified,
        "linkedin": mentor.linkedin,
        "github": mentor.github,
        "website": mentor.website,
        "profile_picture": mentor.profile_picture.url if mentor.profile_picture else "",
    }

    return JsonResponse(mentor_data)

@api_token_required
@require_http_methods(["POST"])
def create_or_update_profile(request):
    try:
        data = json.loads(request.body)
        profile, created = MentorProfile.objects.get_or_create(user=request.user)

        profile.bio = data.get('bio', profile.bio)
        profile.save()

        if 'skills' in data:
            skill_names = data['skills']
            skills = Skill.objects.filter(name__in=skill_names)
            profile.skills.set(skills)

        if 'competition_types' in data:
            comp_names = data['competition_types']
            comps = CompetitionType.objects.filter(name__in=comp_names)
            profile.competition_types.set(comps)

        result = {
            'id': profile.id,
            'bio': profile.bio,
            'skills': [skill.name for skill in profile.skills.all()],
            'competition_types': [ct.name for ct in profile.competition_types.all()]
        }

        return JsonResponse(result, status=201 if created else 200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@api_token_required
@require_http_methods(["POST"])
@csrf_exempt
def update_mentor_profile(request, mentor_id):
    print("Request content type:", request.content_type)
    print("Mentor ID:", mentor_id)

    try:
        put_data = request.POST.copy()
        files_data = request.FILES

        for key in put_data:
            print(f"Field {key}: {put_data[key]}")

        try:
            profile = MentorProfile.objects.get(id=mentor_id)
        except MentorProfile.DoesNotExist:
            return JsonResponse({'error': 'Mentor profile not found'}, status=404)

        fields_updated = []

        # 🔥 NEW CLEANER FUNCTION
        def clean_and_assign_profile_data(profile, data, int_fields=None):
            int_fields = int_fields or []
            for key, value in data.items():
                if value in ['', None, 'null']:
                    cleaned_value = None
                elif key in int_fields:
                    try:
                        cleaned_value = int(value)
                    except (ValueError, TypeError):
                        cleaned_value = None
                else:
                    cleaned_value = value
                if hasattr(profile, key):
                    setattr(profile, key, cleaned_value)
                    fields_updated.append(key)

        # All integer fields for safe casting
        int_fields = ['years_of_experience', 'max_teams']

        # 🎯 Clean and assign everything
        clean_and_assign_profile_data(profile, put_data, int_fields)

        # 🔄 Handle M2M: skill_ids
        if 'skill_ids' in put_data:
            skill_ids = put_data.getlist('skill_ids')
            if skill_ids:
                profile.skills.clear()
                profile.skills.add(*skill_ids)
                fields_updated.append('skills')

        # 🔄 Handle M2M: competition_type_ids
        if 'competition_type_ids' in put_data:
            competition_ids = put_data.getlist('competition_type_ids')
            if competition_ids:
                profile.competition_types.clear()
                profile.competition_types.add(*competition_ids)
                fields_updated.append('competition_types')

        # 📸 File upload: profile_picture
        if 'profile_picture' in files_data:
            if profile.profile_picture and os.path.isfile(profile.profile_picture.path):
                print(f"Deleting old image: {profile.profile_picture.path}")
                os.remove(profile.profile_picture.path)

            profile.profile_picture = files_data['profile_picture']
            fields_updated.append('profile_picture')

        profile.save()

        print(f"Updated fields: {fields_updated}")
        return JsonResponse({
            'message': 'Profile updated successfully!',
            'updated_fields': fields_updated
        })

    except Exception as e:
        print(f"Error updating profile: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': f'Error updating profile: {str(e)}'}, status=500)


@api_token_required
def list_skills(request):
    if request.method == 'GET':
        skills = Skill.objects.all()
        data = [{'id': skill.id, 'name': skill.name} for skill in skills]
        return JsonResponse({'skills': data})

    return JsonResponse({'error': 'Invalid HTTP method'}, status=405)

@api_token_required
def list_competition_types(request):
    if request.method == 'GET':
        comps = CompetitionType.objects.all()
        data = [{'id': comp.id, 'name': comp.name} for comp in comps]
        return JsonResponse({'competition_types': data})

    return JsonResponse({'error': 'Invalid HTTP method'}, status=405)

@api_token_required
@require_http_methods(["GET"])
def get_user_info(request):
    return JsonResponse({
        'username': request.user.username,
        'email': request.user.email,
        'role': request.user.role
    })

##############################################################################################################################################
##############################################################################################################################################
                                                # STUDENTS KA PART

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import StudentProfile, Skill, CompetitionType, Competition
import json
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.http import QueryDict
import os


def clean_field_value(field_name, value):
    boolean_fields = ['is_active']
    float_fields = ['gpa']

    if field_name in boolean_fields:
        # Convert to boolean from string
        return str(value).lower() == 'true'
    elif field_name in float_fields:
        try:
            return float(value)
        except (ValueError, TypeError):
            return None
    return value  # Default: return as-is

def update_student_profile_fields(profile, data, files=None):
    fields_updated = []
    simple_fields = [
        'full_name', 'date_of_birth', 'gender', 'phone_number', 
        'address', 'country', 'state', 'city', 'postal_code',
        'education_level', 'student_id', 'department', 'year_of_study',
        'gpa', 'extracurricular_activities', 'achievements',
        'preferred_team_roles', 'emergency_contact_name', 'emergency_contact_number',
        'hobbies', 'career_goal', 'languages_spoken', 'learning_style',
        'linkedin', 'github', 'portfolio', 'is_active'
    ]

    for field in simple_fields:
        if field in data:
            cleaned_value = clean_field_value(field, data[field])
            setattr(profile, field, cleaned_value)
            fields_updated.append(field)

    # Handle many-to-many relationships
    if 'skill_ids' in data:
        skill_ids = data.getlist('skill_ids')
        profile.skills.set(Skill.objects.filter(id__in=skill_ids))
        fields_updated.append('skills')

    if 'competition_type_ids' in data:
        comp_ids = data.getlist('competition_type_ids')
        profile.preferred_competition_types.set(CompetitionType.objects.filter(id__in=comp_ids))
        fields_updated.append('preferred_competition_types')

    if 'past_competition_ids' in data:
        past_comp_ids = data.getlist('past_competition_ids')
        profile.past_competitions.set(Competition.objects.filter(id__in=past_comp_ids))
        fields_updated.append('past_competitions')

    # Handle profile picture upload
    if files and 'profile_picture' in files:
        if profile.profile_picture and os.path.isfile(profile.profile_picture.path):
            os.remove(profile.profile_picture.path)
        profile.profile_picture = files['profile_picture']
        fields_updated.append('profile_picture')

    profile.save()
    return fields_updated

@api_token_required
@csrf_exempt
def get_all_students(request):
    if request.method == "GET":
        students = StudentProfile.objects.all().values(
            'id', 'full_name', 'date_of_birth', 'gender', 'phone_number',
            'address', 'country', 'state', 'city', 'postal_code',
            'education_level', 'student_id', 'department', 'year_of_study', 'gpa',
            'extracurricular_activities', 'achievements',
            'preferred_team_roles', 'emergency_contact_name', 'emergency_contact_number',
            'hobbies', 'career_goal', 'languages_spoken', 'learning_style',
            'profile_picture', 'linkedin', 'github', 'portfolio',
            'created_at', 'updated_at', 'is_active'
        )
        return JsonResponse(list(students), safe=False)
    return JsonResponse({"error": "Invalid request method"}, status=400)

@api_token_required
@csrf_exempt
def get_student_detail(request, student_id):
    student = get_object_or_404(StudentProfile, id=student_id)
    
    student_data = {
        "id": student.id,
        "full_name": student.full_name,
        "date_of_birth": student.date_of_birth,
        "gender": student.gender,
        "phone_number": student.phone_number,
        "address": student.address,
        "country": student.country,
        "state": student.state,
        "city": student.city,
        "postal_code": student.postal_code,
        "education_level": student.education_level,
        "student_id": student.student_id,
        "department": student.department,
        "year_of_study": student.year_of_study,
        "gpa": student.gpa,
        "extracurricular_activities": student.extracurricular_activities,
        "achievements": student.achievements,
        "certifications": student.certifications,
        "projects": student.projects,
        "internships": student.internships,
        "preferred_team_roles": student.preferred_team_roles,
        "emergency_contact_name": student.emergency_contact_name,
        "emergency_contact_number": student.emergency_contact_number,
        "hobbies": student.hobbies,
        "career_goal": student.career_goal,
        "languages_spoken": student.languages_spoken,
        "learning_style": student.learning_style,
        "profile_picture": student.profile_picture.url if student.profile_picture else None,
        "linkedin": student.linkedin,
        "github": student.github,
        "portfolio": student.portfolio,
        "created_at": student.created_at,
        "updated_at": student.updated_at,
        "is_active": student.is_active,
    }
    
    return JsonResponse(student_data)

@api_token_required
def student_profile(request):
    print("Request content type:", request.content_type)
    print("User ID:", request.user.id)
    print("User:", request.user)

    if request.method == 'GET':
        try:
            profile = StudentProfile.objects.get(user=request.user)

            data = {
                'id': profile.id,
                'full_name': profile.full_name,
                'date_of_birth': profile.date_of_birth,
                'gender': profile.gender,
                'phone_number': profile.phone_number,
                'address': profile.address,
                'country': profile.country,
                'state': profile.state,
                'city': profile.city,
                'postal_code': profile.postal_code,
                'education_level': profile.education_level,
                'student_id': profile.student_id,
                'department': profile.department,
                'year_of_study': profile.year_of_study,
                'gpa': float(profile.gpa) if profile.gpa is not None else None,
                'skills': [skill.name for skill in profile.skills.all()],
                'extracurricular_activities': profile.extracurricular_activities,
                'achievements': profile.achievements,
                'certifications': profile.certifications,
                'internships': profile.internships,
                'projects': profile.projects,
                'preferred_competition_types': [ct.name for ct in profile.preferred_competition_types.all()],
                'preferred_team_roles': profile.preferred_team_roles,
                'past_competitions': [comp.name for comp in profile.past_competitions.all()],
                'emergency_contact_name': profile.emergency_contact_name,
                'emergency_contact_number': profile.emergency_contact_number,
                'hobbies': profile.hobbies,
                'career_goal': profile.career_goal,
                'languages_spoken': profile.languages_spoken,
                'learning_style': profile.learning_style,
                'linkedin': profile.linkedin,
                'github': profile.github,
                'portfolio': profile.portfolio,
                'profile_picture': request.build_absolute_uri(profile.profile_picture.url) if profile.profile_picture else None,
                'created_at': profile.created_at.isoformat() if profile.created_at else None,
                'updated_at': profile.updated_at.isoformat() if profile.updated_at else None,
                'is_active': profile.is_active,
            }

            return JsonResponse(data, status=200)

        except StudentProfile.DoesNotExist:
            print("Student profile not found for this user.")
            return JsonResponse({'error': 'Student profile not found for this user.'}, status=404)

    return JsonResponse({'error': 'Invalid HTTP method'}, status=405)

@api_token_required
@require_http_methods(["POST"])
def create_or_update_student_profile(request):
    try:
        data = json.loads(request.body)
        profile, created = StudentProfile.objects.get_or_create(user=request.user)

        # Update basic fields
        if 'full_name' in data:
            profile.full_name = data['full_name']
        if 'career_goal' in data:
            profile.career_goal = data['career_goal']
        
        # Handle many-to-many relationships
        if 'skills' in data:
            skill_names = data['skills']
            skills = Skill.objects.filter(name__in=skill_names)
            # Direct many-to-many relationship, no through model
            profile.skills.set(skills)

        if 'preferred_competition_types' in data:
            comp_names = data['preferred_competition_types']
            comps = CompetitionType.objects.filter(name__in=comp_names)
            profile.preferred_competition_types.set(comps)
            
        if 'past_competitions' in data:
            comp_ids = data['past_competitions']
            competitions = Competition.objects.filter(id__in=comp_ids)
            profile.past_competitions.set(competitions)

        profile.save()

        result = {
            'id': profile.id,
            'full_name': profile.full_name,
            'career_goal': profile.career_goal,
            'skills': [skill.name for skill in profile.skills.all()],
            'preferred_competition_types': [ct.name for ct in profile.preferred_competition_types.all()],
            'past_competitions': [comp.name for comp in profile.past_competitions.all()]
        }

        return JsonResponse(result, status=201 if created else 200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@api_token_required
@require_http_methods(["POST"])
@csrf_exempt
def update_student_profile(request, student_id):
    print("Request content type:", request.content_type)
    print("Student ID:", student_id)

    try:
        put_data = request.POST.copy()
        files_data = request.FILES

        # Log incoming data
        print("PUT data keys:", list(put_data.keys()))
        print("FILES keys:", list(files_data.keys()))

        profile = StudentProfile.objects.get(id=student_id)

        updated_fields = update_student_profile_fields(profile, put_data, files_data)

        print(f"Updated fields: {updated_fields}")
        return JsonResponse({
            'message': 'Student profile updated successfully!',
            'updated_fields': updated_fields
        })

    except StudentProfile.DoesNotExist:
        return JsonResponse({'error': 'Student profile not found'}, status=404)
    except Exception as e:
        print(f"Error updating profile: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': f'Error updating student profile: {str(e)}'}, status=500)

    
    
##############################################################################################################################################
##############################################################################################################################################

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from .models import Competition

@api_token_required
@csrf_exempt
def competitions_list(request):
    """
    List all competitions.
    """
    competitions = Competition.objects.all()
    
    # Build the response data manually
    result = []
    for comp in competitions:
        competition_data = {
            'id': comp.id,
            'name': comp.name,
            'description': comp.description,
            'start_date': comp.start_date.isoformat() if comp.start_date else None,
            'end_date': comp.end_date.isoformat() if comp.end_date else None,
            'registration_deadline': comp.registration_deadline.isoformat() if comp.registration_deadline else None,
            'min_team_size': comp.min_team_size,
            'max_team_size': comp.max_team_size,
            'status': comp.status,
            'organizer': comp.organizer,
            'venue': comp.venue,
            'website': comp.website,
            'competition_type_id': comp.competition_type_id,
            'competition_type_name': comp.competition_type.name if comp.competition_type else "",
        }
        result.append(competition_data)
    
    return JsonResponse(result, safe=False)

@api_token_required
@csrf_exempt
def competition_detail(request, competition_id):
    """
    Get details for a specific competition.
    """
    try:
        comp = Competition.objects.get(id=competition_id)
        
        # Build the response data manually
        competition_data = {
            'id': comp.id,
            'name': comp.name,
            'description': comp.description,
            'start_date': comp.start_date.isoformat() if comp.start_date else None,
            'end_date': comp.end_date.isoformat() if comp.end_date else None,
            'registration_deadline': comp.registration_deadline.isoformat() if comp.registration_deadline else None,
            'min_team_size': comp.min_team_size,
            'max_team_size': comp.max_team_size,
            'status': comp.status,
            'organizer': comp.organizer,
            'venue': comp.venue,
            'website': comp.website,
            'competition_type_id': comp.competition_type_id,
            'competition_type_name': comp.competition_type.name if comp.competition_type else "",
        }
        
        return JsonResponse(competition_data, safe=False)
        
    except Competition.DoesNotExist:
        return JsonResponse({'error': 'Competition not found'}, status=404)
    
##################################################################################################################################################
##################################################################################################################################################

from home.models import Host

@api_token_required
@csrf_exempt
def create_or_update_host_profile(request):
    try:
        data = json.loads(request.body)
        host, created = Host.objects.get_or_create(user=request.user)

        # Update basic fields
        if 'full_name' in data:
            host.full_name = data['full_name']
        if 'email' in data:
            host.email = data['email']
        if 'contact_number' in data:
            host.contact_number = data['contact_number']

        host.save()

        result = {
            # 'id': host.id,
            'full_name': host.full_name,
            'email': host.email,
            'contact_number': host.contact_number
        }

        return JsonResponse(result, status=201 if created else 200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)