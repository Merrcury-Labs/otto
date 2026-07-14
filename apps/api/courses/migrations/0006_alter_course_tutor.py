import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0005_remove_module_position_alter_lesson_position'),
        ('dashboard', '0002_alter_org_description_alter_tutor_bio'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='course',
            name='tutor',
        ),
        migrations.AddField(
            model_name='course',
            name='tutor',
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='courses',
                to='dashboard.tutor',
            ),
        ),
    ]
