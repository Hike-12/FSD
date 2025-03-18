from rest_framework import serializers
from .models import CustomUser, MentorProfile, Skill, CompetitionType

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'password', 'role')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data['role']
        )
        return user




class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']


class CompetitionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompetitionType
        fields = ['id', 'name']


class MentorProfileSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)
    competition_types = CompetitionTypeSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(),
        many=True,
        write_only=True,
        required=False,
        source='skills'
    )
    competition_type_ids = serializers.PrimaryKeyRelatedField(
        queryset=CompetitionType.objects.all(),
        many=True,
        write_only=True,
        required=False,
        source='competition_types'
    )

    class Meta:
        model = MentorProfile
        fields = [
            'id', 'user', 'full_name', 'date_of_birth', 'gender', 'phone_number',
            'address', 'country', 'state', 'city', 'postal_code',
            'mentor_type', 'department', 'expertise', 'years_of_experience',
            'current_company', 'current_position', 'skills', 'skill_ids',
            'competition_types', 'competition_type_ids', 'past_mentorship_count',
            'linkedin', 'github', 'website', 'bio', 'certifications',
            'achievements', 'languages_spoken', 'availability_status',
            'available_days', 'available_times', 'max_teams',
            'current_teams_count', 'profile_picture', 'created_at',
            'updated_at', 'is_verified', 'average_rating'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at', 'is_verified', 
                            'average_rating', 'past_mentorship_count', 'current_teams_count']
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make all fields optional for creation via signal
        if self.instance is None:  # Only for creation
            for field in self.fields:
                self.fields[field].required = False

    def create(self, validated_data):
        # Handle the case where the user is creating a new profile
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['user'] = request.user
        return super().create(validated_data)