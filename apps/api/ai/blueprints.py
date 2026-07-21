from typing import Literal

from pydantic import BaseModel, Field, model_validator


BloomLevel = Literal['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create']
QuestionType = Literal['MCQ', 'TF', 'REORDER', 'CATEGORIZE']


class LearningObjective(BaseModel):
    id: str = Field(pattern=r'^LO-[1-9][0-9]*$')
    description: str = Field(min_length=10, max_length=500)
    bloom_level: BloomLevel


class LessonBlueprint(BaseModel):
    title: str = Field(min_length=3, max_length=100)
    objective_ids: list[str] = Field(min_length=1)
    topics: list[str] = Field(min_length=1)
    estimated_minutes: int = Field(ge=5, le=240)
    source_chunk_ids: list[str] = Field(default_factory=list)


class ModuleBlueprint(BaseModel):
    title: str = Field(min_length=3, max_length=100)
    description: str = Field(min_length=10)
    lessons: list[LessonBlueprint] = Field(min_length=1)


class QuizBlueprint(BaseModel):
    title: str = Field(min_length=3, max_length=100)
    objective_ids: list[str] = Field(min_length=1)
    question_count: int = Field(ge=1, le=100)
    question_types: list[QuestionType] = Field(min_length=1)
    passing_score: float = Field(ge=0, le=100)


class FlashcardDeckBlueprint(BaseModel):
    title: str = Field(min_length=3, max_length=100)
    objective_ids: list[str] = Field(min_length=1)
    card_count: int = Field(ge=1, le=200)


class CurriculumBlueprint(BaseModel):
    title: str = Field(min_length=3, max_length=100)
    description: str = Field(min_length=20)
    audience: str = Field(min_length=3)
    level: str = Field(min_length=2, max_length=50)
    prerequisites: list[str] = Field(default_factory=list)
    objectives: list[LearningObjective] = Field(min_length=1)
    modules: list[ModuleBlueprint] = Field(min_length=1)
    quizzes: list[QuizBlueprint] = Field(default_factory=list)
    flashcard_decks: list[FlashcardDeckBlueprint] = Field(default_factory=list)

    @model_validator(mode='after')
    def validate_alignment(self):
        objective_ids = [objective.id for objective in self.objectives]
        if len(objective_ids) != len(set(objective_ids)):
            raise ValueError('Learning objective IDs must be unique.')
        valid_ids = set(objective_ids)
        referenced_ids = set()
        for module in self.modules:
            for lesson in module.lessons:
                referenced_ids.update(lesson.objective_ids)
        for assessment in [*self.quizzes, *self.flashcard_decks]:
            referenced_ids.update(assessment.objective_ids)
        unknown = referenced_ids - valid_ids
        if unknown:
            raise ValueError(f'Unknown objective IDs referenced: {sorted(unknown)}')
        untaught = valid_ids - {
            objective_id
            for module in self.modules
            for lesson in module.lessons
            for objective_id in lesson.objective_ids
        }
        if untaught:
            raise ValueError(f'Objectives not taught by any lesson: {sorted(untaught)}')
        return self
