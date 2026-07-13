from django.urls import path

from .views import FlashcardDeckViewSet, FlashcardProgressViewSet, FlashcardViewSet

app_name = 'flashcards'

deck_list = FlashcardDeckViewSet.as_view({'get': 'list', 'post': 'create'})
deck_detail = FlashcardDeckViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy',
})

card_list = FlashcardViewSet.as_view({'get': 'list', 'post': 'create'})
card_detail = FlashcardViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy',
})

progress_list = FlashcardProgressViewSet.as_view({'get': 'list'})
progress_detail = FlashcardProgressViewSet.as_view({'get': 'retrieve'})
progress_review = FlashcardProgressViewSet.as_view({'post': 'review'})
progress_by_student = FlashcardProgressViewSet.as_view({'get': 'by_student'})
progress_by_deck_student = FlashcardProgressViewSet.as_view({'get': 'by_deck_student'})

urlpatterns = [
    path('', deck_list, name='deck-list'),
    path('<uuid:pk>/', deck_detail, name='deck-detail'),
    path('cards/', card_list, name='card-list'),
    path('cards/<uuid:pk>/', card_detail, name='card-detail'),
    path('progress/', progress_list, name='progress-list'),
    path('progress/<uuid:pk>/', progress_detail, name='progress-detail'),
    path('progress/<uuid:pk>/review/', progress_review, name='progress-review'),
    path('progress/student/<uuid:student_id>/', progress_by_student, name='progress-by-student'),
    path('progress/deck/<uuid:deck_id>/<uuid:student_id>/', progress_by_deck_student, name='progress-by-deck-student'),
]
