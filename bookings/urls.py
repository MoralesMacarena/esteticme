"""
Configuración de las rutas (URLs) para la aplicación de reservas (bookings).
Utiliza un DefaultRouter de Django REST Framework para generar automáticamente
los endpoints CRUD de los ViewSets, y define rutas manuales para vistas específicas.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ServiceViewSet, 
    BookingViewSet, 
    AvailabilityViewSet, 
    CategoryViewSet,
    ReviewViewSet,
    ProfessionalAvailabilityView,
    PublicServiceViewSet
)

# Configuración del enrutador automático para los ViewSets
router = DefaultRouter()
router.register(r'servicios', ServiceViewSet, basename='service')
router.register(r'citas', BookingViewSet, basename='booking')
router.register(r'disponibilidad', AvailabilityViewSet, basename='availability')
router.register(r'categorias', CategoryViewSet, basename='category')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'tratamientos', PublicServiceViewSet, basename='tratamientos')

urlpatterns = [
    # Endpoints generados dinámicamente por el router
    path('', include(router.urls)),
    
    # Endpoints personalizados
    path(
        'profesionales/<int:professional_id>/horarios/', 
        ProfessionalAvailabilityView.as_view(), 
        name='professional-horarios'
    ),
]