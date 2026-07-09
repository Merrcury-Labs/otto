from rest_framework import serializers

from .models import Org, Tutor


class TutorSerializer(serializers.ModelSerializer):
    org_name = serializers.CharField(source='org.name', read_only=True)

    class Meta:
        model = Tutor
        fields = ('id', 'name', 'bio', 'profile_picture', 'email', 'org', 'org_name')
        read_only_fields = ('id', 'org_name')


class OrgSerializer(serializers.ModelSerializer):
    tutors = TutorSerializer(many=True, read_only=True)

    class Meta:
        model = Org
        fields = ('id', 'name', 'description', 'logo', 'website', 'tutors')
        read_only_fields = ('id',)
