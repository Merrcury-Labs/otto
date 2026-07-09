import json
from datetime import timedelta

from django.test import Client, TestCase

from courses.models import Course, Enrollment
from quizzes.models import Attempt, Quiz
from users.models import User


class GraphQLTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.student = User(name="Ada Student", email="ada@example.com", userID="student-ada")
        self.student.set_password("password123")
        self.student.save()
        self.course = Course.objects.create(
            name="Python Basics",
            description="Learn Python fundamentals.",
            tutor="Grace Tutor",
            lesson_count=0,
            level="Beginner",
            category="Programming",
        )
        self.quiz = Quiz.objects.create(
            course=self.course,
            title="Python Basics Quiz",
            length=timedelta(minutes=15),
            num_questions=0,
            author="Grace Tutor",
        )

    def execute(self, query, variables=None):
        return self.client.post(
            "/graphql/",
            data=json.dumps({"query": query, "variables": variables or {}}),
            content_type="application/json",
        )

    def test_register_student_mutation(self):
        response = self.execute(
            """
            mutation {
              registerStudent(
                name: "Lin Student",
                email: "lin@example.com",
                password: "password123"
              ) {
                name
                email
              }
            }
            """
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertNotIn("errors", payload)
        self.assertEqual(payload["data"]["registerStudent"]["email"], "lin@example.com")
        self.assertTrue(User.objects.filter(email="lin@example.com").exists())

    def test_courses_query(self):
        Enrollment.objects.create(course=self.course, student=self.student)

        response = self.execute(
            """
            query {
              courses {
                name
                enrollments {
                  student {
                    email
                  }
                }
              }
            }
            """
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertNotIn("errors", payload)
        self.assertEqual(payload["data"]["courses"][0]["name"], "Python Basics")
        self.assertEqual(
            payload["data"]["courses"][0]["enrollments"][0]["student"]["email"],
            "ada@example.com",
        )

    def test_submit_quiz_attempt_mutation(self):
        response = self.execute(
            f"""
            mutation {{
              submitQuizAttempt(
                studentId: "{self.student.id}",
                quizId: "{self.quiz.id}",
                score: 88.5
              ) {{
                score
                student {{
                  email
                }}
              }}
            }}
            """
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertNotIn("errors", payload)
        self.assertEqual(payload["data"]["submitQuizAttempt"]["score"], 88.5)
        self.assertEqual(Attempt.objects.count(), 1)
