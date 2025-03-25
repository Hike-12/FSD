import random
from faker import Faker
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from home.models import Skill, CompetitionType

fake = Faker()
User = get_user_model()

class Command(BaseCommand):
    help = 'Populate existing user profiles with comprehensive fake data'
    
    def add_arguments(self, parser):
        parser.add_argument('--mentors', type=int, default=20, help='Number of mentor users to create')
        parser.add_argument('--students', type=int, default=25, help='Number of student users to create')
        
    def handle(self, *args, **kwargs):
        # Ensure some skills and competition types exist
        self.create_skills_and_competition_types()
        User = get_user_model()
        fake = Faker()

        # Create mentor users
        mentors_count = kwargs['mentors']
        for _ in range(mentors_count):
            first_name = fake.first_name()
            last_name = fake.last_name()
            username = f"{first_name.lower()}.{last_name.lower()}"
            email = f"{username}@example.com"
            
            # Ensure unique username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{first_name.lower()}.{last_name.lower()}{counter}"
                email = f"{username}@example.com"
                counter += 1

            User.objects.create_user(
                username=username,
                email=email,
                password='mentor123',  # Consider using a more secure method in production
                first_name=first_name,
                last_name=last_name,
                role='MENTOR'
            )
            self.stdout.write(self.style.SUCCESS(f'Created mentor user: {username}'))

        # Create student users
        students_count = kwargs['students']
        for _ in range(students_count):
            first_name = fake.first_name()
            last_name = fake.last_name()
            username = f"{first_name.lower()}.{last_name.lower()}"
            email = f"{username}@example.com"
            
            # Ensure unique username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{first_name.lower()}.{last_name.lower()}{counter}"
                email = f"{username}@example.com"
                counter += 1

            User.objects.create_user(
                username=username,
                email=email,
                password='student123',  # Consider using a more secure method in production
                first_name=first_name,
                last_name=last_name,
                role='STUDENT'
            )
            self.stdout.write(self.style.SUCCESS(f'Created student user: {username}'))

        self.stdout.write(self.style.SUCCESS(f'Created {mentors_count} mentors and {students_count} students'))
        
        # Populate existing profiles
        self.populate_profiles(mentors=20, students=25)
        self.stdout.write(self.style.SUCCESS('Existing profiles successfully populated with detailed data!'))

    def create_skills_and_competition_types(self):
        # Create some sample skills if they don't exist
        skills_data = [
            'Python', 'JavaScript', 'Machine Learning', 
            'Project Management', 'UI/UX Design', 
            'Data Analysis', 'Cloud Computing'
        ]
        for skill_name in skills_data:
            Skill.objects.get_or_create(name=skill_name)

        # Create some sample competition types if they don't exist
        competition_types = [
            'Hackathon', 'Data Science Challenge', 
            'Innovation Contest', 'Startup Competition'
        ]
        for comp_type_name in competition_types:
            CompetitionType.objects.get_or_create(name=comp_type_name)

    def populate_profiles(self, mentors, students):
        # Get existing skills and competition types
        skills = list(Skill.objects.all())
        competition_types = list(CompetitionType.objects.all())

        # Populate mentor profiles
        mentor_users = User.objects.filter(role='MENTOR', mentor_profile__full_name__isnull=True)[:mentors]
        for user in mentor_users:
            profile = user.mentor_profile
            profile.full_name = f"{user.first_name} {user.last_name}"
            profile.date_of_birth = fake.date_of_birth(minimum_age=25, maximum_age=65)
            profile.gender = random.choice(['male', 'female', 'non_binary', 'prefer_not_to_say', 'other'])
            profile.phone_number = f"+{fake.country_calling_code()}{fake.numerify(text='##########')}"
            
            # Location
            profile.address = fake.street_address()
            profile.country = fake.country()
            profile.state = fake.state()
            profile.city = fake.city()
            profile.postal_code = fake.postcode()
            
            # Professional details
            profile.mentor_type = random.choice(['faculty', 'industry', 'alumni', 'other'])
            profile.department = fake.word()
            profile.expertise = fake.paragraph()
            profile.years_of_experience = random.randint(1, 30)
            profile.current_company = fake.company()
            profile.current_position = fake.job()
            
            # Availability
            profile.availability_status = random.choice(['available', 'limited', 'unavailable'])
            profile.available_days = ', '.join(random.sample(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], k=random.randint(1, 5)))
            profile.available_times = f"{random.randint(6, 10)}am - {random.randint(2, 6)}pm"
            profile.max_teams = random.randint(1, 5)
            profile.current_teams_count = random.randint(0, 3)
            
            # Additional details
            profile.linkedin = fake.url()
            profile.github = fake.url()
            profile.website = fake.url()
            profile.bio = fake.paragraph()
            profile.certifications = fake.sentence()
            profile.achievements = fake.sentence()
            profile.languages_spoken = ', '.join(random.sample(['English', 'Spanish', 'French', 'German', 'Mandarin'], k=random.randint(1, 3)))
            
            # Verification
            profile.is_verified = random.choice([True, False])
            profile.average_rating = round(random.uniform(0, 5), 2)
            
            # Save profile
            profile.save()

            # Add skills and competition types
            profile.skills.set(random.sample(skills, k=random.randint(1, min(3, len(skills)))))
            profile.competition_types.set(random.sample(competition_types, k=random.randint(0, min(2, len(competition_types)))))

        # Populate student profiles
        student_users = User.objects.filter(role='STUDENT', student_profile__full_name__isnull=True)[:students]
        for user in student_users:
            profile = user.student_profile
            profile.full_name = f"{user.first_name} {user.last_name}"
            profile.date_of_birth = fake.date_of_birth(minimum_age=18, maximum_age=25)
            profile.gender = random.choice(['male', 'female', 'non_binary', 'prefer_not_to_say', 'other'])
            profile.phone_number = f"+{fake.country_calling_code()}{fake.numerify(text='##########')}"
            
            # Location
            profile.address = fake.street_address()
            profile.country = fake.country()
            profile.state = fake.state()
            profile.city = fake.city()
            profile.postal_code = fake.postcode()
            
            # Academic details
            profile.education_level = random.choice(['undergraduate', 'graduate', 'phd', 'other'])
            profile.student_id = fake.uuid4()[:10]
            profile.department = fake.word()
            profile.year_of_study = random.choice(['first', 'second', 'third', 'fourth', 'fifth', 'other'])
            profile.gpa = round(random.uniform(6.0, 10.0), 2)
            
            # Additional details
            profile.extracurricular_activities = fake.sentence()
            profile.achievements = fake.sentence()
            profile.preferred_team_roles = ', '.join(random.sample(['Team Lead', 'Developer', 'Designer', 'Researcher'], k=random.randint(1, 3)))
            
            # Online presence
            profile.linkedin = fake.url()
            profile.github = fake.url()
            profile.portfolio = fake.url()
            
            # Interests
            profile.hobbies = ', '.join(random.sample(['Reading', 'Coding', 'Sports', 'Music', 'Traveling'], k=random.randint(1, 4)))
            profile.career_goal = fake.sentence()
            profile.languages_spoken = ', '.join(random.sample(['English', 'Spanish', 'French', 'German', 'Mandarin'], k=random.randint(1, 3)))
            profile.learning_style = random.choice(['Visual', 'Auditory', 'Kinesthetic'])
            
            # Save profile
            profile.save()

            # Add skills and competition types
            profile.skills.set(random.sample(skills, k=random.randint(1, min(3, len(skills)))))
            profile.preferred_competition_types.set(random.sample(competition_types, k=random.randint(0, min(2, len(competition_types)))))

        self.stdout.write(self.style.SUCCESS(f'Populated {len(mentor_users)} mentor and {len(student_users)} student profiles'))