import pandas as pd
import os
import random
from django.core.management.base import BaseCommand
from django.db import transaction
from home.models import CustomUser, StudentProfile, MentorProfile

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
                profile.department = row.get('Department', '')
                profile.year_of_study = row.get('Year of Study', 'First')
                profile.gpa = float(row.get('GPA', 0)) if pd.notna(row.get('GPA')) else None
                profile.extracurricular_activities = row.get('Extracurricular Activities', '')
                profile.achievements = row.get('Achievements', '')
                profile.certifications = row.get('Certifications', '')
                profile.projects = row.get('Projects', '')
                profile.internships = row.get('Internships', '')
                profile.hobbies = row.get('Hobbies', '')
                profile.career_goal = row.get('Career Goal', '')
                profile.languages_spoken = row.get('Languages Spoken', '')
                profile.is_active = True
                
                # Save the updated profile
                profile.save()
                count += 1
                
            self.stdout.write(self.style.SUCCESS(f"Successfully imported {count} students"))
            
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error importing students: {e}"))
            raise
    
    def import_mentors(self, excel_file):
        try:
            df = pd.read_excel(excel_file)
            count = 0
            for _, row in df.iterrows():
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
                profile.department = row.get('Department', '')
                profile.expertise = row.get('Expertise', '')
                profile.years_of_experience = int(row.get('Years of Experience', 0)) if pd.notna(row.get('Years of Experience')) else 0
                profile.current_company = row.get('Current Company', '')
                profile.current_position = row.get('Current Position', '')
                profile.bio = row.get('Bio', '')
                profile.languages_spoken = row.get('Languages Spoken', '')
                profile.is_verified = True
                
                # Save the updated profile
                profile.save()
                count += 1
                
            self.stdout.write(self.style.SUCCESS(f"Successfully imported {count} mentors"))
            
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error importing mentors: {e}"))
            raise