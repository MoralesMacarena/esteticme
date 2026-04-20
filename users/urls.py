from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, ProfessionalViewSet # <-- Importamos las dos vistas

# El enrutador mágico
router = DefaultRouter()

# 1. Tu ruta original para administrar todos los perfiles
router.register(r'profiles', UserViewSet) 

# 2. LA NUEVA RUTA: Solo para listar a los profesionales activos con sus fotos y servicios
router.register(r'salones', ProfessionalViewSet, basename='salones')

urlpatterns = [
    path('', include(router.urls)),
]