from django.db.models.signals import post_save
from django.dispatch import receiver
from home.models import CustomUser
from .models import MentorProfile

@receiver(post_save, sender=CustomUser)
def create_mentor_profile(sender, instance, created, **kwargs):
    """Create a mentor profile automatically when a new user is created"""
    if created and instance.role == 'mentor':  # Only create profile for mentor users
        MentorProfile.objects.create(user=instance)