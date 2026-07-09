import uuid

from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'password', 'userID')
        read_only_fields = ('id',)
        extra_kwargs = {
            'userID': {'required': False},
        }

    def create(self, validated_data):
        password = validated_data.pop('password', '')
        validated_data.setdefault('userID', f"student-{uuid.uuid4().hex[:24]}")
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
