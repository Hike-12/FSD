from home.models import CustomUser
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import AnonymousUser

class JWTAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            access_token = auth_header.split(' ')[1]
            try:
                validated_token = AccessToken(access_token)
                user_id = validated_token['user_id']
                user = CustomUser.objects.get(id=user_id)
                request.user = user
            except Exception as e:
                print(f"JWT error: {e}")  # Or use logging
                request.user = AnonymousUser()
        else:
            request.user = AnonymousUser()
        return self.get_response(request)
    

