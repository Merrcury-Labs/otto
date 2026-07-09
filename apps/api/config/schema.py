import strawberry

from courses.schema import CourseMutation, CourseQuery
from dashboard.schema import DashboardMutation, DashboardQuery
from quizzes.schema import QuizMutation, QuizQuery
from users.schema import StudentMutation, StudentQuery


@strawberry.type
class Query(CourseQuery, DashboardQuery, QuizQuery, StudentQuery):
    pass


@strawberry.type
class Mutation(CourseMutation, DashboardMutation, QuizMutation, StudentMutation):
    pass


schema = strawberry.Schema(query=Query, mutation=Mutation)
