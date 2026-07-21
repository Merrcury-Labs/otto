# Otto LMS

A Learning Management System backend built with Django, exposing both **REST** and **GraphQL** APIs. Otto LMS manages courses, lessons, enrollments, quizzes, organizations, and tutors — with UUID primary keys and dual-API access throughout.

## Tech Stack

| Layer          | Technology                          |
| -------------- | ----------------------------------- |
| Framework      | Django 6                            |
| REST API       | Django REST Framework 3.14         |
| GraphQL API    | Strawberry GraphQL + Django adapter |
| Database       | PostgreSQL 16 (SQLite for tests)   |
| Containerization | Docker + Docker Compose          |
| Background jobs | Celery + Redis                    |

## Features

- **Dual API surface** — every resource is accessible via REST and GraphQL
- **Full CRUD** — create, read, update, and delete for all models
- **Nested relationships** — GraphQL queries return related data in a single request (e.g. courses with lessons and enrollments)
- **UUID primary keys** — all models use UUIDs instead of auto-increment integers
- **Docker-ready** — one-command startup with `docker compose up`
- **CORS & CSRF configured** — ready for frontend integration (ports 3000 & 5173)
- **Health check endpoint** — `GET /health/` for load balancers and monitoring

## Project Structure

```
Otto_lms/
├── config/              # Django project settings, root URLs, GraphQL schema
│   ├── settings.py
│   ├── urls.py
│   └── schema.py
├── users/               # User/Student management
├── courses/             # Courses, Lessons, Enrollments
├── quizzes/             # Quizzes, Questions, Attempts
├── dashboard/           # Organizations, Tutors
├── tracks/              # (placeholder for future learning tracks)
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── .env.example
└── manage.py
```

## Data Model

```
Org ──1:N── Tutor
Course ──1:N── Module ──1:N── Lesson
Course ──1:N── Enrollment ──N:1── User
Course ──1:N── Quiz ──1:N── Question
Quiz ──1:N── Attempt ──N:1── User
```

## Getting Started

## Course-generation jobs

The initial asynchronous job foundation is available under `/api/ai/generation-jobs/`.
Creating a job stores a draft; calling `POST /api/ai/generation-jobs/{id}/queue/`
dispatches it to Celery after the database transaction commits. PostgreSQL is the
authoritative source for status and event history.

The `generation-worker` and `celery-beat` Compose services use Redis as their broker.
Until the LangGraph workflow is implemented, queued jobs fail explicitly with
`WORKFLOW_NOT_CONFIGURED`. Set `GENERATION_WORKFLOW_RUNNER` to the dotted path of the
workflow entry point when that implementation is added.

### Prerequisites

- Python 3.12+
- Docker & Docker Compose (for containerized setup)
- PostgreSQL 16 (if running without Docker)

### Environment Variables

Copy the example env file and adjust values:

```bash
cp .env.example .env
```

| Variable               | Description                | Default              |
| ---------------------- | -------------------------- | -------------------- |
| `DJANGO_SECRET_KEY`    | Django secret key          | `change-me`          |
| `DJANGO_DEBUG`         | Enable debug mode          | `True`               |
| `DJANGO_ALLOWED_HOSTS` | Allowed host headers       | `localhost,127.0.0.1`|
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins       | `http://localhost:3000,http://localhost:5173` |
| `CSRF_TRUSTED_ORIGINS` | Trusted CSRF origins       | `http://localhost:3000,http://localhost:5173` |
| `POSTGRES_DB`          | Database name              | `otto_lms`           |
| `POSTGRES_USER`        | Database user              | `otto_user`          |
| `POSTGRES_PASSWORD`    | Database password          | `otto_password`      |
| `POSTGRES_HOST`        | Database host              | `db`                 |
| `POSTGRES_PORT`        | Database port              | `5432`               |

### Run with Docker

```bash
docker compose up --build
```

The API is available at `http://localhost:8000`. Migrations run automatically on startup.

### Run Locally (without Docker)

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Using PostgreSQL — set env vars or create a .env file
python manage.py migrate
python manage.py runserver

# Or use SQLite for quick testing
USE_SQLITE=True python manage.py migrate
USE_SQLITE=True python manage.py runserver
```

## REST API

| Method | Endpoint                            | Description              |
| ------ | ----------------------------------- | ------------------------ |
|        | **Users**                           |                          |
| GET    | `/users/`                           | List all users           |
| POST   | `/users/`                           | Create a user            |
| GET    | `/users/{id}/`                      | Retrieve a user          |
| PUT    | `/users/{id}/`                      | Update a user            |
| DELETE | `/users/{id}/`                      | Delete a user            |
|        | **Courses**                         |                          |
| GET    | `/courses/`                         | List all courses         |
| POST   | `/courses/`                         | Create a course          |
| GET    | `/courses/{id}/`                    | Retrieve a course        |
| PUT    | `/courses/{id}/`                    | Update a course          |
| DELETE | `/courses/{id}/`                    | Delete a course          |
| POST   | `/courses/{id}/enroll/`             | Enroll a student         |
| GET    | `/courses/modules/`                 | List all modules         |
| POST   | `/courses/modules/`                 | Create a module          |
| GET    | `/courses/modules/{id}/`            | Retrieve a module        |
| PUT    | `/courses/modules/{id}/`            | Update a module          |
| DELETE | `/courses/modules/{id}/`            | Delete a module          |
| GET    | `/courses/lessons/`                 | List all lessons         |
| POST   | `/courses/lessons/`                 | Create a lesson          |
| GET    | `/courses/lessons/{id}/`            | Retrieve a lesson        |
| PUT    | `/courses/lessons/{id}/`            | Update a lesson          |
| DELETE | `/courses/lessons/{id}/`            | Delete a lesson          |
| GET    | `/courses/enrollments/`             | List all enrollments     |
| POST   | `/courses/enrollments/`             | Create an enrollment     |
| GET    | `/courses/enrollments/{id}/`        | Retrieve an enrollment   |
| DELETE | `/courses/enrollments/{id}/`        | Delete an enrollment     |
|        | **Quizzes**                         |                          |
| GET    | `/quizzes/`                         | List all quizzes         |
| POST   | `/quizzes/`                         | Create a quiz            |
| GET    | `/quizzes/{id}/`                    | Retrieve a quiz          |
| PUT    | `/quizzes/{id}/`                    | Update a quiz            |
| DELETE | `/quizzes/{id}/`                    | Delete a quiz            |
| POST   | `/quizzes/{id}/attempts/`           | Submit a quiz attempt    |
| GET    | `/quizzes/questions/`               | List all questions       |
| POST   | `/quizzes/questions/`               | Create a question        |
| GET    | `/quizzes/questions/{id}/`          | Retrieve a question      |
| PUT    | `/quizzes/questions/{id}/`          | Update a question        |
| DELETE | `/quizzes/questions/{id}/`          | Delete a question        |
| GET    | `/quizzes/attempts/`                | List all attempts        |
| POST   | `/quizzes/attempts/`                | Create an attempt        |
| GET    | `/quizzes/attempts/{id}/`           | Retrieve an attempt      |
| DELETE | `/quizzes/attempts/{id}/`           | Delete an attempt        |
|        | **Dashboard**                       |                          |
| GET    | `/dashboard/orgs/`                  | List all organizations   |
| POST   | `/dashboard/orgs/`                  | Create an organization   |
| GET    | `/dashboard/orgs/{id}/`             | Retrieve an organization |
| PUT    | `/dashboard/orgs/{id}/`             | Update an organization   |
| DELETE | `/dashboard/orgs/{id}/`             | Delete an organization   |
| GET    | `/dashboard/tutors/`                | List all tutors          |
| POST   | `/dashboard/tutors/`                | Create a tutor           |
| GET    | `/dashboard/tutors/{id}/`           | Retrieve a tutor         |
| PUT    | `/dashboard/tutors/{id}/`           | Update a tutor           |
| DELETE | `/dashboard/tutors/{id}/`           | Delete a tutor           |

### Example: Enroll a student

```http
POST /courses/{course_id}/enroll/
Content-Type: application/json

{
  "student": "student-uuid"
}
```

### Example: Create a module

```http
POST /courses/modules/
Content-Type: application/json

{
  "course": "course-uuid",
  "title": "Module 1",
  "description": "Getting started",
  "order": 1
}
```

### Example: Create a lesson in a module

```http
POST /courses/lessons/
Content-Type: application/json

{
  "module": "module-uuid",
  "title": "Intro lesson",
  "content": "Lesson body",
  "length": "00:15:00"
}
```

### Example: Submit a quiz attempt

```http
POST /quizzes/{quiz_id}/attempts/
Content-Type: application/json

{
  "student": "student-uuid",
  "score": 88.5
}
```

## GraphQL API

Endpoint: `/graphql/`

### Queries

| Query                     | Description                  |
| ------------------------- | ---------------------------- |
| `students`                | List all students            |
| `student(id)`             | Get a student by ID          |
| `studentByEmail(email)`   | Get a student by email       |
| `courses`                 | List all courses (w/ lessons & enrollments) |
| `course(id)`              | Get a course by ID           |
| `modules`                 | List all modules             |
| `lessons`                 | List all lessons             |
| `enrollments`             | List all enrollments         |
| `studentEnrollments(id)`  | List a student's enrollments |
| `quizzes`                 | List all quizzes (w/ questions & attempts) |
| `quiz(id)`                | Get a quiz by ID             |
| `questions`               | List all questions           |
| `attempts`                | List all attempts            |
| `studentAttempts(id)`     | List a student's attempts    |
| `orgs`                    | List all organizations (w/ tutors) |
| `tutors`                  | List all tutors (w/ org)     |

### Mutations

| Mutation              | Description               |
| --------------------- | ------------------------- |
| `registerStudent`     | Create a new student      |
| `updateStudent`       | Update student details    |
| `deleteStudent`       | Delete a student          |
| `createCourse`        | Create a new course       |
| `updateCourse`        | Update course details     |
| `deleteCourse`        | Delete a course           |
| `createModule`        | Create a course module    |
| `updateModule`        | Update module details     |
| `deleteModule`        | Delete a module           |
| `createLesson`        | Create a new lesson       |
| `updateLesson`        | Update lesson details     |
| `deleteLesson`        | Delete a lesson           |
| `enrollStudent`       | Enroll student in course  |
| `createQuiz`          | Create a new quiz         |
| `updateQuiz`          | Update quiz details       |
| `deleteQuiz`          | Delete a quiz             |
| `createQuestion`      | Create a question         |
| `updateQuestion`      | Update question details   |
| `deleteQuestion`      | Delete a question         |
| `submitQuizAttempt`   | Submit a quiz attempt     |
| `createOrg`           | Create an organization    |
| `updateOrg`           | Update organization       |
| `deleteOrg`           | Delete an organization    |
| `createTutor`         | Create a tutor            |
| `updateTutor`         | Update tutor details      |
| `deleteTutor`         | Delete a tutor            |

### Example: Query courses with nested data

```graphql
query {
  courses {
    id
    name
    modules {
      title
      lessons {
        title
      }
    }
    enrollments {
      student {
        name
        email
      }
    }
  }
}
```

### Example: Create a module and lesson

```graphql
mutation {
  createModule(
    courseId: "course-uuid"
    title: "Module 1"
    description: "Getting started"
    order: 1
  ) {
    id
    title
  }
}
```

```graphql
mutation {
  createLesson(
    moduleId: "module-uuid"
    title: "Intro lesson"
    content: "Lesson body"
    length: "00:15:00"
  ) {
    id
    title
    module {
      id
      title
    }
  }
}
```

### Example: Register a student

```graphql
mutation {
  registerStudent(
    name: "Ada Student"
    email: "ada@example.com"
    password: "password123"
  ) {
    id
    name
    email
  }
}
```

### Example: Enroll a student in a course

```graphql
mutation {
  enrollStudent(studentId: "1", courseId: "1") {
    id
    student {
      email
    }
    course {
      name
    }
  }
}
```

### Example: Submit a quiz attempt

```graphql
mutation {
  submitQuizAttempt(studentId: "1", quizId: "1", score: 88.5) {
    score
    student {
      email
    }
  }
}
```

## Testing

Run tests with SQLite (no PostgreSQL required):

```bash
USE_SQLITE=True python manage.py test
```

## Health Check

```bash
curl http://localhost:8000/health/
```

Returns a `200 OK` response when the server is running.
