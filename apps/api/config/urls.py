"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from django.views.decorators.csrf import csrf_exempt
from strawberry.django.views import GraphQLView

from .schema import schema


def health_check(request):
    return JsonResponse({'status': 'ok'})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health_check, name='health_check'),
    path('graphql', csrf_exempt(GraphQLView.as_view(schema=schema))),
    path('graphql/', csrf_exempt(GraphQLView.as_view(schema=schema))),
    path('api/graphql', csrf_exempt(GraphQLView.as_view(schema=schema))),
    path('api/graphql/', csrf_exempt(GraphQLView.as_view(schema=schema))),
    path('api/users/', include('users.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/courses/', include('courses.urls')),
    path('api/flashcards/', include('flashcards.urls')),
    path('api/quizzes/', include('quizzes.urls')),
    path('api/ai/', include('ai.urls')),
]
