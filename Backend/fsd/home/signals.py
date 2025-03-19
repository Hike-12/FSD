from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import CustomUser, MentorProfile, StudentProfile

@receiver(post_save, sender=CustomUser)
def create_mentor_profile(sender, instance, created, **kwargs):
    if created and instance.role == 'MENTOR':
        MentorProfile.objects.create(user=instance, full_name=instance.get_full_name())
    # elif created and instance.role == 'STUDENT' and not instance.is_superuser:
    #         StudentProfile.objects.create(user=instance, full_name=instance.get_full_name(), student_id='AUTO123')