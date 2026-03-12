from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceViewSet

# Creamos el enrutador mágico de DRF
router = DefaultRouter()
router.register(r'services', ServiceViewSet) # La URL será /services/

urlpatterns = [
    path('', include(router.urls)),
]