import uuid

from django.db import models

class Org(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    logo = models.TextField(blank=True)
    website = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.name

class Tutor(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.TextField(blank=True)
    email = models.EmailField()
    org = models.ForeignKey(Org, related_name='tutors', on_delete=models.CASCADE)

    def __str__(self):
        return self.name
    
