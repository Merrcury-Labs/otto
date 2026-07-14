import uuid

import strawberry

from .models import User


@strawberry.type(name="Student")
class StudentType:
    id: strawberry.ID
    name: str
    email: str

    @strawberry.field(name="userID")
    def user_id(self) -> str:
        return self.userID


@strawberry.type
class StudentQuery:
    @strawberry.field
    def students(self) -> list[StudentType]:
        return list(User.objects.all().order_by("name"))

    @strawberry.field
    def student(self, id: strawberry.ID) -> StudentType | None:
        return User.objects.filter(pk=id).first()

    @strawberry.field
    def student_by_email(self, email: str) -> StudentType | None:
        return User.objects.filter(email=email).first()

    @strawberry.field
    def student_by_user_id(self, user_id: str) -> StudentType | None:
        return User.objects.filter(userID=user_id).first()


@strawberry.type
class StudentMutation:
    @strawberry.mutation
    def register_student(
        self,
        name: str,
        email: str,
        # password: str,
        user_id: str | None = None,
    ) -> StudentType:
        if User.objects.filter(email=email).exists():
            raise ValueError("A student with this email already exists.")

        student = User(
            name=name,
            email=email,
            userID=user_id or f"student-{uuid.uuid4().hex[:24]}",
        )
        # student.set_password(password)
        student.save()
        return student

    @strawberry.mutation
    def update_student(
        self,
        id: strawberry.ID,
        name: str | None = None,
        email: str | None = None,
        user_id: str | None = None,
    ) -> StudentType:
        student = User.objects.get(pk=id)
        if name is not None:
            student.name = name
        if email is not None:
            student.email = email
        if user_id is not None:
            student.userID = user_id
        student.save()
        return student

    @strawberry.mutation
    def delete_student(self, id: strawberry.ID) -> bool:
        deleted, _ = User.objects.filter(pk=id).delete()
        return deleted > 0
