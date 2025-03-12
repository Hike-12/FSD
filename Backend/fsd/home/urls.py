from django.urls import path
from .views import get_data

urlpatterns = [
    path('data/', get_data),
]
