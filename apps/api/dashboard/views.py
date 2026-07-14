from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from .models import Org, Tutor
from .serializers import OrgSerializer, TutorSerializer


class OrgViewSet(viewsets.ModelViewSet):
    queryset = Org.objects.prefetch_related('tutors').order_by('name')
    serializer_class = OrgSerializer
    authentication_classes = ()
    permission_classes = (AllowAny,)


class TutorViewSet(viewsets.ModelViewSet):
    queryset = Tutor.objects.select_related('org').order_by('name')
    serializer_class = TutorSerializer
    authentication_classes = ()
    permission_classes = (AllowAny,)
