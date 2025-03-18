from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
from home.models import CustomUser
import json
from rest_framework import status
from rest_framework.views import APIView
from django.db.utils import IntegrityError

def get_token(request):
    return request.META.get('CSRF_COOKIE', None)

def get_csrf_token(request):
    return JsonResponse({'csrfToken': get_token(request)})

class UserCreate(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            data = request.data

            # Validate required fields
            required_fields = ['username', 'password', 'role', 'email']
            for field in required_fields:
                if field not in data:
                    return Response({'error': f'Missing field: {field}'}, status=status.HTTP_400_BAD_REQUEST)

            # Create user
            user = CustomUser.objects.create_user(
                username=data['username'],
                email=data['email'],  # Save email
                password=data['password'],
                role=data['role']
            )

            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'User created successfully',
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'csrfToken': get_token(request),
                'role': user.role
            }, status=status.HTTP_201_CREATED)

        except IntegrityError as e:
            if 'home_customuser.email' in str(e):
                return Response({'error': 'email needs to be unique'}, status=status.HTTP_400_BAD_REQUEST)
            return Response({'error': 'Integrity error: ' + str(e)}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def custom_login(request):
    data = json.loads(request.body)
    username = data.get('username')
    password = data.get('password')

    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return JsonResponse({
            'message': 'Login successful',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'csrfToken': get_token(request),
            'role': user.role
        })
    return JsonResponse({'error': 'Invalid credentials'}, status=400)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    data = json.loads(request.body)
    refresh_token = data.get('refresh')
    try:
        token = RefreshToken(refresh_token)
        access_token = str(token.access_token)
        return JsonResponse({
            'access': access_token,
            'csrfToken': get_token(request)
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=401)

@csrf_exempt
@api_view(['POST'])
def logout(request):
    try:
        refresh_token = request.data.get('refresh') or json.loads(request.body).get('refresh')
        
        if not refresh_token:
            return JsonResponse({'error': 'Refresh token is required'}, status=400)
            
        token = RefreshToken(refresh_token)
        token.blacklist()
        
        return JsonResponse({'message': 'User logged out successfully'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    
    
def role_required(allowed_roles):
    def decorator(view_func):
        def wrapper(request, *args, **kwargs):
            if request.user.role not in allowed_roles:
                return JsonResponse({'error': 'Forbidden'}, status=403)
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator



####################################################################################################################################################
#                       MENTOR PROFILE VIEWS

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import MentorProfile, Skill, CompetitionType
from .serializers import MentorProfileSerializer, SkillSerializer, CompetitionTypeSerializer


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of a profile to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the profile
        return obj.user == request.user


class MentorProfileViewSet(viewsets.ModelViewSet):
    queryset = MentorProfile.objects.all()
    serializer_class = MentorProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        """
        This view should return a list of all profiles
        for the currently authenticated user.
        """
        user = self.request.user
        if user.is_staff:
            return MentorProfile.objects.all()
        return MentorProfile.objects.filter(user=user)

    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        """
        Returns the mentor profile for the current user or returns 404 if not found
        """
        try:
            profile = MentorProfile.objects.get(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except MentorProfile.DoesNotExist:
            return Response(
                {"detail": "Mentor profile not found for this user."},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'])
    def create_profile(self, request):
        """
        Creates or updates a profile for the current user
        """
        profile, created = MentorProfile.objects.get_or_create(user=request.user)
        
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(serializer.data, status=status_code)


class SkillViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated]


class CompetitionTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CompetitionType.objects.all()
    serializer_class = CompetitionTypeSerializer
    permission_classes = [permissions.IsAuthenticated]