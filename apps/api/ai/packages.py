from typing import Any, Literal

from pydantic import BaseModel, Field, model_validator


QuestionType = Literal['MCQ', 'TF', 'REORDER', 'CATEGORIZE']


class GeneratedLesson(BaseModel):
    title: str = Field(min_length=3, max_length=100)
    objective_ids: list[str] = Field(min_length=1)
    content: str = Field(min_length=40)
    estimated_minutes: int = Field(ge=5, le=240)
    notes: str = ''
    source_chunk_ids: list[str] = Field(default_factory=list)


class GeneratedModule(BaseModel):
    title: str = Field(min_length=3, max_length=100)
    description: str = Field(min_length=10)
    lessons: list[GeneratedLesson] = Field(min_length=1)


class GeneratedQuestion(BaseModel):
    objective_id: str
    text: str = Field(min_length=10)
    type: QuestionType
    options: Any
    correct_option: Any
    points: int = Field(default=1, ge=1, le=100)
    hint: str = ''
    categories: dict = Field(default_factory=dict)

    @model_validator(mode='after')
    def validate_answer_shape(self):
        if self.type == 'MCQ':
            if not isinstance(self.options, list) or len(self.options) < 2:
                raise ValueError('MCQ questions require at least two options.')
            if isinstance(self.correct_option, int):
                if not 0 <= self.correct_option < len(self.options):
                    raise ValueError('MCQ correct option index is out of range.')
            elif self.correct_option not in self.options:
                raise ValueError('MCQ correct option must identify an available option.')
        elif self.type == 'TF':
            normalized = str(self.correct_option).lower()
            if normalized not in {'true', 'false', '0', '1'}:
                raise ValueError('True/false answers must be true or false.')
        elif self.type == 'REORDER':
            if not isinstance(self.options, list) or len(self.options) < 2:
                raise ValueError('Reorder questions require an option list.')
            if not isinstance(self.correct_option, list) or len(self.correct_option) != len(self.options):
                raise ValueError('Reorder answers must contain every option.')
        elif self.type == 'CATEGORIZE':
            if not isinstance(self.options, dict) or not isinstance(self.correct_option, dict):
                raise ValueError('Categorize questions require object options and answers.')
            items = self.options.get('items', [])
            categories = self.options.get('categories', [])
            if set(self.correct_option) != set(items):
                raise ValueError('Every categorize item must have an answer.')
            if any(category not in categories for category in self.correct_option.values()):
                raise ValueError('Categorize answers must use available categories.')
        return self


class GeneratedQuiz(BaseModel):
    title: str = Field(min_length=3, max_length=100)
    description: str = ''
    passing_score: float = Field(ge=0, le=100)
    questions: list[GeneratedQuestion] = Field(min_length=1)


class GeneratedFlashcard(BaseModel):
    objective_id: str
    front: str = Field(min_length=3)
    back: str = Field(min_length=3)
    hint: str = ''
    tags: list[str] = Field(default_factory=list)


class GeneratedFlashcardDeck(BaseModel):
    title: str = Field(min_length=3, max_length=100)
    description: str = ''
    cards: list[GeneratedFlashcard] = Field(min_length=1)


class GeneratedCoursePackage(BaseModel):
    title: str = Field(min_length=3, max_length=100)
    description: str = Field(min_length=20)
    level: str = Field(min_length=2, max_length=50)
    category: str = Field(min_length=2, max_length=50)
    prerequisites: list[str] = Field(default_factory=list)
    modules: list[GeneratedModule] = Field(min_length=1)
    quizzes: list[GeneratedQuiz] = Field(default_factory=list)
    flashcard_decks: list[GeneratedFlashcardDeck] = Field(default_factory=list)

    @model_validator(mode='after')
    def validate_unique_module_titles(self):
        normalized = [module.title.casefold() for module in self.modules]
        if len(normalized) != len(set(normalized)):
            raise ValueError('Module titles must be unique within a course.')
        return self

    def validate_against_blueprint(self, blueprint):
        valid_objectives = {objective['id'] for objective in blueprint['objectives']}
        taught = {
            objective_id
            for module in self.modules
            for lesson in module.lessons
            for objective_id in lesson.objective_ids
        }
        assessed = {
            question.objective_id for quiz in self.quizzes for question in quiz.questions
        }
        reinforced = {
            card.objective_id for deck in self.flashcard_decks for card in deck.cards
        }
        referenced = taught | assessed | reinforced
        unknown = referenced - valid_objectives
        if unknown:
            raise ValueError(f'Package references unknown objectives: {sorted(unknown)}')
        if valid_objectives - taught:
            raise ValueError(f'Objectives missing lesson coverage: {sorted(valid_objectives - taught)}')
        if self.quizzes and valid_objectives - assessed:
            raise ValueError(f'Objectives missing assessment coverage: {sorted(valid_objectives - assessed)}')
        if self.flashcard_decks and valid_objectives - reinforced:
            raise ValueError(f'Objectives missing flashcard coverage: {sorted(valid_objectives - reinforced)}')
        return self
