from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login, logout as django_logout
from django.http import JsonResponse
from django.db.utils import IntegrityError
from home.models import *
from django.shortcuts import get_object_or_404
import json
from django.views.decorators.csrf import csrf_exempt
from functools import wraps
from django.core.cache import cache
import random
import string
import os
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
import requests
from django.http import FileResponse,HttpResponse
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv())


# Dynamically construct the base directory and model path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # Get the base directory
MODEL_PATH = os.path.join(BASE_DIR, "home", "ml")  # Construct the model path
# Add to your views.py or create a management command
def retrain_recommendation_model():
    # Get all student data from database
    students_data = StudentProfile.objects.all().values(...)
    
    # Create DataFrame and features
    students_df = pd.DataFrame(list(students_data))
    students_df['combined_features'] = students_df.apply(compute_combined_features, axis=1)
    
    # Train new vectorizer and model
    from sklearn.feature_extraction.text import TfidfVectorizer
    new_vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = new_vectorizer.fit_transform(students_df['combined_features'])
    
    from sklearn.neighbors import NearestNeighbors
    nn_model = NearestNeighbors(metric='cosine')
    nn_model.fit(tfidf_matrix)
    
    # Save the updated models
    joblib.dump(nn_model, os.path.join(MODEL_PATH, "nn_model.joblib"))
    joblib.dump(new_vectorizer, os.path.join(MODEL_PATH, "tfidf_vectorizer.joblib"))

# Load the recommendation model and vectorizer
nn_model = joblib.load(os.path.join(MODEL_PATH, "nn_model.joblib"))
tfidf_vectorizer = joblib.load(os.path.join(MODEL_PATH, "tfidf_vectorizer.joblib"))

# Debug code to understand the model structure - run once then remove

# Modify the model loading line
# Old:
# mentor_nn_model = joblib.load(os.path.join(MODEL_PATH, "mentor_recommender_model.joblib"))

# Fix model loading code
mentor_model_data = joblib.load(os.path.join(MODEL_PATH, "mentor_recommender_model.joblib"))

if isinstance(mentor_model_data, tuple):
    print(f"Loading mentor model from tuple with {len(mentor_model_data)} elements")
    # Element 0 is the TfidfVectorizer
    mentor_vectorizer = mentor_model_data[0]
    # Element 1 is the pre-computed mentor features
    mentor_features = mentor_model_data[1]
else:
    mentor_vectorizer = tfidf_vectorizer
    mentor_features = None

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
        print(f"IntegrityError: {e}")
        if 'home_customuser.email' in str(e):
            return JsonResponse({'error': 'Email must be unique'}, status=400)
        return JsonResponse({'error': 'Integrity error: ' + str(e)}, status=400)

    except Exception as e:
        print(f"Error in create_user: {e}")
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
                'id': user.id,
                'role': user.role,
                'username': user.username,
                'token':token,
                'email': user.email,    
            })
            print("Cookies being set:", response.cookies)
            return response
        return JsonResponse({'error': 'Invalid credentials'}, status=400)

    except Exception as e:
        print(f"Error in custom_login: {e}")
        return JsonResponse({'error': str(e)}, status=400)

@require_http_methods(["POST"])
@csrf_exempt
@api_token_required
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
                                                         # MENTORS KA PART
                                                         
                                                         
def compute_student_features_for_mentor_matching(student):
    features = [
        student.department,
        str(student.year_of_study),
        student.career_goal,
        student.languages_spoken,
        str(student.preferred_team_roles),
        # Any other relevant fields that would match with mentor expertise
    ]
    print(features)
    return ' '.join(filter(None, features))

def get_mentor_recommendations(student_id, top_n=20):
    print(f"Getting mentor recommendations for student ID: {student_id}")
    try:
        # Get student data
        student = StudentProfile.objects.get(id=student_id)
        
        # Get all mentors
        mentors_data = MentorProfile.objects.all().values(
            'id', 'full_name', 'mentor_type', 'department', 'expertise', 
            'years_of_experience', 'current_company', 'current_position',
            'skills', 'competition_types', 'availability_status', 'profile_picture',
            'linkedin', 'github', 'website', 'bio', 'average_rating'
        )
        
        # Convert to DataFrame
        mentors_df = pd.DataFrame(list(mentors_data))
        
        if mentors_df.empty:
            print("No mentors found in database")
            return []
        
        # Get student features
        student_features = compute_student_features_for_mentor_matching(student)
        
        # SOLUTION 1: Use a simple ranking approach instead of ML model
        # Convert mentors to feature text for matching
        mentor_texts = []
        for _, mentor in mentors_df.iterrows():
            mentor_text = f"{mentor['department']} {mentor['expertise']} {mentor['current_position']} {mentor.get('skills', '')}"
            mentor_texts.append(mentor_text)
            
        # Use sklearn's TF-IDF vectorizer for both student and mentors
        from sklearn.feature_extraction.text import TfidfVectorizer
        new_vectorizer = TfidfVectorizer(stop_words='english')
        all_texts = [student_features] + mentor_texts
        all_vectors = new_vectorizer.fit_transform(all_texts)
        
        # Get student vector (first one) and mentor vectors (rest)
        student_vector = all_vectors[0:1]
        mentor_vectors = all_vectors[1:]
        
        # Calculate similarity
        from sklearn.metrics.pairwise import cosine_similarity
        similarities = cosine_similarity(student_vector, mentor_vectors).flatten()
        
        # Get indices of top N most similar mentors
        top_indices = similarities.argsort()[-top_n:][::-1]
        
        # Map these indices to actual mentors in the database
        if len(top_indices) > len(mentors_df):
            top_indices = top_indices[:len(mentors_df)]
            
        recommended_mentors = mentors_df.iloc[top_indices].to_dict(orient="records")
        return recommended_mentors
        
    except Exception as e:
        print(f"Error in get_mentor_recommendations: {e}")
        import traceback
        traceback.print_exc()
        return []
    
    
@api_token_required
@csrf_exempt
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
    # Get student ID if provided in query parameters
    student_id = request.GET.get("student_id")
    print("Bhai call toh hua hai", student_id)
    # If student ID is provided, use recommendations
    if student_id:
        try:
            # Get recommendations for the student
            recommended_mentors = get_mentor_recommendations(student_id)
            
            if recommended_mentors:
                # Convert recommendations to list format expected by frontend
                recommended_ids = [mentor['id'] for mentor in recommended_mentors]
                
                # Get all mentors with full details
                all_mentors = MentorProfile.objects.all().values(
                    'id', 'full_name', 'date_of_birth', 'gender', 'phone_number', 
                    'address', 'country', 'state', 'city', 'postal_code', 
                    'mentor_type', 'department', 'expertise', 'years_of_experience', 
                    'current_company', 'current_position', 'past_mentorship_count', 
                    'linkedin', 'github', 'website', 'bio', 'certifications', 
                    'achievements', 'languages_spoken', 'availability_status', 
                    'available_days', 'available_times', 'max_teams', 'current_teams_count', 
                    'profile_picture', 'is_verified', 'average_rating', 'created_at', 'updated_at'
                )
                
                # Convert queryset to list
                mentors_list = list(all_mentors)
                
                # Filter and sort mentors according to recommendations
                filtered_mentors = [
                    mentor for mentor in mentors_list 
                    if mentor['id'] in recommended_ids
                ]
                
                # Sort according to recommendation order
                filtered_mentors.sort(key=lambda x: recommended_ids.index(x['id']))
                
                return JsonResponse(filtered_mentors, safe=False)
            
        except StudentProfile.DoesNotExist:
            return JsonResponse({"error": "Student not found"}, status=404)
        except Exception as e:
            print(f"Error in mentor recommendations: {e}")
            # Fall back to returning all mentors if there's an error
    
    # Default: return all mentors (unchanged original behavior)
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
@csrf_exempt
def create_or_update_profile(request):
    try:
        print("Request content type:", request.content_type)
        data = request.POST
        files = request.FILES
        profile, created = MentorProfile.objects.get_or_create(user=request.user)
        print("Profile created:", created)
        print("data", data)

        # List all fields you want to update
        fields = [
            'full_name', 'date_of_birth', 'gender', 'phone_number', 'address', 'country',
            'state', 'city', 'postal_code', 'mentor_type', 'department', 'expertise',
            'years_of_experience', 'current_company', 'current_position', 'linkedin',
            'github', 'website', 'bio', 'certifications', 'achievements',
            'languages_spoken', 'availability_status', 'available_days', 'available_times',
            'max_teams', 'current_teams_count', 'past_mentorship_count', 'is_verified'
        ]

        for field in fields:
            if field in data:
                value = data.get(field)
                # Convert boolean fields from string to bool
                if field in ['is_verified']:
                    if value in ['true', 'True', True]:
                        value = True
                    elif value in ['false', 'False', False]:
                        value = False
                    else:
                        value = None
                setattr(profile, field, value)

        # Handle profile picture
        if 'profile_picture' in files:
            profile.profile_picture = files['profile_picture']

        profile.save()

        # Handle many-to-many fields
        if 'skills' in data:
            skill_names = data.getlist('skills')
            skills = Skill.objects.filter(name__in=skill_names)
            profile.skills.set(skills)

        if 'competition_types' in data:
            comp_names = data.getlist('competition_types')
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
        print(f"Error in create_or_update_profile: {e}")
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

####################################################################################################################################################
################################################################################################################################################################
# SKILLS KA PART

@api_token_required
@csrf_exempt
def list_skills(request):
    if request.method == 'GET':
        skills = Skill.objects.all()
        data = [{'id': skill.id, 'name': skill.name} for skill in skills]
        print("Skills data:", data)
        return JsonResponse({'skills': data})

    return JsonResponse({'error': 'Invalid HTTP method'}, status=405)


###################################################################################################################################################
###################################################################################################################################################
@csrf_exempt
def get_user_info(request, user_id):
    try:
        user = CustomUser.objects.get(id=user_id)
        if hasattr(user, 'mentor_profile'):
            profile = user.mentor_profile
            data = {
                "id": profile.id,
                "full_name": profile.full_name,
                "email": user.email,
                # Other fields...
            }
        elif hasattr(user, 'student_profile'):
            profile = user.student_profile
            data = {
                "id": profile.id,
                "full_name": profile.full_name,
                "email": user.email,
                # Other fields...
            }
        else:
            return JsonResponse({"error": "User does not have a profile"}, status=404)

        return JsonResponse(data, status=200)

    except CustomUser.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    except Exception as e:
        print("Error:", str(e))
        return JsonResponse({"error": str(e)}, status=500)

##############################################################################################################################################
##############################################################################################################################################
                                                # STUDENTS KA PART

def compute_combined_features(student):
    features = [
        student['department'],
        student['year_of_study'],
        str(student['gpa']),
        student['extracurricular_activities'],
        student['achievements'],
        student['certifications'],
        student['projects'],
        student['internships'],
        student['hobbies'],
        student['career_goal'],
        student['languages_spoken'],
    ]
    return ' '.join(filter(None, features))  # Join non-empty features with a space

def get_recommendations(student_id, top_n=100):
    print("This is in get_recommendations", student_id)
    # Add at the start of get_recommendations
    print(f"Checking user ID {student_id}")
    try:
    #     user = CustomUser.objects.get(id=student_id)
    #     print(f"Found user: {user.username}, has_profile: {hasattr(user, 'student_profile')}")
    #     if hasattr(user, 'student_profile'):
    #         print(f"Student profile ID: {user.student_profile.id}")
    # except CustomUser.DoesNotExist:
    #     print(f"No user with ID {student_id}")
        try:
            user = CustomUser.objects.get(id=student_id)
            if hasattr(user, 'student_profile'):
                # If this is a user ID, get the student profile ID
                student_profile_id = user.student_profile.id
                print(f"Converting user ID {student_id} to student profile ID {student_profile_id}")
                student_id = student_profile_id
        except CustomUser.DoesNotExist:
            # If not a user ID, assume it's already a student profile ID
            pass
        # Fetch all students from the database
        students_data = StudentProfile.objects.all().values(
            'id', 'full_name', 'date_of_birth', 'gender', 'phone_number',
            'address', 'country', 'state', 'city', 'postal_code',
            'education_level', 'student_id', 'department', 'year_of_study', 'gpa',
            'extracurricular_activities', 'achievements', 'certifications',
            'projects', 'internships', 'preferred_team_roles', 'emergency_contact_name',
            'emergency_contact_number', 'hobbies', 'career_goal', 'languages_spoken',
            'learning_style', 'linkedin', 'github', 'portfolio', 'is_active'
        )

        # Convert the QuerySet to a DataFrame
        students_df = pd.DataFrame(students_data)

        # Compute combined_features dynamically
        students_df['combined_features'] = students_df.apply(compute_combined_features, axis=1)

        all_students = students_df.to_dict(orient="records")
        # Ensure data type consistency
        student_id = str(student_id)
        students_df['id'] = students_df['id'].astype(str)

        # Find the student's combined features using the ID column
        student_row = students_df[students_df['id'] == student_id]
        print("Matching rows in students_data:", student_row)

        if student_row.empty:
            print(f"No student found with ID {student_id}")
            return all_students

        # Debug: Print the combined features for the student
        combined_features = student_row['combined_features'].values
        print("Combined features for the student:", combined_features)

        # Transform the student's features into a TF-IDF vector
        student_features = tfidf_vectorizer.transform(combined_features)
        try:
            # Transform all student features 
            all_student_features = tfidf_vectorizer.transform(students_df['combined_features'])
            
            # Compute similarity directly instead of using pre-trained model
            from sklearn.metrics.pairwise import cosine_similarity
            similarities = cosine_similarity(student_features, all_student_features).flatten()
            
            # Get the student's index to exclude them from recommendations
            student_idx = students_df[students_df['id'] == student_id].index[0]
            similarities[student_idx] = 0  # Exclude the student from their own recommendations
            
            # Get indices of top N most similar students
            top_indices = similarities.argsort()[-top_n:][::-1]
            
            # Get the recommended students
            recommended_students = students_df.iloc[top_indices].to_dict(orient="records")
            print("Recommended students:", recommended_students)
            return recommended_students
    
        except Exception as e:
            print(f"Error in get_recommendations: {e}")
            return all_students
    except Exception as e:
        print(f"Error in get_recommendations: {e}")
        return all_students
    
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

@csrf_exempt
def update_student_profile_fields(profile, data, files=None):
    fields_updated = []
    simple_fields = [
        'full_name', 'date_of_birth', 'gender', 'phone_number', 
        'address', 'country', 'state', 'city', 'postal_code',
        'education_level', 'student_id', 'department', 'year_of_study',
        'gpa', 'extracurricular_activities', 'achievements', 'internships',
        'certifications','projects',
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
def get_recommended_students(request):
    if request.method == "GET":
        try:
            # Get the student ID from the query parameters (if provided)
            student_id = request.GET.get("student_id", None)

            # Fetch all students from the database
            students = StudentProfile.objects.all().values(
                'id', 'full_name', 'date_of_birth', 'gender', 'phone_number',
                'address', 'country', 'state', 'city', 'postal_code',
                'education_level', 'student_id', 'department', 'year_of_study', 'gpa',
                'extracurricular_activities', 'achievements', 'certifications','internships','projects',
                'preferred_team_roles', 'emergency_contact_name', 'emergency_contact_number',
                'hobbies', 'career_goal', 'languages_spoken', 'learning_style',
                'profile_picture', 'linkedin', 'github', 'portfolio',
                'created_at', 'updated_at', 'is_active'
            )

            students_list = list(students)

            # If a student ID is provided, filter the students by recommendation
            if student_id:
                try:
                    # Ensure the student ID is a string for comparison
                    student_id = str(student_id)

                    # Get recommendations for the student
                    recommended_students = get_recommendations(student_id)
                    recommended_ids = [str(student['id']) for student in recommended_students]

                    # Debug: Print recommended IDs
                    print("Recommended IDs:", recommended_ids)

                    # Filter the students_list to include only recommended students
                    filtered_students_list = [
                        student for student in students_list if str(student['id']) in recommended_ids
                    ]

                    # Ensure the filtered list is ordered based on recommended_ids
                    filtered_students_list.sort(
                        key=lambda x: recommended_ids.index(str(x['id']))
                    )

                    # Debug: Print the filtered and ordered students list
                    print("Filtered and Ordered Students List:", filtered_students_list)

                    return JsonResponse(filtered_students_list, safe=False)

                except ValueError as e:
                    print(f"Error in filtering students_list: {e}")
                    return JsonResponse({"error": "Error filtering students list"}, status=500)
                except Exception as e:
                    print(f"Error in recommendation logic: {e}")
                    return JsonResponse({"error": "Error generating recommendations"}, status=500)

            # If no student ID is provided, return the full list
            return JsonResponse(students_list, safe=False)
        except Exception as e:
            print(f"Error fetching students: {e}")
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=400)


@api_token_required
@csrf_exempt
def get_student_detail(request, student_id):
    student = get_object_or_404(StudentProfile, id=student_id)
    
    
    total_collaborators = CollaborationRequest.objects.filter(
        (Q(from_student=student) | Q(to_student=student)) & Q(status="accepted")
    ).count()
    
    
    student_data = {
        "id": student.id,
        "full_name": student.full_name,
        "total_collaborators": total_collaborators,
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
@csrf_exempt
def student_profile(request):
    print("Request content type:", request.content_type)
    print("User ID:", request.user.id)
    print("User:", request.user)
    print("User ka profile:", StudentProfile.objects.filter(user=request.user).exists())
    print("User ka profile:", StudentProfile.objects.filter(user=request.user).values())
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
@csrf_exempt
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
        print(f"Error creating/updating student profile: {str(e)}")
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

        print("PUT data keys:", list(put_data.keys()))
        print("Achievements:", put_data.get("achievements"))
        print("Projects:", put_data.get("projects"))
        print("Certifications:", put_data.get("certifications"))
        print("Internships:", put_data.get("internships"))
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

@api_token_required
@csrf_exempt
@require_http_methods(["GET"])
def get_student_competitions(request):
    try:
        # Get the logged-in student's profile
        student_profile = StudentProfile.objects.get(user=request.user)

        # Fetch competitions where the student is a participant
        competitions = Competition.objects.filter(teams__members=student_profile).distinct()

        # Prepare response data
        competition_list = [
            {
                'id': competition.id,
                'name': competition.name,
                'description': competition.description,
                'start_date': competition.start_date.isoformat(),
                'end_date': competition.end_date.isoformat(),
                'status': competition.status,
                'organizer': competition.organizer,
            }
            for competition in competitions
        ]

        return JsonResponse({'competitions': competition_list}, status=200)

    except StudentProfile.DoesNotExist:
        return JsonResponse({'error': 'Student profile not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
    
##############################################################################################################################################
##############################################################################################################################################
# COMPETITION TYPES KA PART



@api_token_required
@csrf_exempt
def list_competition_types(request):
    if request.method == 'GET':
        comps = CompetitionType.objects.all()
        data = [{'id': comp.id, 'name': comp.name} for comp in comps]
        print("Competition types data:", data)  
        return JsonResponse({'competition_types': data}, status=200, safe=False)

    return JsonResponse({'error': 'Invalid HTTP method'}, status=405, safe=False)

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
            'competition_picture': request.build_absolute_uri(comp.competition_picture.url) if comp.competition_picture else None,
        }
        
        return JsonResponse(competition_data, status=200, safe=False)
        
    except Competition.DoesNotExist:
        return JsonResponse({'error': 'Competition not found'}, status=404, safe=False)
    
@api_token_required
@csrf_exempt
def create_competition(request):
    print(request)
    try:
        if request.method != "POST":
            return JsonResponse({"error": "Invalid request method"}, status=405, safe=False)

        # ✅ Use request.POST for text data, request.FILES for file
        competition_type = CompetitionType.objects.get(id=request.POST["competition_type_id"])
        required_skills = Skill.objects.filter(id__in=json.loads(request.POST["required_skill_ids"]))
        related_sdgs = SDG.objects.filter(id__in=json.loads(request.POST.get("related_sdg_ids", "[]")))

        competition_picture = request.FILES.get("competition_picture")  # ✅ Get the image file correctly

        # ✅ Create Competition Object
        competition = Competition.objects.create(
            name=request.POST["name"],
            competition_type=competition_type,
            description=request.POST["description"],
            start_date=request.POST["start_date"],
            end_date=request.POST["end_date"],
            registration_deadline=request.POST["registration_deadline"],
            min_team_size=request.POST["min_team_size"],
            max_team_size=request.POST["max_team_size"],
            status=request.POST["status"],
            organizer=request.POST["organizer"],
            venue=request.POST.get("venue", ""),
            website=request.POST.get("website", ""),
            created_by=request.user,
            competition_picture=competition_picture,  # ✅ This now correctly saves the file
        )

        # ✅ Set Many-to-Many Relations
        competition.required_skills.set(required_skills)
        competition.related_sdgs.set(related_sdgs)
        competition.save()

        return JsonResponse({"message": "Competition created successfully!"}, status=201, safe=False)

    except Exception as e:
        print("Error:", e)
        return JsonResponse({"error": str(e)}, status=400, safe=False)

@api_token_required
@csrf_exempt
def list_competitions(request):
    competitions = Competition.objects.all()
    competition_list = [
        {
            'id': comp.id,
            'name': comp.name,
            'competition_type__name': comp.competition_type.name if comp.competition_type else None,
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
            'competition_picture': request.build_absolute_uri(comp.competition_picture.url) if comp.competition_picture else None,
        }
        for comp in competitions
    ]
    return JsonResponse(competition_list, status=200, safe=False)


@csrf_exempt
def competition_types_list(request):
    competition_types = CompetitionType.objects.all().values("id", "name", "description")
    return JsonResponse(list(competition_types), status=200, safe=False)

@api_token_required
@require_http_methods(["GET"])
@csrf_exempt
def get_competition_submissions(request, competition_id):
    """
    Fetch all submissions for a specific competition.
    """
    try:
        # Fetch the competition
        competition = get_object_or_404(Competition, id=competition_id)

        # Fetch submissions related to the competition
        submissions = ProjectSubmission.objects.filter(competition=competition)

        # Prepare the response data
        submission_list = [
            {
                "id": submission.id,
                "team_name": submission.team.name,
                "title": submission.title,
                "description": submission.description,
                "submission_date": submission.submission_date.isoformat(),
                "status": submission.status,
            }
            for submission in submissions
        ]

        return JsonResponse({"submissions": submission_list}, status=200)

    except Competition.DoesNotExist:
        return JsonResponse({"error": "Competition not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_token_required
@require_http_methods(["GET"])
@csrf_exempt
def get_competition_team_members(request, competition_id):
    """
    Fetch all team members for a specific competition.
    """
    try:
        # Fetch the competition
        competition = get_object_or_404(Competition, id=competition_id)

        # Fetch all teams in the competition
        teams = Team.objects.filter(competition=competition)

        # Prepare the response data
        team_members = []
        for team in teams:
            for member in team.members.all():
                team_members.append({
                    "team_id": team.id,
                    "team_name": team.name,
                    "member_id": member.id,
                    "member_name": member.full_name,
                    "member_email": member.user.email,
                })

        return JsonResponse({"team_members": team_members}, status=200)

    except Competition.DoesNotExist:
        return JsonResponse({"error": "Competition not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

    
##################################################################################################################################################
##################################################################################################################################################
#       HOSTS/ADMIN KA PART
from home.models import Host,SDG

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
    
@api_token_required
@require_http_methods(["GET"])
@csrf_exempt
def get_host_competitions(request):
    print("Request is:", request)
    print("User is:", request.user)
    try:
        # Get the logged-in host's profile
        host = Host.objects.get(user=request.user)
        print("Host profile:", host)
        # Fetch competitions created by the host
        competitions = Competition.objects.filter(created_by=request.user)
        print("Competitions:", competitions)
        # Prepare response data
        competition_list = [
            {
                'id': competition.id,
                'name': competition.name,
                'description': competition.description,
                'start_date': competition.start_date.isoformat(),
                'end_date': competition.end_date.isoformat(),
                'status': competition.status,
                'organizer': competition.organizer,
            }
            for competition in competitions
        ]

        return JsonResponse({'competitions': competition_list}, status=200)

    except Host.DoesNotExist:
        print("Host profile not found for this user.")
        return JsonResponse({'error': 'Host profile not found'}, status=404)
    except Exception as e:
        print(f"Error fetching host competitions: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)
    
######################################################################################################################################################
######################################################################################################################################################
# TEAMS KA PART
@api_token_required
@csrf_exempt
@require_http_methods(["POST"])
def create_team(request):
    try:
        data = json.loads(request.body)
        competition_id = data.get('competition_id')
        team_name = data.get('team_name')

        if not competition_id or not team_name:
            return JsonResponse({'error': 'Competition ID and team name are required'}, status=400)

        competition = Competition.objects.get(id=competition_id)

        # Check if the user already leads a team in this competition
        if Team.objects.filter(competition=competition, team_leader=request.user.student_profile).exists():
            return JsonResponse({'error': 'You already lead a team in this competition'}, status=400)

        # Generate a unique team code
        team_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

        # Create the team
        team = Team.objects.create(
            name=team_name,
            competition=competition,
            team_leader=request.user.student_profile,
            team_code=team_code
        )

        # Add the team leader as a member
        team.members.add(request.user.student_profile)

        # Get the Node.js server URL from the environment variable
        node_server_url = os.getenv('NODE_SERVER_URL')

        # Construct the payload after adding the team leader
        payload = {
            "team_id": team.id,
            "team_name": team.name,
            "competition_id": competition.id,
            "competition_name": competition.name,
            "members": list(team.members.values_list('user__id', flat=True)),  # List of user IDs
        }

        try:
            print(f"Notifying chat server at {node_server_url} with payload: {payload}")
            response = requests.post(f"{node_server_url}/chat-rooms/create", json=payload)
            print(f"Response from chat server: {response.status_code}, {response.text}")
            if response.status_code != 201:
                return JsonResponse({'error': 'Failed to create chat room'}, status=500)
        except Exception as e:
            return JsonResponse({'error': f'Error notifying chat server: {str(e)}'}, status=500)

        return JsonResponse({
            'message': 'Team created successfully',
            'team_code': team.team_code,
            'team_id': team.id
        }, status=201)

    except Competition.DoesNotExist:
        return JsonResponse({'error': 'Competition not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    

@api_token_required
@csrf_exempt
@require_http_methods(["POST"])
def join_team(request):
    try:
        data = json.loads(request.body)
        team_code = data.get('team_code')

        if not team_code:
            return JsonResponse({'error': 'Team code is required'}, status=400)

        # Fetch the team using the team code
        team = Team.objects.filter(team_code=team_code).first()
        if not team:
            return JsonResponse({'error': 'Invalid team code'}, status=404)

        # Check if the user is already in a team for this competition
        student_profile = request.user.student_profile
        if Team.objects.filter(competition=team.competition, members=student_profile).exists():
            return JsonResponse({'error': 'You are already in a team for this competition'}, status=400)

        # Check if the team size limit is reached
        if team.members.count() >= team.competition.max_team_size:
            return JsonResponse({'error': 'Team size limit reached'}, status=403)

        # Add the user to the team in Django
        team.members.add(student_profile)

        # Notify the Node.js server to update the chat room
        node_server_url = os.getenv('NODE_SERVER_URL')
        payload = {
            "team_id": team.id,
            "members": list(team.members.values_list('user__id', flat=True)),  # List of user IDs
        }

        try:
            response = requests.post(f"{node_server_url}/chat-rooms/update", json=payload)
            if response.status_code != 200:
                return JsonResponse({'error': 'Failed to update chat room'}, status=500)
        except Exception as e:
            return JsonResponse({'error': f'Error notifying chat server: {str(e)}'}, status=500)

        return JsonResponse({'message': 'Successfully joined the team', 'team_id': team.id}, status=200)

    except StudentProfile.DoesNotExist:
        return JsonResponse({'error': 'Student profile not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
@csrf_exempt
@api_token_required
@require_http_methods(["GET"])
def get_student_teams(request):
    print("User is:", request.user)
    try:
        # Get the logged-in user's student profile
        student_profile = StudentProfile.objects.get(user=request.user)

        # Fetch all teams where the user is a member
        teams = Team.objects.filter(members=student_profile).select_related('competition')

        # Prepare the response data
        team_list = [
            {
                'team_id': team.id,
                'team_name': team.name,
                'competition_name': team.competition.name,
                'competition_id': team.competition.id,
                'team_code': team.team_code,
                'status': team.status,
            }
            for team in teams
        ]

        return JsonResponse({'teams': team_list}, status=200)

    except StudentProfile.DoesNotExist:
        return JsonResponse({'error': 'Student profile not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
@api_token_required
@require_http_methods(["GET"])
@csrf_exempt
def get_user_competitions(request):
    try:
        # Get the logged-in user's student profile
        student_profile = StudentProfile.objects.get(user=request.user)

        # Fetch all competitions where the user is a member of a team
        competitions = Competition.objects.filter(teams__members=student_profile).distinct()

        # Prepare the response data
        competition_list = [
            {
                'competition_id': competition.id,
                'competition_name': competition.name,
                'start_date': competition.start_date.isoformat() if competition.start_date else None,
                'end_date': competition.end_date.isoformat() if competition.end_date else None,
                'registration_deadline': competition.registration_deadline.isoformat() if competition.registration_deadline else None,
                'status': competition.status,
                'organizer': competition.organizer,
            }
            for competition in competitions
        ]

        return JsonResponse({'competitions': competition_list}, status=200)

    except StudentProfile.DoesNotExist:
        return JsonResponse({'error': 'Student profile not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    

@api_token_required
@require_http_methods(["GET"])
@csrf_exempt
def get_team_details(request, team_id):
    try:
        # Fetch the team
        team = get_object_or_404(Team, id=team_id)

        # Fetch team members
        members = team.members.all()
        member_list = [
            {
                "id": member.id,
                "full_name": member.full_name,
            }
            for member in members
        ]

        # Prepare the response data
        response_data = {
            "team_id": team.id,
            "name": team.name,
            "team_code": team.team_code,
            "status": team.status,
            "is_open_for_members": team.is_open_for_members,
            "competition_name": team.competition.name,
            "competition_description": team.competition.description,
            "competition_start_date": team.competition.start_date.isoformat() if team.competition.start_date else None,
            "competition_end_date": team.competition.end_date.isoformat() if team.competition.end_date else None,
            "competition_registration_deadline": team.competition.registration_deadline.isoformat() if team.competition.registration_deadline else None,
            "competition_min_team_size": team.competition.min_team_size,
            "competition_max_team_size": team.competition.max_team_size,
            "competition_organizer": team.competition.organizer,
            "competition_venue": team.competition.venue,
            "competition_website": team.competition.website,
            "members": member_list,
        }

        return JsonResponse(response_data, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
@api_token_required
@require_http_methods(["POST"])
@csrf_exempt
def submit_project(request, team_id):
    """
    Handle project submission for a team.
    """
    try:
        # Fetch the team
        team = get_object_or_404(Team, id=team_id)

        # Check if the team is part of a competition
        if not team.competition:
            return JsonResponse({"error": "Team is not part of any competition"}, status=400)

        # Get submission data from the request
        title = request.POST.get("title")
        description = request.POST.get("description")
        project_file = request.FILES.get("project_file")  # Correct field name
        presentation_file = request.FILES.get("presentation_file")  # Correct field name

        if not title or not description:
            return JsonResponse({"error": "Title and description are required"}, status=400)

        # Create a new project submission
        submission = ProjectSubmission.objects.create(
            team=team,
            competition=team.competition,
            title=title,
            description=description,
            project_file=project_file,  # Save the project file
            presentation_file=presentation_file,  # Save the presentation file
            status="submitted",
        )

        return JsonResponse(
            {
                "message": "Project submitted successfully!",
                "submission": {
                    "id": submission.id,
                    "title": submission.title,
                    "description": submission.description,
                    "submission_date": submission.submission_date.isoformat(),
                    "status": submission.status,
                },
            },
            status=201,
        )

    except Team.DoesNotExist:
        return JsonResponse({"error": "Team not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
@api_token_required
@require_http_methods(["GET"])
@csrf_exempt
def get_team_submission(request, team_id):
    """
    Fetch all submissions for a specific team.
    """
    try:
        team = get_object_or_404(Team, id=team_id)
        submissions = ProjectSubmission.objects.filter(team=team)

        submission_list = [
            {
                "id": submission.id,
                "title": submission.title,
                "description": submission.description,
                "submission_date": submission.submission_date.isoformat(),
                # Removed 'uploaded_by' since it doesn't exist
                "project_file_url": request.build_absolute_uri(submission.project_file.url) if submission.project_file else None,
                "presentation_file_url": request.build_absolute_uri(submission.presentation_file.url) if submission.presentation_file else None,
            }
            for submission in submissions
        ]

        return JsonResponse({"submissions": submission_list}, status=200)

    except Team.DoesNotExist:
        return JsonResponse({"error": "Team not found"}, status=404)
    except Exception as e:
        print("Error:", str(e))
        return JsonResponse({"error": str(e)}, status=500)

@api_token_required
@require_http_methods(["DELETE"])
@csrf_exempt
def delete_submission(request, submission_id):
    """
    Delete a specific submission.
    """
    try:
        submission = get_object_or_404(ProjectSubmission, id=submission_id)
        submission.delete()
        return JsonResponse({"message": "Submission deleted successfully!"}, status=200)
    except ProjectSubmission.DoesNotExist:
        return JsonResponse({"error": "Submission not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
@api_token_required
@require_http_methods(["GET"])
@csrf_exempt
def get_competition_submissions_grouped(request, competition_id):
    """
    Fetch all submissions for a specific competition grouped by teams.
    """
    try:
        competition = get_object_or_404(Competition, id=competition_id)
        submissions = ProjectSubmission.objects.filter(competition=competition)
        # Group submissions by team
        grouped_submissions = {}
        for submission in submissions:
            print("Submission:", {
    "id": submission.id,
    "title": submission.title,
    "description": submission.description,
    "submission_date": submission.submission_date.isoformat(),
    "status": submission.status,
    "team_name": submission.team.name,
    "project_file_url": request.build_absolute_uri(submission.project_file.url) if submission.project_file else None,
    "presentation_file_url": request.build_absolute_uri(submission.presentation_file.url) if submission.presentation_file else None,
})
            team_name = submission.team.name
            if team_name not in grouped_submissions:
                grouped_submissions[team_name] = []
            
            # Add file URLs to the submission data
            submission_data = {
                "id": submission.id,
                "title": submission.title,
                "description": submission.description,
                "submission_date": submission.submission_date.isoformat(),
                "status": submission.status,
            }
            
            # Add project file URL if exists
            if submission.project_file:
                submission_data["project_file_url"] = request.build_absolute_uri(submission.project_file.url)
                submission_data["project_file_name"] = submission.project_file.name.split('/')[-1]
            
            # Add presentation file URL if exists
            if submission.presentation_file:
                submission_data["presentation_file_url"] = request.build_absolute_uri(submission.presentation_file.url)
                submission_data["presentation_file_name"] = submission.presentation_file.name.split('/')[-1]
                
            grouped_submissions[team_name].append(submission_data)

        return JsonResponse({"submissions": grouped_submissions}, status=200)

    except Competition.DoesNotExist:
        return JsonResponse({"error": "Competition not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
#######################################################################################################################################
# TASKS KA PART

@api_token_required
@require_http_methods(["GET"])
@csrf_exempt
def get_team_tasks(request, team_id):
    """
    Fetch all tasks for a specific team.
    """
    try:
        team = get_object_or_404(Team, id=team_id)
        tasks = Task.objects.filter(team=team)

        task_list = [
            {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "is_completed": task.is_completed,
                "assigned_to": task.assigned_to.full_name if task.assigned_to else None,
                "assigned_by": task.assigned_by.full_name if task.assigned_by else None,
            }
            for task in tasks
        ]

        return JsonResponse({"tasks": task_list}, status=200)

    except Team.DoesNotExist:
        return JsonResponse({"error": "Team not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_token_required
@require_http_methods(["POST"])
@csrf_exempt
def create_task(request, team_id):
    """
    Create a new task for a team.
    """
    try:
        team = get_object_or_404(Team, id=team_id)
        assigned_by = get_object_or_404(StudentProfile, user=request.user)
        title = request.POST.get("title")
        description = request.POST.get("description")
        assigned_to_id = request.POST.get("assigned_to")

        if not title or not description:
            return JsonResponse({"error": "Title and description are required"}, status=400)

        assigned_to = StudentProfile.objects.filter(id=assigned_to_id).first()

        task = Task.objects.create(
            team=team,
            assigned_by=assigned_by,
            assigned_to=assigned_to,
            title=title,
            description=description,
        )

        return JsonResponse({"message": "Task created successfully!", "task_id": task.id}, status=201)

    except Team.DoesNotExist:
        return JsonResponse({"error": "Team not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_token_required
@require_http_methods(["PATCH"])
@csrf_exempt
def update_task_status(request, task_id):
    """
    Update the status of a task (mark as complete/incomplete).
    """
    try:
        task = get_object_or_404(Task, id=task_id)
        is_completed = request.POST.get("is_completed") == "true"

        task.is_completed = is_completed
        task.save()

        return JsonResponse({"message": "Task status updated successfully!"}, status=200)

    except Task.DoesNotExist:
        return JsonResponse({"error": "Task not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
@api_token_required
@require_http_methods(["POST"])
@csrf_exempt
def delete_task(request, task_id):
    """
    Delete an existing task.
    """
    try:
        task = get_object_or_404(Task, id=task_id)
        task.delete()
        return JsonResponse({"message": "Task deleted successfully!"}, status=200)

    except Task.DoesNotExist:
        return JsonResponse({"error": "Task not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
@api_token_required
@require_http_methods(["POST"])
@csrf_exempt
def edit_task(request, task_id):
    """
    Edit an existing task.
    """
    try:
        task = get_object_or_404(Task, id=task_id)
        title = request.POST.get("title")
        description = request.POST.get("description")
        assigned_to_id = request.POST.get("assigned_to")

        if title:
            task.title = title
        if description:
            task.description = description
        if assigned_to_id:
            assigned_to = StudentProfile.objects.filter(id=assigned_to_id).first()
            task.assigned_to = assigned_to

        task.save()

        return JsonResponse({"message": "Task updated successfully!"}, status=200)

    except Task.DoesNotExist:
        return JsonResponse({"error": "Task not found"}, status=404)
    except Exception as e:
        print("Error:", str(e))
        return JsonResponse({"error": str(e)}, status=500)
    

    
#############################################################################################################################
#FILES KA PART

@api_token_required
@require_http_methods(["POST"])
@csrf_exempt
def upload_file(request, team_id):
    """
    Upload a file for a team.
    """
    try:
        team = get_object_or_404(Team, id=team_id)
        uploaded_by = request.user.student_profile  # Correctly access the StudentProfile
        file = request.FILES.get("file")
        name = request.POST.get("name")

        if not file or not name:
            return JsonResponse({"error": "File and name are required"}, status=400)

        team_file = TeamFile.objects.create(
            team=team,
            uploaded_by=uploaded_by,
            file=file,
            name=name,
        )

        return JsonResponse({"message": "File uploaded successfully!", "file_id": team_file.id}, status=201)

    except Team.DoesNotExist:
        return JsonResponse({"error": "Team not found"}, status=404)
    except AttributeError:
        return JsonResponse({"error": "User does not have a student profile"}, status=400)
    except Exception as e:
        print("Error:", str(e))
        return JsonResponse({"error": str(e)}, status=500)


@api_token_required
@require_http_methods(["GET"])
@csrf_exempt
def get_team_files(request, team_id):
    """
    Retrieve all files for a specific team.
    """
    try:
        team = get_object_or_404(Team, id=team_id)
        files = TeamFile.objects.filter(team=team)

        file_list = [
            {
                "id": file.id,
                "name": file.name,
                "uploaded_by": file.uploaded_by.full_name if file.uploaded_by else "Unknown",
                "uploaded_at": file.uploaded_at.isoformat(),
                "file_url": request.build_absolute_uri(file.file.url),  # Ensure full URL
            }
            for file in files
        ]

        return JsonResponse({"files": file_list}, status=200)

    except Team.DoesNotExist:
        return JsonResponse({"error": "Team not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
@api_token_required
@require_http_methods(["POST"])
@csrf_exempt
def delete_file(request, file_id):
    """
    Delete a file for a team.
    """
    try:
        team_file = get_object_or_404(TeamFile, id=file_id)
        team_file.delete()
        return JsonResponse({"message": "File deleted successfully!"}, status=200)

    except TeamFile.DoesNotExist:
        return JsonResponse({"error": "File not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
@api_token_required
@require_http_methods(["GET"])
@csrf_exempt
def serve_file(request, file_id):
    """
    Serve a file for viewing in the browser.
    """
    try:
        team_file = get_object_or_404(TeamFile, id=file_id)
        
        # Determine content type based on file extension
        file_name = team_file.file.name
        content_type = None
        print("File name:", file_name)
        # Map common file extensions to MIME types
        if file_name.endswith('.pdf'):
            content_type = 'application/pdf'
        elif file_name.endswith(('.jpg', '.jpeg')):
            content_type = 'image/jpeg'
        elif file_name.endswith('.png'):
            content_type = 'image/png'
        elif file_name.endswith('.txt'):
            content_type = 'text/plain'
        elif file_name.endswith('.doc') or file_name.endswith('.docx'):
            file_url = request.build_absolute_uri(team_file.file.url)
            viewer_url = f"https://docs.google.com/viewer?url={file_url}&embedded=true"
            html = f'<iframe src="{viewer_url}" width="100%" height="100%" style="border: none;"></iframe>'
            return HttpResponse(html, content_type='text/html')
        elif file_name.endswith('.xls') or file_name.endswith('.xlsx'):
            content_type = 'application/vnd.ms-excel'
        elif file_name.endswith('.csv'):
            content_type = 'text/csv'
        else:
            # Default to binary if no specific type is found
            content_type = 'application/octet-stream'
        
        # Open file and create response with proper content type
        response = FileResponse(team_file.file.open(), content_type=content_type)
        
        # Set to inline for viewing in browser
        response["Content-Disposition"] = f"inline; filename=\"{team_file.name}\""
        
        return response
    except TeamFile.DoesNotExist:
        return JsonResponse({"error": "File not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
########################################################################################################################################
#############################################################################################################################################
#Collaborators ka part

@api_token_required
@require_http_methods(["POST"])
@csrf_exempt
def send_collaboration_request(request):
    try:
        data = json.loads(request.body)
        to_student_id = data.get("to_student_id")

        if not to_student_id:
            return JsonResponse({"error": "Recipient student ID is required"}, status=400)

        from_student = request.user.student_profile
        to_student = StudentProfile.objects.get(id=to_student_id)

        # Check if a request already exists
        if CollaborationRequest.objects.filter(from_student=from_student, to_student=to_student).exists():
            return JsonResponse({"error": "Collaboration request already sent"}, status=400)

        # Create the collaboration request
        CollaborationRequest.objects.create(from_student=from_student, to_student=to_student)

        return JsonResponse({"message": "Collaboration request sent successfully!"}, status=201)

    except StudentProfile.DoesNotExist:
        return JsonResponse({"error": "Recipient student not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
@api_token_required
@csrf_exempt
@require_http_methods(["GET"])
def get_collaboration_requests(request):
    try:
        student = request.user.student_profile
        requests = CollaborationRequest.objects.filter(to_student=student, status="pending")

        data = [
            {
                "id": req.id,
                "from_student_id": req.from_student.id,
                "from_student_name": req.from_student.full_name,
                "from_student_profile_picture": req.from_student.profile_picture.url if req.from_student.profile_picture else None,
                "created_at": req.created_at,
            }
            for req in requests
        ]

        return JsonResponse(data, safe=False, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
@api_token_required
@require_http_methods(["POST"])
@csrf_exempt
def handle_collaboration_request(request):
    try:
        data = json.loads(request.body)
        request_id = data.get("request_id")
        action = data.get("action")  # "accept" or "deny"

        if not request_id or action not in ["accept", "deny"]:
            return JsonResponse({"error": "Invalid request data"}, status=400)

        collab_request = CollaborationRequest.objects.get(id=request_id)

        if action == "accept":
            collab_request.status = "accepted"
            collab_request.save()

            # Create a chat room for the collaborators
            node_server_url = os.getenv('NODE_SERVER_URL')
            payload = {
                "team_id": f"collab-{collab_request.id}",  # Unique ID for the collaboration
                "team_name": f"Collaboration: {collab_request.from_student.full_name} & {collab_request.to_student.full_name}",
                "competition_id": "collaboration",  # Use a placeholder competition ID
                "competition_name": "Collaboration",
                "members": [collab_request.from_student.user.id, collab_request.to_student.user.id],
            }

            try:
                response = requests.post(f"{node_server_url}/chat-rooms/create", json=payload)
                if response.status_code != 201:
                    return JsonResponse({"error": "Failed to create chat room"}, status=500)
            except Exception as e:
                return JsonResponse({"error": f"Error notifying chat server: {str(e)}"}, status=500)

            return JsonResponse({"message": "Collaboration request accepted"}, status=200)

        if action == "deny":
            collab_request.status = "rejected"
            collab_request.save()
            return JsonResponse({"message": "Collaboration request denied"}, status=200)

    except CollaborationRequest.DoesNotExist:
        return JsonResponse({"error": "Collaboration request not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
@api_token_required
@csrf_exempt
@require_http_methods(["GET"])
def get_collaborators(request):
    try:
        user = request.user
        student = request.user.student_profile

        # Fetch all accepted collaboration requests
        collaborators = CollaborationRequest.objects.filter(
            (Q(from_student=student) | Q(to_student=student)) & Q(status="accepted")
        )

        # Prepare the list of collaborators
        collaborator_list = []
        for collab in collaborators:
            other_student = collab.from_student if collab.to_student == student else collab.to_student
            collaborator_list.append({
                "id": other_student.id,
                "full_name": other_student.full_name,
                "profile_picture": other_student.profile_picture.url if other_student.profile_picture else None,
                "department": other_student.department,
                "year_of_study": other_student.year_of_study,
                "team_id": f"collab-{collab.id}"  # Use collab_request.id as the room ID
            })

        return JsonResponse({"collaborators": collaborator_list}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
@api_token_required
@require_http_methods(["POST"])
@csrf_exempt
def send_consultation_request(request):
    try:
        data = json.loads(request.body)
        to_mentor_id = data.get("to_mentor_id")

        if not to_mentor_id:
            return JsonResponse({"error": "Mentor ID is required"}, status=400)

        from_student = request.user.student_profile
        to_mentor = MentorProfile.objects.get(id=to_mentor_id)

        # Check if a request already exists
        if ConsultationRequest.objects.filter(from_student=from_student, to_mentor=to_mentor).exists():
            return JsonResponse({"error": "Consultation request already sent"}, status=400)

        # Create the consultation request
        ConsultationRequest.objects.create(from_student=from_student, to_mentor=to_mentor)

        return JsonResponse({"message": "Consultation request sent successfully!"}, status=201)

    except MentorProfile.DoesNotExist:
        return JsonResponse({"error": "Mentor not found"}, status=404)
    except Exception as e:
        print("Error:", str(e))
        return JsonResponse({"error": str(e)}, status=500)
    
@api_token_required
@require_http_methods(["POST"])
@csrf_exempt
def handle_consultation_request(request):
    try:
        data = json.loads(request.body)
        request_id = data.get("request_id")
        action = data.get("action")  # "accept" or "deny"

        if not request_id or action not in ["accept", "deny"]:
            return JsonResponse({"error": "Invalid request data"}, status=400)

        consultation_request = ConsultationRequest.objects.get(id=request_id)

        if action == "accept":
            consultation_request.status = "accepted"
            consultation_request.save()

            # Create a chat room for the consultation
            node_server_url = os.getenv('NODE_SERVER_URL')
            payload = {
                "team_id": f"consult-{consultation_request.id}",  # Unique ID for the consultation
                "team_name": f"Consultation: {consultation_request.from_student.full_name} & {consultation_request.to_mentor.full_name}",
                "competition_id": "consultation",  # Use a placeholder competition ID
                "competition_name": "consultation",
                "members": [consultation_request.from_student.user.id, consultation_request.to_mentor.user.id],
            }

            try:
                response = requests.post(f"{node_server_url}/chat-rooms/create", json=payload)
                if response.status_code != 201:
                    print("Error notifying chat server:", response.text)
                    return JsonResponse({"error": "Failed to create chat room"}, status=500)
            except Exception as e:
                print("Error notifying chat server:", str(e))
                return JsonResponse({"error": f"Error notifying chat server: {str(e)}"}, status=500)

            return JsonResponse({"message": "Consultation request accepted"}, status=200)

        if action == "deny":
            consultation_request.status = "rejected"
            consultation_request.save()
            return JsonResponse({"message": "Consultation request denied"}, status=200)

    except ConsultationRequest.DoesNotExist:
        return JsonResponse({"error": "Consultation request not found"}, status=404)
    except Exception as e:
        print("Error:", str(e))
        return JsonResponse({"error": str(e)}, status=500)

@api_token_required
@csrf_exempt
@require_http_methods(["GET"])
def get_consultations(request):
    try:
        user = request.user
        if hasattr(user, 'student_profile'):
            consultations = ConsultationRequest.objects.filter(from_student=user.student_profile, status="accepted")
        elif hasattr(user, 'mentor_profile'):
            consultations = ConsultationRequest.objects.filter(to_mentor=user.mentor_profile, status="accepted")
        else:
            return JsonResponse({"error": "Invalid user type"}, status=400)

        consultation_list = [
            {
                "id": consult.id,
                "from_student": consult.from_student.full_name,
                "to_mentor": consult.to_mentor.full_name,
                "team_id": f"consult-{consult.id}",
            }
            for consult in consultations
        ]

        return JsonResponse({"consultations": consultation_list}, status=200)

    except Exception as e:
        print("Error:", str(e))
        return JsonResponse({"error": str(e)}, status=500)
    
@api_token_required
@csrf_exempt
@require_http_methods(["GET"])
def get_consultation_requests(request):
    try:
        # Check if the user is a mentor
        if hasattr(request.user, 'mentor_profile'):
            mentor = request.user.mentor_profile
            # Fetch pending consultation requests for the mentor
            requests = ConsultationRequest.objects.filter(to_mentor=mentor, status="pending")

            # Prepare the response data
            data = [
                {
                    "id": req.id,
                    "from_student_id": req.from_student.id,
                    "from_student_name": req.from_student.full_name,
                    "from_student_profile_picture": req.from_student.profile_picture.url if req.from_student.profile_picture else None,
                    "created_at": req.created_at,
                }
                for req in requests
            ]

            return JsonResponse(data, safe=False, status=200)
        else:
            return JsonResponse({"error": "User is not a mentor"}, status=403)

    except Exception as e:
        print("Error:", str(e))
        return JsonResponse({"error": str(e)}, status=500)
    

@api_token_required
@csrf_exempt
def get_analytics_data(request):
    """
    Get comprehensive analytics data for the platform.
    """
    try:
        # Time range filter
        days = int(request.GET.get('days', 30))  # Default to last 30 days
        end_date = timezone.now()  # Use timezone-aware datetime
        start_date = end_date - timedelta(days=days)
        
        # User analytics
        users_data = get_user_analytics(start_date, end_date)
        
        # Competition analytics
        competitions_data = get_competition_analytics(start_date, end_date)
        
        # Team analytics
        teams_data = get_team_analytics(start_date, end_date)
        
        # Submissions analytics
        submissions_data = get_submission_analytics(start_date, end_date)
        
        # Mentor-Student engagement analytics
        engagement_data = get_engagement_analytics(start_date, end_date)
        
        return JsonResponse({
            'user_analytics': users_data,
            'competition_analytics': competitions_data,
            'team_analytics': teams_data,
            'submission_analytics': submissions_data,
            'engagement_analytics': engagement_data
        }, status=200)
    except Exception as e:
        print(f"Error getting analytics data: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

def get_user_analytics(start_date, end_date):
    """Helper function to get user analytics."""
    # Count total users by role
    total_students = StudentProfile.objects.count()
    total_mentors = MentorProfile.objects.count()
    total_hosts = Host.objects.count()
    
    # Count new users in date range by role
    new_students = StudentProfile.objects.filter(created_at__range=(start_date, end_date)).count()
    new_mentors = MentorProfile.objects.filter(created_at__range=(start_date, end_date)).count()
    new_hosts = Host.objects.filter(created_at__range=(start_date, end_date)).count()
    
    # User growth over time (by month)
    months = []
    student_growth = []
    mentor_growth = []
    
    # Calculate for the last 12 months
    for i in range(12, 0, -1):
        month_end = end_date.replace(day=1) - timedelta(days=1)
        month_start = month_end.replace(day=1)
        
        month_name = month_end.strftime('%b %Y')
        months.append(month_name)
        
        student_count = StudentProfile.objects.filter(created_at__lte=month_end).count()
        mentor_count = MentorProfile.objects.filter(created_at__lte=month_end).count()
        
        student_growth.append(student_count)
        mentor_growth.append(mentor_count)
        
        end_date = month_start
    
    return {
        'total_users': total_students + total_mentors + total_hosts,
        'total_students': total_students,
        'total_mentors': total_mentors,
        'total_hosts': total_hosts,
        'new_students': new_students,
        'new_mentors': new_mentors,
        'new_hosts': new_hosts,
        'growth_data': {
            'months': months,
            'student_growth': student_growth,
            'mentor_growth': mentor_growth,
        }
    }

def get_competition_analytics(start_date, end_date):
    """Helper function to get competition analytics."""
    # Count total competitions
    total_competitions = Competition.objects.count()
    active_competitions = Competition.objects.filter(status='active').count()
    
    # Count new competitions in date range
    new_competitions = Competition.objects.filter(created_at__range=(start_date, end_date)).count()
    
    # Competition participation
    competitions = Competition.objects.all()
    competition_participation = []
    
    for comp in competitions[:10]:  # Limit to 10 for performance
        team_count = Team.objects.filter(competition=comp).count()
        student_count = StudentProfile.objects.filter(teams__competition=comp).distinct().count()
        
        competition_participation.append({
            'name': comp.name,
            'team_count': team_count,
            'student_count': student_count,
        })
    
    # Competition type distribution
    comp_types = CompetitionType.objects.all()
    type_distribution = []
    
    for comp_type in comp_types:
        count = Competition.objects.filter(competition_type=comp_type).count()
        type_distribution.append({
            'name': comp_type.name,
            'count': count,
        })
    
    return {
        'total_competitions': total_competitions,
        'active_competitions': active_competitions,
        'new_competitions': new_competitions,
        'competition_participation': competition_participation,
        'type_distribution': type_distribution
    }

def get_team_analytics(start_date, end_date):
    """Helper function to get team analytics."""
    # Count total teams and new teams
    total_teams = Team.objects.count()
    new_teams = Team.objects.filter(created_at__range=(start_date, end_date)).count()
    
    # Team size distribution
    team_sizes = {}
    for team in Team.objects.all():
        size = team.members.count()
        team_sizes[size] = team_sizes.get(size, 0) + 1
    
    size_distribution = [
        {'size': size, 'count': count}
        for size, count in team_sizes.items()
    ]
    
    return {
        'total_teams': total_teams,
        'new_teams': new_teams,
        'size_distribution': size_distribution
    }

def get_submission_analytics(start_date, end_date):
    """Helper function to get submission analytics."""
    # Count total submissions and new submissions
    total_submissions = ProjectSubmission.objects.count()
    new_submissions = ProjectSubmission.objects.filter(submission_date__range=(start_date, end_date)).count()
    
    # Submission status distribution
    status_distribution = []
    statuses = ProjectSubmission.objects.values('status').distinct()
    
    for status in statuses:
        count = ProjectSubmission.objects.filter(status=status['status']).count()
        status_distribution.append({
            'status': status['status'],
            'count': count
        })
    
    # Submissions by competition
    submissions_by_competition = []
    competitions = Competition.objects.all()
    
    for comp in competitions[:10]:  # Limit to 10 for performance
        count = ProjectSubmission.objects.filter(competition=comp).count()
        submissions_by_competition.append({
            'name': comp.name,
            'count': count
        })
    
    return {
        'total_submissions': total_submissions,
        'new_submissions': new_submissions,
        'status_distribution': status_distribution,
        'submissions_by_competition': submissions_by_competition
    }

def get_engagement_analytics(start_date, end_date):
    """Helper function to get mentor-student engagement analytics."""
    # Count consultations
    total_consultations = ConsultationRequest.objects.filter(status='accepted').count()
    new_consultations = ConsultationRequest.objects.filter(
        status='accepted',
        created_at__range=(start_date, end_date)
    ).count()
    
    # Count collaborations
    total_collaborations = CollaborationRequest.objects.filter(status='accepted').count()
    new_collaborations = CollaborationRequest.objects.filter(
        status='accepted',
        created_at__range=(start_date, end_date)
    ).count()
    
    # Mentor activity - top mentors by consultations
    top_mentors = []
    mentors = MentorProfile.objects.all()
    
    for mentor in mentors[:10]:  # Limit to 10 for performance
        consultation_count = ConsultationRequest.objects.filter(to_mentor=mentor, status='accepted').count()
        top_mentors.append({
            'name': mentor.full_name,
            'consultation_count': consultation_count
        })
    
    # Sort by consultation count
    top_mentors.sort(key=lambda x: x['consultation_count'], reverse=True)
    
    # Acceptance rates
    consultation_requests = ConsultationRequest.objects.count() or 1  # Avoid division by zero
    consultation_accepted = ConsultationRequest.objects.filter(status='accepted').count()
    consultation_acceptance_rate = round((consultation_accepted / consultation_requests * 100), 2)
    
    collaboration_requests = CollaborationRequest.objects.count() or 1  # Avoid division by zero
    collaboration_accepted = CollaborationRequest.objects.filter(status='accepted').count()
    collaboration_acceptance_rate = round((collaboration_accepted / collaboration_requests * 100), 2)
    
    return {
        'total_consultations': total_consultations,
        'new_consultations': new_consultations,
        'total_collaborations': total_collaborations,
        'new_collaborations': new_collaborations,
        'top_mentors': top_mentors,
        'consultation_acceptance_rate': consultation_acceptance_rate,
        'collaboration_acceptance_rate': collaboration_acceptance_rate
    }