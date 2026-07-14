import uuid

import django.db.models.deletion
from django.contrib.auth.hashers import make_password
from django.db import migrations, models


def migrate_attempt_students(apps, schema_editor):
    Attempt = apps.get_model('quizzes', 'Attempt')
    User = apps.get_model('users', 'User')

    for attempt in Attempt.objects.all():
        student, _ = User.objects.get_or_create(
            email=attempt.student_email,
            defaults={
                'name': attempt.student_name,
                'password': make_password(None),
                'userID': f"student-{uuid.uuid4().hex[:24]}",
            },
        )
        attempt.student = student
        attempt.save(update_fields=['student'])


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
        ('quizzes', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='attempt',
            name='student',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='quiz_attempts',
                to='users.user',
            ),
        ),
        migrations.RunPython(migrate_attempt_students, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name='attempt',
            name='student_email',
        ),
        migrations.RemoveField(
            model_name='attempt',
            name='student_name',
        ),
        migrations.AlterField(
            model_name='attempt',
            name='student',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='quiz_attempts',
                to='users.user',
            ),
        ),
    ]
