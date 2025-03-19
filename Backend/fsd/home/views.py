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

@api_token_required
def my_profile(request):
    print("User ID:", request.user.id)
    print("User:", request.user)
    if request.method == 'GET':
        try:
            profile = MentorProfile.objects.get(user=request.user)
            data = {
                'id': profile.id,
                'bio': profile.bio,
                'skills': [skill.name for skill in profile.skills.all()],
                'competition_types': [ct.name for ct in profile.competition_types.all()]
            }
            return JsonResponse(data)
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
@require_http_methods(["PUT"])
@csrf_exempt  # Required only for PUT/multipart; you can handle CSRF manually if needed
def update_mentor_profile(request, mentor_id):
    print("Request content type:", request.content_type)
    print("Mentor ID:", mentor_id)
    print("Put Data:", request.POST)
    print("Files Data:", request.FILES)
    try:
        if request.content_type.startswith('multipart/form-data'):
            put_data = request.POST
            files_data = request.FILES
        else:
            return JsonResponse({'error': 'Unsupported content type'}, status=400)

        try:
            profile = MentorProfile.objects.get(id=mentor_id)
        except MentorProfile.DoesNotExist:
            return JsonResponse({'error': 'Mentor profile not found'}, status=404)

        profile.full_name = put_data.get('full_name', profile.full_name)
        profile.years_of_experience = put_data.get('years_of_experience', profile.years_of_experience)
        profile.bio = put_data.get('bio', profile.bio)

        if 'profile_picture' in files_data:
            profile.profile_picture = files_data['profile_picture']

        profile.save()

        return JsonResponse({'message': 'Profile updated successfully!'})

    except Exception as e:
        return JsonResponse({'error': 'Error updating profile: ' + str(e)}, status=500)

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
