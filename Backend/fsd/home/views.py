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
                'profile_picture': profile.profile_picture.url if profile.profile_picture else None,
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
        # For PUT requests with multipart/form-data, Django has quirks
        # In Django, request.POST only gets populated for POST requests
        # For PUT requests with multipart/form-data, we need to access request.body
        # but Django has already consumed the stream to check for POST data
        
        # Let's see what we have available
        print("PUT data keys:", list(request.POST.keys()))
        print("FILES keys:", list(request.FILES.keys()))
        # Create a data dictionary that combines POST and body data
        put_data = request.POST.copy()  # Start with any data Django managed to parse
        files_data = request.FILES
        
        for key in put_data:
            print(f"Field {key}: {put_data[key]}")

        if 'id' in put_data:
            print(f"Received ID (should not be here!): {put_data['id']}")
        # Add debugging to see exactly what's coming in
        for key in put_data:
            print(f"Field {key}: {put_data[key]}")
        
        # Get the profile or return 404
        try:
            profile = MentorProfile.objects.get(id=mentor_id)
        except MentorProfile.DoesNotExist:
            return JsonResponse({'error': 'Mentor profile not found'}, status=404)
        
        # Track which fields we update
        fields_updated = []
        
        # Define all fields that can be updated
        fields = [
            'full_name', 'date_of_birth', 'gender', 'phone_number', 
            'address', 'country', 'state', 'city', 'postal_code',
            'mentor_type', 'department', 'expertise', 'years_of_experience',
            'current_company', 'current_position', 'linkedin', 'github',
            'website', 'bio', 'certifications', 'achievements',
            'languages_spoken', 'availability_status', 'available_days',
            'available_times', 'max_teams'
        ]

        
        # Loop through each field and update if present
        for field in fields:
            if field in put_data:
                print(f"Updating {field} to: {put_data[field]}")
                # Use setattr to dynamically set the attribute
                setattr(profile, field, put_data[field])
                fields_updated.append(field)
        
        # Handle arrays - skill_ids and competition_type_ids
        # Assuming you have many-to-many relationships
        if 'skill_ids' in put_data:
            skill_ids = put_data.getlist('skill_ids')  # Use getlist to get all values
            if skill_ids:
                profile.skills.clear()  # Clear existing
                profile.skills.add(*skill_ids)  # Add new ones
                fields_updated.append('skills')
        
        if 'competition_type_ids' in put_data:
            competition_ids = put_data.getlist('competition_type_ids')
            if competition_ids:
                profile.competition_types.clear()
                profile.competition_types.add(*competition_ids)
                fields_updated.append('competition_types')
        
        # Handle file upload
        if 'profile_picture' in files_data:
    # Delete the old image if it exists
            if profile.profile_picture and os.path.isfile(profile.profile_picture.path):
                print(f"Deleting old image: {profile.profile_picture.path}")
                os.remove(profile.profile_picture.path)

            # Assign the new image
            profile.profile_picture = files_data['profile_picture']
            fields_updated.append('profile_picture')
        
        # Save the updated profile
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


from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import StudentProfile, Skill, CompetitionType, Competition
import json
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.http import QueryDict
import os

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
                'profile_picture': profile.profile_picture.url if profile.profile_picture else None,
                'created_at': profile.created_at.isoformat() if profile.created_at else None,
                'updated_at': profile.updated_at.isoformat() if profile.updated_at else None,
                'is_active': profile.is_active,
            }

            return JsonResponse(data, status=200)

        except StudentProfile.DoesNotExist:
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
        # For handling multipart/form-data in PUT requests
        print("PUT data keys:", list(request.POST.keys()))
        print("FILES keys:", list(request.FILES.keys()))
        put_data = request.POST.copy()
        files_data = request.FILES
        
        for key in put_data:
            print(f"Field {key}: {put_data[key]}")
        
        # Get the profile or return 404
        try:
            profile = StudentProfile.objects.get(id=student_id)
        except StudentProfile.DoesNotExist:
            return JsonResponse({'error': 'Student profile not found'}, status=404)
        
        # Track which fields we update
        fields_updated = []
        
        # Define all fields that can be updated
        fields = [
            'full_name', 'date_of_birth', 'gender', 'phone_number', 
            'address', 'country', 'state', 'city', 'postal_code',
            'education_level', 'student_id', 'department', 'year_of_study',
            'gpa', 'extracurricular_activities', 'achievements',
            'preferred_team_roles', 'emergency_contact_name', 'emergency_contact_number',
            'hobbies', 'career_goal', 'languages_spoken', 'learning_style',
            'linkedin', 'github', 'portfolio', 'is_active'
        ]
        
        # Loop through each field and update if present
        for field in fields:
            if field in put_data:
                print(f"Updating {field} to: {put_data[field]}")
                # Use setattr to dynamically set the attribute
                setattr(profile, field, put_data[field])
                fields_updated.append(field)
        
        # Handle arrays - skills, preferred_competition_types, and past_competitions
        if 'skill_ids' in put_data:
            skill_ids = put_data.getlist('skill_ids')
            if skill_ids:
                profile.skills.clear()
                profile.skills.add(*Skill.objects.filter(id__in=skill_ids))
                fields_updated.append('skills')
        
        if 'competition_type_ids' in put_data:
            competition_ids = put_data.getlist('competition_type_ids')
            if competition_ids:
                profile.preferred_competition_types.clear()
                profile.preferred_competition_types.add(*CompetitionType.objects.filter(id__in=competition_ids))
                fields_updated.append('preferred_competition_types')
                
        if 'past_competition_ids' in put_data:
            past_comp_ids = put_data.getlist('past_competition_ids')
            if past_comp_ids:
                profile.past_competitions.clear()
                profile.past_competitions.add(*Competition.objects.filter(id__in=past_comp_ids))
                fields_updated.append('past_competitions')
        
        # Handle file upload
        if 'profile_picture' in files_data:
            # Delete the old image if it exists
            if profile.profile_picture and os.path.isfile(profile.profile_picture.path):
                print(f"Deleting old image: {profile.profile_picture.path}")
                os.remove(profile.profile_picture.path)

            # Assign the new image
            profile.profile_picture = files_data['profile_picture']
            fields_updated.append('profile_picture')
        
        # Save the updated profile
        profile.save()
        
        print(f"Updated fields: {fields_updated}")
        return JsonResponse({
            'message': 'Student profile updated successfully!',
            'updated_fields': fields_updated
        })

    except Exception as e:
        print(f"Error updating profile: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': f'Error updating student profile: {str(e)}'}, status=500)