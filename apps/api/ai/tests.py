from datetime import timedelta
from io import BytesIO
from tempfile import TemporaryDirectory
from unittest.mock import Mock, patch

from django.core.files.base import ContentFile
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient
from docx import Document as DocxDocument

from dashboard.models import Org, Tutor
from users.models import User

from .models import GenerationJob, SourceDocument
from .services import queue_generation_job
from .tasks import extract_source_document, recover_stalled_jobs, start_generation_job


class GenerationJobTestCase(TestCase):
    def setUp(self):
        self.media_directory = TemporaryDirectory()
        self.media_override = override_settings(MEDIA_ROOT=self.media_directory.name)
        self.media_override.enable()
        self.addCleanup(self.media_override.disable)
        self.addCleanup(self.media_directory.cleanup)
        self.organization = Org.objects.create(name='Acme Learning')
        self.tutor = Tutor.objects.create(
            name='Tutor', email='tutor@example.com', org=self.organization
        )
        self.user = User.objects.create(
            name='Requester', email='user@example.com', userID='requester-1'
        )
        self.client = APIClient()

    def job_payload(self):
        return {
            'organization': str(self.organization.id),
            'tutor': str(self.tutor.id),
            'requested_by': str(self.user.id),
            'course_brief': {
                'topic': 'Introduction to astronomy',
                'audience': 'secondary school learners',
            },
        }

    def create_job(self, **overrides):
        values = {
            'organization': self.organization,
            'tutor': self.tutor,
            'requested_by': self.user,
            'course_brief': {'topic': 'Astronomy'},
        }
        values.update(overrides)
        return GenerationJob.objects.create(**values)

    def test_create_job_records_draft_and_event(self):
        response = self.client.post(
            reverse('ai:generation-job-list'), self.job_payload(), format='json'
        )

        self.assertEqual(response.status_code, 201)
        job = GenerationJob.objects.get(pk=response.data['id'])
        self.assertEqual(job.status, GenerationJob.Status.DRAFT)
        self.assertEqual(job.events.get().event_type, 'CREATED')

    def test_tutor_must_belong_to_organization(self):
        other_org = Org.objects.create(name='Other Org')
        payload = self.job_payload()
        payload['organization'] = str(other_org.id)

        response = self.client.post(
            reverse('ai:generation-job-list'), payload, format='json'
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('tutor', response.data)

    def test_queue_is_committed_before_dispatch(self):
        job = self.create_job()
        async_result = Mock(id='celery-task-123')
        dispatcher = Mock(return_value=async_result)

        with self.captureOnCommitCallbacks(execute=True):
            queue_generation_job(job, dispatcher)

        job.refresh_from_db()
        dispatcher.assert_called_once_with(str(job.id))
        self.assertEqual(job.status, GenerationJob.Status.QUEUED)
        self.assertEqual(job.celery_task_id, 'celery-task-123')
        self.assertTrue(job.events.filter(event_type='QUEUED').exists())

    def test_cancel_is_idempotently_rejected_for_terminal_job(self):
        job = self.create_job(status=GenerationJob.Status.COMPLETED)

        response = self.client.post(
            reverse('ai:generation-job-cancel', args=(job.id,)), {}, format='json'
        )

        self.assertEqual(response.status_code, 409)
        job.refresh_from_db()
        self.assertEqual(job.status, GenerationJob.Status.COMPLETED)

    @override_settings(GENERATION_WORKFLOW_RUNNER='')
    def test_worker_fails_clearly_without_langgraph_runner(self):
        job = self.create_job(status=GenerationJob.Status.QUEUED)

        result = start_generation_job.apply(args=(str(job.id),)).get()

        job.refresh_from_db()
        self.assertEqual(result['status'], GenerationJob.Status.FAILED)
        self.assertEqual(job.error_code, 'WORKFLOW_NOT_CONFIGURED')
        self.assertEqual(job.attempt_count, 1)

    @override_settings(GENERATION_JOB_STALE_AFTER_SECONDS=60)
    @patch('ai.tasks.start_generation_job.delay')
    def test_recovery_requeues_stalled_active_job(self, delay):
        job = self.create_job(
            status=GenerationJob.Status.RESEARCHING,
            heartbeat_at=timezone.now() - timedelta(minutes=5),
            attempt_count=1,
            max_attempts=3,
        )

        result = recover_stalled_jobs.run()

        job.refresh_from_db()
        self.assertEqual(result, {'recovered': 1})
        self.assertEqual(job.status, GenerationJob.Status.QUEUED)
        delay.assert_called_once_with(str(job.id))

    @patch('ai.views.extract_source_document.delay')
    def test_upload_document_queues_extraction_after_commit(self, delay):
        job = self.create_job()
        delay.return_value = Mock(id='extract-task-1')
        upload = SimpleUploadedFile(
            'notes.md', b'# Stars\n\nStars produce energy through nuclear fusion.',
            content_type='text/markdown',
        )

        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.post(
                reverse('ai:generation-job-documents', args=(job.id,)),
                {'file': upload},
                format='multipart',
            )

        self.assertEqual(response.status_code, 202)
        document = SourceDocument.objects.get(pk=response.data['id'])
        self.assertEqual(document.status, SourceDocument.Status.UPLOADED)
        self.assertEqual(document.extraction_task_id, 'extract-task-1')
        self.assertEqual(len(document.sha256), 64)
        delay.assert_called_once_with(str(document.id))

    def test_upload_rejects_unsupported_file(self):
        job = self.create_job()
        upload = SimpleUploadedFile(
            'archive.zip', b'not-a-zip', content_type='application/zip'
        )

        response = self.client.post(
            reverse('ai:generation-job-documents', args=(job.id,)),
            {'file': upload},
            format='multipart',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('file', response.data)

    def test_extract_text_document_creates_provenance_chunks(self):
        job = self.create_job()
        document = SourceDocument(
            job=job,
            original_filename='lesson.txt',
            content_type='text/plain',
            file_size=80,
            sha256='a' * 64,
        )
        document.file.save(
            'lesson.txt',
            ContentFile(
                b'Gravity attracts objects with mass.\n\nOrbits result from gravity and motion.'
            ),
            save=True,
        )

        result = extract_source_document.apply(args=(str(document.id),)).get()

        document.refresh_from_db()
        self.assertEqual(result['status'], SourceDocument.Status.READY)
        self.assertEqual(document.status, SourceDocument.Status.READY)
        self.assertGreater(document.character_count, 0)
        chunk = document.chunks.get(position=0)
        self.assertIn('Gravity', chunk.content)
        self.assertEqual(len(chunk.content_hash), 64)
        self.assertTrue(job.events.filter(event_type='DOCUMENT_READY').exists())

    def test_extract_docx_preserves_heading(self):
        job = self.create_job()
        payload = BytesIO()
        docx = DocxDocument()
        docx.add_heading('Learning about stars', level=1)
        docx.add_paragraph('A star is a luminous sphere of plasma held together by gravity.')
        docx.save(payload)
        data = payload.getvalue()
        document = SourceDocument(
            job=job,
            original_filename='stars.docx',
            content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            file_size=len(data),
            sha256='c' * 64,
        )
        document.file.save('stars.docx', ContentFile(data), save=True)

        extract_source_document.apply(args=(str(document.id),)).get()

        chunk = document.chunks.get(position=0)
        self.assertEqual(chunk.heading, 'Learning about stars')
        self.assertIn('luminous sphere', chunk.content)

    def test_queue_rejects_unprocessed_documents(self):
        job = self.create_job()
        SourceDocument.objects.create(
            job=job,
            file='pending.txt',
            original_filename='pending.txt',
            content_type='text/plain',
            file_size=10,
            sha256='b' * 64,
        )

        with self.assertRaisesMessage(ValueError, 'must finish processing'):
            queue_generation_job(job, Mock())

# Create your tests here.
