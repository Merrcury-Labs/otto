import strawberry

from courses.schema import CourseMutation, CourseQuery
from dashboard.schema import DashboardMutation, DashboardQuery
from flashcards.schema import FlashcardMutation, FlashcardQuery
from quizzes.schema import QuizMutation, QuizQuery
from users.schema import StudentMutation, StudentQuery


@strawberry.type
class Query(CourseQuery, DashboardQuery, FlashcardQuery, QuizQuery, StudentQuery):
    pass


@strawberry.type
class Mutation(CourseMutation, DashboardMutation, FlashcardMutation, QuizMutation, StudentMutation):
    pass


schema = strawberry.Schema(query=Query, mutation=Mutation)
