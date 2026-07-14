import uuid

from django.contrib.auth.hashers import check_password, make_password
from django.db import models

class User(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    userID = models.CharField(max_length=50, unique=True)
    # is_tutor: models.BooleanField[bool] = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)
