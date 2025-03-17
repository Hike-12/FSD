from django.urls import path
from . import views

urlpatterns = [
    path('csrf/', views.get_csrf_token, name='get_csrf_token'),                 # /api/csrf/
    path('api/register/', views.UserCreate.as_view(), name='register'),          # /api/register/
    path('api/login/', views.custom_login, name='login'),                        # /api/login/
    path('api/logout/', views.logout, name='logout'),                        # /api/logout/
    path('api/token/refresh/', views.refresh_token, name='token_refresh'),       # /api/token/refresh/
]