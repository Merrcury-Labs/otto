import uuid

import django.db.models.deletion
from django.contrib.auth.hashers import make_password
from django.db import migrations, models


def migrate_enrollment_students(apps, schema_editor):
    Enrollment = apps.get_model('courses', 'Enrollment')
    User = apps.get_model('users', 'User')

    for enrollment in Enrollment.objects.all():
        student, _ = User.objects.get_or_create(
            email=enrollment.student_email,
            defaults={
                'name': enrollment.student_name,
                'password': make_password(None),
                'userID': f"student-{uuid.uuid4().hex[:24]}",
            },
        )
        enrollment.student = student
        enrollment.save(update_fields=['student'])


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
        ('courses', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='enrollment',
            name='student',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='enrollments',
                to='users.user',
            ),
        ),
        migrations.RunPython(migrate_enrollment_students, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name='enrollment',
            name='student_email',
        ),
        migrations.RemoveField(
            model_name='enrollment',
            name='student_name',
        ),
        migrations.AlterField(
            model_name='enrollment',
            name='student',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='enrollments',
                to='users.user',
            ),
        ),
        migrations.AddConstraint(
            model_name='enrollment',
            constraint=models.UniqueConstraint(
                fields=('course', 'student'),
                name='unique_course_student_enrollment',
            ),
        ),
    ]
