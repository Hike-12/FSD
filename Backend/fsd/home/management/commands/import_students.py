import csv
import random
from django.core.management.base import BaseCommand
from home.models import CustomUser, StudentProfile
from django.contrib.auth.models import BaseUserManager

class Command(BaseCommand):
    help = 'Import students and users from a CSV file into the database'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path to the CSV file')

    def handle(self, *args, **kwargs):
        csv_file = kwargs['csv_file']

        try:
            with open(csv_file, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                for row in reader:
                    # Generate a random email if the Email field is missing or empty
                    email = row.get('Email', '').strip()
                    if not email:
                        email = f"{row['Full Name'].replace(' ', '').lower()}{random.randint(1000, 9999)}@example.com"

                    # Generate a username based on the Full Name field
                    full_name = row['Full Name'].strip()
                    username = full_name.replace(' ', '').lower()  # Remove spaces and convert to lowercase
                    username = f"{username}{random.randint(1000, 9999)}"  # Add a random number to ensure uniqueness

                    # Create or update the CustomUser
                    user, user_created = CustomUser.objects.update_or_create(
                        email=email,  # Use the generated or provided email
                        defaults={
                            'username': username,  # Use the generated username
                            'role': 'student',  # Set the role to 'student'
                            'password': '123',
                        }
                    )
                    if user_created:
                        self.stdout.write(f"Created user: {user.username}")
                    else:
                        self.stdout.write(f"Updated user: {user.username}")

                    # Create or update the StudentProfile
                    student, student_created = StudentProfile.objects.update_or_create(
                        user=user,  # Link the StudentProfile to the CustomUser
                        defaults={
                            'full_name': row['Full Name'],
                            'date_of_birth': row['Date of Birth'],
                            'gender': row['Gender'],
                            'phone_number': row['Phone Number'],
                            'address': row['Address'],
                            'country': row['Country'],
                            'state': row['State'],
                            'city': row['City'],
                            'postal_code': row['Postal Code'],
                            'education_level': row['Education Level'],
                            'student_id': row['Student ID'],
                            'department': row['Department'],
                            'year_of_study': row['Year of Study'],
                            'gpa': float(row['GPA']) if row['GPA'] else None,
                            'extracurricular_activities': row['Extracurricular Activities'],
                            'achievements': row['Achievements'],
                            'certifications': row['Certifications'],
                            'projects': row['Projects'],
                            'internships': row['Internships'],
                            'preferred_team_roles': row['Preferred Team Roles'],
                            'emergency_contact_name': row['Emergency Contact Name'],
                            'emergency_contact_number': row['Emergency Contact Number'],
                            'hobbies': row['Hobbies'],
                            'career_goal': row['Career Goal'],
                            'languages_spoken': row['Languages Spoken'],
                            'learning_style': row['Learning Style'],
                            'linkedin': row['LinkedIn'],
                            'github': row['GitHub'],
                            'portfolio': row['Portfolio'],
                            'is_active': row['Is Active'].lower() == 'true',
                        }
                    )
                    if student_created:
                        self.stdout.write(f"Created student profile: {student.full_name}")
                    else:
                        self.stdout.write(f"Updated student profile: {student.full_name}")

            self.stdout.write(self.style.SUCCESS('Successfully imported students and users from CSV!'))

        except Exception as e:
            self.stderr.write(f"Error importing students: {e}")