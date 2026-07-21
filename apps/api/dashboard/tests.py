from django.test import TestCase

from config.schema import schema
from dashboard.models import Org, Tutor


class DashboardGraphQLTests(TestCase):
    def test_create_org_registers_owner_as_tutor(self):
        result = schema.execute_sync(
            """
            mutation CreateOrg(
              $name: String!
              $ownerUserId: String
              $ownerName: String
              $ownerEmail: String
            ) {
              createOrg(
                name: $name
                ownerUserId: $ownerUserId
                ownerName: $ownerName
                ownerEmail: $ownerEmail
              ) { id }
            }
            """,
            variable_values={
                "name": "Acme Learning",
                "ownerUserId": "auth-owner-1",
                "ownerName": "Ada Owner",
                "ownerEmail": "ADA@example.com",
            },
        )

        self.assertIsNone(result.errors)
        org = Org.objects.get(owner_user_id="auth-owner-1")
        tutor = Tutor.objects.get(org=org)
        self.assertEqual(tutor.name, "Ada Owner")
        self.assertEqual(tutor.email, "ada@example.com")

    def test_create_tutor_for_owner_is_scoped_and_idempotent_by_email(self):
        org = Org.objects.create(name="Acme Learning", owner_user_id="owner-1")
        mutation = """
            mutation CreateTutorForOwner(
              $ownerUserId: String!
              $name: String!
              $email: String!
            ) {
              createTutorForOwner(
                ownerUserId: $ownerUserId
                name: $name
                email: $email
              ) { id email }
            }
        """

        for email in ("tutor@example.com", "TUTOR@example.com"):
            result = schema.execute_sync(
                mutation,
                variable_values={
                    "ownerUserId": "owner-1",
                    "name": "New Tutor",
                    "email": email,
                },
            )
            self.assertIsNone(result.errors)

        self.assertEqual(Tutor.objects.filter(org=org).count(), 1)
