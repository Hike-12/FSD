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

def get_token(request):
    return request.META.get('CSRF_COOKIE', None)

def get_csrf_token(request):
    return JsonResponse({'csrfToken': get_token(request)})

class UserCreate(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            data = request.data
            user = CustomUser.objects.create_user(
                username=data['username'],
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
        except KeyError as e:
            return Response({'error': f'Missing field: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
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


# Add this to your views.py file:

@csrf_exempt
@api_view(['POST'])
def logout(request):
    try:
        refresh_token = request.data.get('refresh') or json.loads(request.body).get('refresh')
        
        if not refresh_token:
            return JsonResponse({'error': 'Refresh token is required'}, status=400)
            
        token = RefreshToken(refresh_token)
        token.blacklist()
        
        return JsonResponse({'success': 'User logged out successfully'})
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