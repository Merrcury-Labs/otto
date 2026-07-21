def heuristic_blueprint_generator(
    *, brief, sources, research=None, feedback='', previous_blueprint=None
):
    """Initial provider-free generator; replace through CURRICULUM_BLUEPRINT_GENERATOR."""
    topic = str(brief.get('topic') or brief.get('title') or '').strip() or 'Untitled course'
    audience = str(brief.get('audience') or '').strip() or 'general learners'
    level = str(brief.get('level') or '').strip() or 'beginner'
    prerequisites = brief.get('prerequisites') or []
    if isinstance(prerequisites, str):
        prerequisites = [prerequisites] if prerequisites.strip() else []
    objective = f'Explain the foundational concepts and terminology of {topic}.'
    source_ids = [source['chunk_id'] for source in sources[:8]]
    return {
        'title': topic[:100],
        'description': f'A structured introduction to {topic} for {audience}.',
        'audience': audience,
        'level': level,
        'prerequisites': prerequisites,
        'objectives': [
            {'id': 'LO-1', 'description': objective, 'bloom_level': 'understand'}
        ],
        'modules': [
            {
                'title': f'{topic} foundations'[:100],
                'description': f'Core ideas learners need before applying {topic}.',
                'lessons': [
                    {
                        'title': f'Introduction to {topic}'[:100],
                        'objective_ids': ['LO-1'],
                        'topics': [topic],
                        'estimated_minutes': int(brief.get('lesson_minutes') or 30),
                        'source_chunk_ids': source_ids,
                    }
                ],
            }
        ],
        'quizzes': [
            {
                'title': f'{topic} knowledge check'[:100],
                'objective_ids': ['LO-1'],
                'question_count': int(brief.get('quiz_questions') or 5),
                'question_types': ['MCQ', 'TF'],
                'passing_score': float(brief.get('passing_score') or 70),
            }
        ],
        'flashcard_decks': [
            {
                'title': f'{topic} key concepts'[:100],
                'objective_ids': ['LO-1'],
                'card_count': int(brief.get('flashcard_count') or 10),
            }
        ],
    }


def heuristic_course_package_generator(
    *, blueprint, sources, research=None, feedback='', previous_package=None
):
    """Provider-free package generator used until an LLM-backed callable is configured."""
    source_by_id = {source['chunk_id']: source for source in sources}
    modules = []
    for module in blueprint['modules']:
        lessons = []
        for lesson in module['lessons']:
            excerpts = [
                source_by_id[chunk_id]['content'][:1200]
                for chunk_id in lesson.get('source_chunk_ids', [])
                if chunk_id in source_by_id
            ]
            source_section = '\n\n'.join(excerpts)
            body = (
                f"## {lesson['title']}\n\n"
                f"This lesson introduces {', '.join(lesson['topics'])}. "
                f"It is designed to meet {', '.join(lesson['objective_ids'])}.\n\n"
                "### Key ideas\n\n"
                f"Learners explore the essential terminology, relationships, and practical context of {lesson['title']}."
            )
            if source_section:
                body += f"\n\n### Source notes\n\n{source_section}"
            lessons.append(
                {
                    'title': lesson['title'],
                    'objective_ids': lesson['objective_ids'],
                    'content': body,
                    'estimated_minutes': lesson['estimated_minutes'],
                    'notes': 'Initial generated draft; tutor review required.',
                    'source_chunk_ids': lesson.get('source_chunk_ids', []),
                }
            )
        modules.append({**module, 'lessons': lessons})

    objective_by_id = {item['id']: item for item in blueprint['objectives']}
    quizzes = []
    for quiz in blueprint.get('quizzes', []):
        questions = []
        for index in range(quiz['question_count']):
            objective_id = quiz['objective_ids'][index % len(quiz['objective_ids'])]
            description = objective_by_id[objective_id]['description']
            questions.append(
                {
                    'objective_id': objective_id,
                    'text': f'Which statement best reflects this objective: {description}',
                    'type': 'MCQ',
                    'options': [description, 'The concept has no practical application.', 'None of these ideas are related.'],
                    'correct_option': 0,
                    'points': 1,
                    'hint': f'Review {objective_id}.',
                    'categories': {},
                }
            )
        quizzes.append(
            {
                'title': quiz['title'],
                'description': 'A draft knowledge check aligned to the course objectives.',
                'passing_score': quiz['passing_score'],
                'questions': questions,
            }
        )

    decks = []
    for deck in blueprint.get('flashcard_decks', []):
        cards = []
        for index in range(deck['card_count']):
            objective_id = deck['objective_ids'][index % len(deck['objective_ids'])]
            description = objective_by_id[objective_id]['description']
            cards.append(
                {
                    'objective_id': objective_id,
                    'front': f'What should you be able to do for {objective_id}?',
                    'back': description,
                    'hint': 'Recall the matching learning objective.',
                    'tags': [objective_id, blueprint['title']],
                }
            )
        decks.append(
            {
                'title': deck['title'],
                'description': 'Key concepts for spaced review.',
                'cards': cards,
            }
        )

    return {
        'title': blueprint['title'],
        'description': blueprint['description'],
        'level': blueprint['level'],
        'category': 'General',
        'prerequisites': blueprint.get('prerequisites', []),
        'modules': modules,
        'quizzes': quizzes,
        'flashcard_decks': decks,
    }
