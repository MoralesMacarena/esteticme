from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ServiceViewSet, 
    BookingViewSet, 
    AvailabilityViewSet, 
    CategoryViewSet,
    ReviewViewSet,
    ProfessionalAvailabilityView
)

router = DefaultRouter()
router.register(r'servicios', ServiceViewSet, basename='service')
router.register(r'citas', BookingViewSet, basename='booking')
router.register(r'disponibilidad', AvailabilityViewSet, basename='availability')
router.register(r'categorias', CategoryViewSet, basename='category')
router.register(r'reviews', ReviewViewSet, basename='review')

urlpatterns = [
    path('', include(router.urls)),
    path('profesionales/<int:professional_id>/horarios/', ProfessionalAvailabilityView.as_view(), name='professional-horarios'),
]