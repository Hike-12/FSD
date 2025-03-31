from django.urls import path
from . import views


urlpatterns = [
    # Auth-related
    # path('csrf/', views.get_csrf_token, name='get_csrf_token'),
    path('api/register/', views.create_user, name='create_user'),
    path('api/login/', views.custom_login, name='custom_login'),
    # path('api/token/refresh/', views.refresh_token, name='refresh_token'),
    path('api/logout/', views.custom_logout, name='logout'),

    # Mentor Profile
    path('api/mentors/', views.get_all_mentors, name='get_all_mentors'),
    path('api/mentors/<int:id>/', views.mentor_detail, name='mentor-detail'),
    path('api/mentor-profiles/my_profile/', views.my_profile, name='my_profile'),
    path('api/mentor-profiles/create_or_update/', views.create_or_update_profile, name='create_or_update_profile'),
    path('api/mentor-profiles/<int:mentor_id>/', views.update_mentor_profile, name='update_mentor_profile'),

    # Lists
    path('api/skills/', views.list_skills, name='list_skills'),
    path('api/competition-types/', views.list_competition_types, name='list_competition_types'),
    
    path('api/user/', views.get_user_info, name='get_user_info'),
    
    # Student Profile
    path('api/recommended-students/', views.get_recommended_students, name='get_recommended_students'),
    path('api/students/<int:student_id>/', views.get_student_detail, name='get_student_detail'),
    path('api/student/profile/', views.student_profile, name='student_profile'),
    path('api/student/profile/update/', views.create_or_update_student_profile, name='update_student_profile'),
    path('api/student/profile/<int:student_id>/update/', views.update_student_profile, name='update_student_profile_detail'),
    path('api/student/get-student-teams/', views.get_student_teams, name='get_student_teams'),
    # Competitions
    path('competition-types/', views.competition_types_list, name='competition-types-list'),
    path('api/competitions/<int:competition_id>/', views.competition_detail, name='competition-detail'),
    path('api/competitions/', views.list_competitions, name='list_competitions'),
    path('api/competitions/create/', views.create_competition, name='create_competition'),
    
    #Hosts
    path('api/hosts/profile/', views.create_or_update_host_profile, name='host-detail'),
    
    #TEAMS
    path('api/join-team/', views.join_team, name='join_team'),
    path('api/create-team/', views.create_team, name='create_team'),
    path("api/teams/<int:team_id>/", views.get_team_details, name="get_team_details"),
]


