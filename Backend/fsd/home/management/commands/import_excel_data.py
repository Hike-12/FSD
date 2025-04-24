import pandas as pd
import os
import random
from django.core.management.base import BaseCommand
from django.db import transaction
from home.models import CustomUser, StudentProfile, MentorProfile
from django.utils import timezone
<<<<<<< HEAD
=======

>>>>>>> a0bb91cca3c6c10e7a7033cadfef81588ec93c48

class Command(BaseCommand):
    help = 'Import student and mentor data from Excel files'

    def add_arguments(self, parser):
        parser.add_argument('--student-file', type=str, help='Path to student Excel file', 
                            default='../database/student_db.xlsx')
        parser.add_argument('--mentor-file', type=str, help='Path to mentor Excel file',
                            default='../database/mentor_db.xlsx')
        parser.add_argument('--keep-existing', action='store_true', help='Keep existing data')

    def handle(self, *args, **options):
        student_file = options['student_file']
        mentor_file = options['mentor_file']
        keep_existing = options['keep_existing']
        
        try:
            with transaction.atomic():
                # Delete existing data unless keep-existing is specified
                if not keep_existing:
                    self.stdout.write("Deleting existing mentor and student data...")
                    MentorProfile.objects.all().delete()
                    StudentProfile.objects.all().delete()
                    CustomUser.objects.filter(role__in=['STUDENT', 'MENTOR']).delete()
                    self.stdout.write(self.style.SUCCESS("Existing data deleted"))
                
                # Import students
                if os.path.exists(student_file):
                    self.import_students(student_file)
                else:
                    self.stdout.write(self.style.ERROR(f"Student file not found: {student_file}"))
                
                # Import mentors
                if os.path.exists(mentor_file):
                    self.import_mentors(mentor_file)
                else:
                    self.stdout.write(self.style.ERROR(f"Mentor file not found: {mentor_file}"))
                    
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error during import: {e}"))
            raise
    
    def import_students(self, excel_file):
        try:
            df = pd.read_excel(excel_file)
            count = 0
            for _, row in df.iterrows():
<<<<<<< HEAD
                try:
                    # Generate username and email
                    full_name = str(row.get('Full Name', '')).strip()
                    if not full_name:
                        continue  # Skip rows without a full name
                    
                    username = f"{full_name.lower().replace(' ', '')}{random.randint(1000, 9999)}"
                    email = f"{username}@example.com"
                    
                    # Create user
                    user = CustomUser.objects.create_user(
                        username=username,
                        email=email,
                        password='password123',
                        role='STUDENT'
                    )
                    
                    # Update the profile with Excel data
                    profile = StudentProfile.objects.get(user=user)
                    profile.full_name = full_name
                    profile.date_of_birth = pd.to_datetime(row.get('Date of Birth')) if pd.notna(row.get('Date of Birth')) else None
                    profile.gender = row.get('Gender', 'prefer_not_to_say')
                    profile.phone_number = str(row.get('Phone Number', '')).strip()
                    profile.address = row.get('Address', '')
                    profile.country = row.get('Country', '')
                    profile.state = row.get('State', '')
                    profile.city = row.get('City', '')
                    profile.postal_code = str(row.get('Postal Code', '')).strip()
                    profile.education_level = row.get('Education Level', '')
                    profile.student_id = row.get('Student ID', '')
                    profile.department = row.get('Department', '')
                    profile.year_of_study = row.get('Year of Study', 'First')
                    profile.gpa = float(row.get('GPA')) if pd.notna(row.get('GPA')) else None
                    profile.extracurricular_activities = row.get('Extracurricular Activities', '')
                    profile.achievements = row.get('Achievements', '')
                    profile.certifications = row.get('Certifications', '')
                    profile.projects = row.get('Projects', '')
                    profile.internships = row.get('Internships', '')
                    profile.preferred_team_roles = row.get('Preferred Team Roles', '')
                    profile.emergency_contact_name = row.get('Emergency Contact Name', '')
                    profile.emergency_contact_number = str(row.get('Emergency Contact Number', '')).strip()
                    profile.hobbies = row.get('Hobbies', '')
                    profile.career_goal = row.get('Career Goal', '')
                    profile.languages_spoken = row.get('Languages Spoken', '')
                    profile.learning_style = row.get('Learning Style', '')
                    profile.profile_picture_url = row.get('Profile Picture URL', '')
                    profile.linkedin = row.get('LinkedIn', '')
                    profile.github = row.get('GitHub', '')
                    profile.portfolio = row.get('Portfolio', '')
                    profile.created_at = pd.to_datetime(row.get('Created At')) if pd.notna(row.get('Created At')) else timezone.now()
                    profile.updated_at = pd.to_datetime(row.get('Updated At')) if pd.notna(row.get('Updated At')) else timezone.now()
                    profile.is_active = True
                    profile.save()
                    count += 1
                    
                except Exception as e:
                    self.stderr.write(self.style.WARNING(f"Skipped student row due to error: {e}"))
            self.stdout.write(self.style.SUCCESS(f"Successfully imported {count} students"))
=======
                # Generate username and email
                full_name = row.get('Full Name', '')
                username = f"{full_name.lower().replace(' ', '')}{random.randint(1000, 9999)}"
                email = f"{username}@example.com"
                
                # Create user - this will trigger the signal to create a student profile
                user = CustomUser.objects.create_user(
                    username=username,
                    email=email,
                    password='password123',
                    role='STUDENT'
                )
                
                # Get the automatically created profile
                profile = StudentProfile.objects.get(user=user)
                
                # Update the profile with Excel data
                profile.full_name = row.get('Full Name', '')
                profile.date_of_birth = row.get('Date of Birth')
                profile.gender = row.get('Gender', 'prefer_not_to_say')
                profile.phone_number = str(row.get('Phone Number', ''))
                profile.address = row.get('Address', '')
                profile.country = row.get('Country', '')
                profile.state = row.get('State', '')
                profile.city = row.get('City', '')
                profile.postal_code = str(row.get('Postal Code', ''))
                profile.education_level = row.get('Education Level', '')
                profile.student_id = row.get('Student ID', '')
                profile.department = row.get('Department', '')
                profile.year_of_study = row.get('Year of Study', 'First')

                profile.gpa = float(row.get('GPA')) if pd.notna(row.get('GPA')) else None
                profile.extracurricular_activities = row.get('Extracurricular Activities', '')
                profile.achievements = row.get('Achievements', '')
                profile.certifications = row.get('Certifications', '')
                profile.projects = row.get('Projects', '')
                profile.internships = row.get('Internships', '')
                profile.preferred_team_roles = row.get('Preferred Team Roles', '')

                profile.emergency_contact_name = row.get('Emergency Contact Name', '')
                profile.emergency_contact_number = str(row.get('Emergency Contact Number', ''))
                profile.hobbies = row.get('Hobbies', '')
                profile.career_goal = row.get('Career Goal', '')
                profile.languages_spoken = row.get('Languages Spoken', '')
                profile.learning_style = row.get('Learning Style', '')

                profile.profile_picture_url = row.get('Profile Picture URL', '')
                profile.linkedin = row.get('LinkedIn', '')
                profile.github = row.get('GitHub', '')
                profile.portfolio = row.get('Portfolio', '')

                profile.created_at = row.get('Created At') if pd.notna(row.get('Created At')) else timezone.now()
                profile.updated_at = row.get('Updated At') if pd.notna(row.get('Updated At')) else timezone.now()
                profile.is_active = True

                    
                    # Save the updated profile
                profile.save()
                count += 1
                    
                self.stdout.write(self.style.SUCCESS(f"Successfully imported {count} students"))
>>>>>>> a0bb91cca3c6c10e7a7033cadfef81588ec93c48
                
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error importing students: {e}"))
            raise
    
    def import_mentors(self, excel_file):
        try:
            df = pd.read_excel(excel_file)
            count = 0
            for _, row in df.iterrows():
<<<<<<< HEAD
                try:
                    # Generate username and email
                    full_name = str(row.get('Full Name', '')).strip()
                    if not full_name:
                        continue  # Skip rows without a full name
                    
                    username = f"{full_name.lower().replace(' ', '')}{random.randint(1000, 9999)}"
                    email = f"{username}@example.com"
                    
                    # Create user
                    user = CustomUser.objects.create_user(
                        username=username,
                        email=email,
                        password='password123',
                        role='MENTOR'
                    )
                    
                    # Update the profile with Excel data
                    profile = MentorProfile.objects.get(user=user)
                    profile.full_name = full_name
                    profile.date_of_birth = pd.to_datetime(row.get('Date of Birth')) if pd.notna(row.get('Date of Birth')) else None
                    profile.gender = row.get('Gender', 'prefer_not_to_say')
                    profile.phone_number = str(row.get('Phone Number', '')).strip()
                    profile.address = row.get('Address', '')
                    profile.country = row.get('Country', '')
                    profile.state = row.get('State', '')
                    profile.city = row.get('City', '')
                    profile.postal_code = str(row.get('Postal Code', '')).strip()
                    profile.mentor_type = row.get('Mentor Type', '')
                    profile.department = row.get('Department', '')
                    profile.expertise = row.get('Expertise', '')
                    profile.years_of_experience = int(row.get('Years of Experience')) if pd.notna(row.get('Years of Experience')) else 0
                    profile.current_company = row.get('Current Company', '')
                    profile.current_position = row.get('Current Position', '')
                    profile.past_mentorship_count = int(row.get('Past Mentorship Count')) if pd.notna(row.get('Past Mentorship Count')) else 0
                    profile.linkedin = row.get('LinkedIn', '')
                    profile.github = row.get('GitHub', '')
                    profile.website = row.get('Website', '')
                    profile.bio = row.get('Bio', '')
                    profile.certifications = row.get('Certifications', '')
                    profile.achievements = row.get('Achievements', '')
                    profile.languages_spoken = row.get('Languages Spoken', '')
                    profile.availability_status = row.get('Availability Status', 'Unavailable')
                    profile.available_days = row.get('Available Days', '')
                    profile.available_times = row.get('Available Times', '')
                    profile.max_teams = int(row.get('Max Teams')) if pd.notna(row.get('Max Teams')) else 0
                    profile.current_teams_count = int(row.get('Current Teams Count')) if pd.notna(row.get('Current Teams Count')) else 0
                    profile.profile_picture = row.get('Profile Picture', '')
                    profile.created_at = pd.to_datetime(row.get('Created At')) if pd.notna(row.get('Created At')) else timezone.now()
                    profile.updated_at = pd.to_datetime(row.get('Updated At')) if pd.notna(row.get('Updated At')) else timezone.now()
                    profile.is_verified = True
                    profile.average_rating = float(row.get('Average Rating')) if pd.notna(row.get('Average Rating')) else 0.0
                    profile.save()
                    count += 1
                    
                except Exception as e:
                    self.stderr.write(self.style.WARNING(f"Skipped mentor row due to error: {e}"))
=======
                # Generate username and email
                full_name = row.get('Full Name', '')
                username = f"{full_name.lower().replace(' ', '')}{random.randint(1000, 9999)}"
                email = f"{username}@example.com"
                
                # Create user - this will trigger the signal to create a mentor profile
                user = CustomUser.objects.create_user(
                    username=username,
                    email=email,
                    password='password123',
                    role='MENTOR'
                )
                
                # Get the automatically created profile
                profile = MentorProfile.objects.get(user=user)
                
                # Update the profile with Excel data
                profile.full_name = row.get('Full Name', '')
                profile.date_of_birth = row.get('Date of Birth')
                profile.gender = row.get('Gender', 'prefer_not_to_say')
                profile.phone_number = str(row.get('Phone Number', ''))
                profile.address = row.get('Address', '')
                profile.country = row.get('Country', '')
                profile.state = row.get('State', '')
                profile.city = row.get('City', '')
                profile.postal_code = str(row.get('Postal Code', ''))
                profile.mentor_type = row.get('Mentor Type', '')
                profile.department = row.get('Department', '')
                profile.expertise = row.get('Expertise', '')

                profile.years_of_experience = int(row.get('Years of Experience')) if pd.notna(row.get('Years of Experience')) else 0
                profile.current_company = row.get('Current Company', '')
                profile.current_position = row.get('Current Position', '')
                profile.past_mentorship_count = int(row.get('Past Mentorship Count', 0)) if pd.notna(row.get('Past Mentorship Count')) else 0

                profile.linkedin = row.get('LinkedIn', '')
                profile.github = row.get('GitHub', '')
                profile.website = row.get('Website', '')

                profile.bio = row.get('Bio', '')
                profile.certifications = row.get('Certifications', '')
                profile.achievements = row.get('Achievements', '')
                profile.languages_spoken = row.get('Languages Spoken', '')

                profile.availability_status = row.get('Availability Status', 'Unavailable')
                profile.available_days = row.get('Available Days', '')
                profile.available_times = row.get('Available Times', '')
                profile.max_teams = int(row.get('Max Teams', 0)) if pd.notna(row.get('Max Teams')) else 0
                profile.current_teams_count = int(row.get('Current Teams Count', 0)) if pd.notna(row.get('Current Teams Count')) else 0

                profile.profile_picture = row.get('Profile Picture', '')

                profile.created_at = row.get('Created At') if pd.notna(row.get('Created At')) else timezone.now()
                profile.updated_at = row.get('Updated At') if pd.notna(row.get('Updated At')) else timezone.now()
                profile.is_verified = True

                profile.average_rating = float(row.get('Average Rating')) if pd.notna(row.get('Average Rating')) else 0.0

                # Save the updated profile
                profile.save()
                count += 1
                
>>>>>>> a0bb91cca3c6c10e7a7033cadfef81588ec93c48
            self.stdout.write(self.style.SUCCESS(f"Successfully imported {count} mentors"))
                
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error importing mentors: {e}"))
            raise
