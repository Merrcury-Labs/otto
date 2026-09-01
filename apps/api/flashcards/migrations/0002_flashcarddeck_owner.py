from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("flashcards", "0001_initial"),
        ("users", "0002_remove_user_password"),
    ]

    operations = [
        migrations.AddField(
            model_name="flashcarddeck",
            name="owner",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="owned_flashcard_decks",
                to="users.user",
            ),
        ),
    ]
