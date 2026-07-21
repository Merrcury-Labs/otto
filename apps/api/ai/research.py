import re
from datetime import date

from pydantic import BaseModel, Field, HttpUrl, model_validator


class PlannedResearchQuestion(BaseModel):
    query: str = Field(min_length=8, max_length=500)
    rationale: str = Field(min_length=5, max_length=1000)
    priority: int = Field(ge=1, le=10)


class ProviderSource(BaseModel):
    provider_key: str = Field(min_length=3, max_length=1000)
    type: str = Field(pattern=r'^(DOCUMENT|WEB|DATABASE)$')
    title: str = Field(min_length=3, max_length=500)
    url: HttpUrl | None = None
    publisher: str = Field(default='', max_length=255)
    authors: list[str] = Field(default_factory=list)
    published_at: date | None = None
    reliability_score: float = Field(ge=0, le=1)
    metadata: dict = Field(default_factory=dict)

    @model_validator(mode='after')
    def require_url_for_web_source(self):
        if self.type == 'WEB' and self.url is None:
            raise ValueError('Web research sources require a URL.')
        return self


class ProviderFinding(BaseModel):
    question_query: str
    source_key: str
    claim: str = Field(min_length=10)
    evidence: str = Field(min_length=10)
    confidence: float = Field(ge=0, le=1)
    source_locator: dict = Field(default_factory=dict)


class ResearchProviderResult(BaseModel):
    sources: list[ProviderSource] = Field(default_factory=list)
    findings: list[ProviderFinding] = Field(default_factory=list)

    @model_validator(mode='after')
    def validate_references(self):
        source_keys = {source.provider_key for source in self.sources}
        unknown = {finding.source_key for finding in self.findings} - source_keys
        if unknown:
            raise ValueError(f'Findings reference unknown sources: {sorted(unknown)}')
        return self


def heuristic_research_planner(*, brief, documents):
    topic = str(brief.get('topic') or brief.get('title') or '').strip() or 'the course topic'
    audience = str(brief.get('audience') or '').strip() or 'the target learners'
    return [
        {
            'query': f'What foundational concepts and terminology define {topic}?',
            'rationale': 'Establish accurate prerequisite knowledge and core vocabulary.',
            'priority': 1,
        },
        {
            'query': f'What misconceptions do {audience} commonly have about {topic}?',
            'rationale': 'Design explanations and assessments that address predictable errors.',
            'priority': 2,
        },
        {
            'query': f'What practical examples and applications best teach {topic}?',
            'rationale': 'Connect concepts to authentic practice and improve transfer.',
            'priority': 3,
        },
    ]


def document_research_provider(*, questions, brief, documents):
    """Search uploaded chunks locally; configure COURSE_RESEARCH_PROVIDER for web research."""
    sources = {}
    findings = []
    for question in questions:
        terms = {
            term.casefold()
            for term in re.findall(r'[A-Za-z0-9]{4,}', question['query'])
            if term.casefold() not in {'what', 'that', 'with', 'about', 'have'}
        }
        ranked = sorted(
            documents,
            key=lambda document: sum(
                document['content'].casefold().count(term) for term in terms
            ),
            reverse=True,
        )
        for document in ranked[:3]:
            if terms and not any(term in document['content'].casefold() for term in terms):
                continue
            source_key = f"document:{document['document_id']}"
            sources[source_key] = {
                'provider_key': source_key,
                'type': 'DOCUMENT',
                'title': document['filename'],
                'publisher': '',
                'authors': [],
                'published_at': None,
                'reliability_score': 0.7,
                'metadata': {'document_id': document['document_id']},
            }
            excerpt = document['content'][:1200]
            findings.append(
                {
                    'question_query': question['query'],
                    'source_key': source_key,
                    'claim': excerpt[:500],
                    'evidence': excerpt,
                    'confidence': 0.7,
                    'source_locator': {
                        'chunk_id': document['chunk_id'],
                        'page_number': document['page_number'],
                        'heading': document['heading'],
                    },
                }
            )
    return {'sources': list(sources.values()), 'findings': findings}
