import json
import time
from decimal import Decimal

from django.conf import settings
from django.core.cache import cache
from django.db.models import Sum
from openai import OpenAI

from .blueprints import CurriculumBlueprint
from .models import AIUsageRecord, GenerationJob
from .packages import GeneratedCoursePackage
from .research import ResearchProviderResult


class AIProviderNotConfigured(RuntimeError):
    pass


class AIBudgetExceeded(RuntimeError):
    pass


class AIRateLimitExceeded(RuntimeError):
    pass


def _enforce_rate_limit():
    limit = settings.AI_REQUESTS_PER_MINUTE
    if limit <= 0:
        return
    bucket = int(time.time() // 60)
    key = f'ai-rate:{settings.AI_PROVIDER}:{settings.AI_MODEL}:{bucket}'
    cache.add(key, 0, timeout=65)
    if cache.incr(key) > limit:
        raise AIRateLimitExceeded('The configured AI provider request rate has been exceeded.')


def _client():
    if not settings.AI_API_KEY:
        raise AIProviderNotConfigured('AI_API_KEY is required for the configured AI provider.')
    return OpenAI(
        api_key=settings.AI_API_KEY,
        base_url=settings.AI_BASE_URL or None,
        timeout=settings.AI_REQUEST_TIMEOUT_SECONDS,
        max_retries=2,
    )


def _budgeted_max_output(job_id, prompt):
    job = GenerationJob.objects.get(pk=job_id)
    used = job.ai_usage_records.filter(success=True).aggregate(total=Sum('total_tokens'))['total'] or 0
    estimated_input = max(1, len(prompt) // 4)
    remaining = job.max_ai_tokens - used - estimated_input
    if remaining <= 0:
        raise AIBudgetExceeded('The generation job has exhausted its AI token budget.')
    max_output = min(settings.AI_MAX_OUTPUT_TOKENS, remaining)

    if job.max_ai_cost_usd is not None:
        spent = job.ai_usage_records.filter(success=True).aggregate(
            total=Sum('estimated_cost_usd')
        )['total'] or Decimal('0')
        input_rate = Decimal(str(settings.AI_INPUT_COST_PER_MILLION))
        output_rate = Decimal(str(settings.AI_OUTPUT_COST_PER_MILLION))
        projected = (
            Decimal(estimated_input) * input_rate + Decimal(max_output) * output_rate
        ) / Decimal(1_000_000)
        if spent + projected > job.max_ai_cost_usd:
            raise AIBudgetExceeded('The generation job would exceed its configured AI cost budget.')
    return max_output


def _cost(input_tokens, output_tokens):
    input_rate = Decimal(str(settings.AI_INPUT_COST_PER_MILLION))
    output_rate = Decimal(str(settings.AI_OUTPUT_COST_PER_MILLION))
    return (
        Decimal(input_tokens) * input_rate + Decimal(output_tokens) * output_rate
    ) / Decimal(1_000_000)


def _record_usage(
    *, job_id, operation, started, success, request_id='', input_tokens=0,
    output_tokens=0, error_code='', metadata=None
):
    AIUsageRecord.objects.create(
        job_id=job_id,
        operation=operation,
        provider=settings.AI_PROVIDER,
        model=settings.AI_MODEL,
        request_id=request_id or '',
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        total_tokens=input_tokens + output_tokens,
        estimated_cost_usd=_cost(input_tokens, output_tokens),
        latency_ms=max(0, int((time.monotonic() - started) * 1000)),
        success=success,
        error_code=error_code,
        metadata=metadata or {},
    )


def _response_format(schema_model, name):
    if settings.AI_STRUCTURED_OUTPUT_MODE == 'json_object':
        return {'type': 'json_object'}
    return {
        'type': 'json_schema',
        'json_schema': {
            'name': name,
            'strict': True,
            'schema': schema_model.model_json_schema(),
        },
    }


def structured_chat_completion(*, job_id, operation, schema_model, system_prompt, payload):
    user_prompt = json.dumps(payload, ensure_ascii=False, default=str)
    prompt = f'{system_prompt}\n\nINPUT:\n{user_prompt}'
    if len(prompt) > settings.AI_MAX_CONTEXT_CHARACTERS:
        raise ValueError('The AI prompt exceeds AI_MAX_CONTEXT_CHARACTERS.')
    max_output = _budgeted_max_output(job_id, prompt)
    _enforce_rate_limit()
    started = time.monotonic()
    try:
        response = _client().chat.completions.create(
            model=settings.AI_MODEL,
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_prompt},
            ],
            response_format=_response_format(schema_model, operation),
            max_tokens=max_output,
        )
        content = response.choices[0].message.content
        if not content:
            raise ValueError('The AI provider returned an empty structured response.')
        parsed = schema_model.model_validate_json(content)
        usage = response.usage
        input_tokens = getattr(usage, 'prompt_tokens', 0) or 0
        output_tokens = getattr(usage, 'completion_tokens', 0) or 0
        _record_usage(
            job_id=job_id,
            operation=operation,
            started=started,
            success=True,
            request_id=getattr(response, 'id', ''),
            input_tokens=input_tokens,
            output_tokens=output_tokens,
        )
        return parsed.model_dump(mode='json')
    except Exception as exc:
        _record_usage(
            job_id=job_id,
            operation=operation,
            started=started,
            success=False,
            error_code=exc.__class__.__name__,
        )
        raise


def llm_blueprint_generator(
    *, job_id, brief, sources, research=None, feedback='', previous_blueprint=None
):
    return structured_chat_completion(
        job_id=job_id,
        operation='curriculum_blueprint',
        schema_model=CurriculumBlueprint,
        system_prompt=(
            'You are an expert curriculum architect. Produce only a curriculum blueprint '
            'matching the supplied schema. Align every objective to lessons and assessments. '
            'Use source chunk IDs exactly as supplied; never invent citations.'
        ),
        payload={
            'brief': brief,
            'document_sources': sources,
            'validated_research': research or [],
            'revision_feedback': feedback,
            'previous_blueprint': previous_blueprint,
        },
    )


def llm_course_package_generator(
    *, job_id, blueprint, sources, research=None, feedback='', previous_package=None
):
    return structured_chat_completion(
        job_id=job_id,
        operation='course_package',
        schema_model=GeneratedCoursePackage,
        system_prompt=(
            'You are an expert course author and assessment designer. Produce a complete course '
            'package matching the supplied schema. Preserve objective alignment, create clear '
            'lesson content, unambiguous questions, and atomic flashcards. Use only supplied '
            'source chunk IDs and do not invent citations.'
        ),
        payload={
            'approved_blueprint': blueprint,
            'document_sources': sources,
            'validated_research': research or [],
            'revision_feedback': feedback,
            'previous_package': previous_package,
        },
    )


def _citation_urls(response):
    urls = set()

    def visit(value):
        if isinstance(value, dict):
            if value.get('type') == 'url_citation' and value.get('url'):
                urls.add(value['url'])
            for child in value.values():
                visit(child)
        elif isinstance(value, list):
            for child in value:
                visit(child)

    visit(response.model_dump(mode='json'))
    return urls


def openai_web_research_provider(*, job_id, questions, brief, documents):
    payload = {'course_brief': brief, 'research_questions': questions}
    prompt = (
        'Research each question using authoritative primary sources. Return JSON matching the '
        'schema. Each web source URL must be a URL cited by the web search tool. Include concise '
        'claims and supporting evidence; do not use uploaded documents as web sources.\n\n'
        + json.dumps(payload, ensure_ascii=False)
    )
    max_output = _budgeted_max_output(job_id, prompt)
    _enforce_rate_limit()
    started = time.monotonic()
    try:
        response = _client().responses.create(
            model=settings.AI_MODEL,
            tools=[{'type': 'web_search'}],
            input=prompt,
            text={
                'format': {
                    'type': 'json_schema',
                    'name': 'course_research',
                    'strict': True,
                    'schema': ResearchProviderResult.model_json_schema(),
                }
            },
            max_output_tokens=max_output,
        )
        result = ResearchProviderResult.model_validate_json(response.output_text)
        cited_urls = _citation_urls(response)
        returned_urls = {str(source.url) for source in result.sources if source.type == 'WEB'}
        uncited = returned_urls - cited_urls
        if uncited:
            raise ValueError(f'Web research returned uncited URLs: {sorted(uncited)}')
        usage = response.usage
        input_tokens = getattr(usage, 'input_tokens', 0) or 0
        output_tokens = getattr(usage, 'output_tokens', 0) or 0
        _record_usage(
            job_id=job_id,
            operation='web_research',
            started=started,
            success=True,
            request_id=getattr(response, 'id', ''),
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            metadata={'cited_url_count': len(cited_urls)},
        )
        return result.model_dump(mode='json')
    except Exception as exc:
        _record_usage(
            job_id=job_id,
            operation='web_research',
            started=started,
            success=False,
            error_code=exc.__class__.__name__,
        )
        raise
