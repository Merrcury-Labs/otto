def heuristic_blueprint_generator(*, brief, sources, feedback='', previous_blueprint=None):
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
