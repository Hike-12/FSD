from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    ROLES = (
        ('STUDENT', 'Student'),
        ('ADMIN', 'Admin'),
        ('MENTOR', 'Mentor'),
        ('MANAGEMENT', 'Management')
    )
    role = models.CharField(max_length=20, choices=ROLES, default='STUDENT')
    # Add other fields as needed
    email = models.EmailField(unique=True)