from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import MentorProfileViewSet, SkillViewSet, CompetitionTypeViewSet
from . import views

router = DefaultRouter()
router.register(r'mentor-profiles', MentorProfileViewSet)
router.register(r'skills', SkillViewSet)
router.register(r'competition-types', CompetitionTypeViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('csrf/', views.get_csrf_token, name='get_csrf_token'),                 # /api/csrf/
    path('api/register/', views.UserCreate.as_view(), name='register'),          # /api/register/
    path('api/login/', views.custom_login, name='login'),                        # /api/login/
    path('api/logout/', views.logout, name='logout'),                        # /api/logout/
    path('api/token/refresh/', views.refresh_token, name='token_refresh'),       # /api/token/refresh/
]