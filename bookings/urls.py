from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet, CategoryViewSet, ProfessionalAvailabilityView, ServiceViewSet, AvailabilityViewSet, ReviewViewSet

router = DefaultRouter()
router.register(r'citas', BookingViewSet, basename='booking')
router.register(r'servicios', ServiceViewSet, basename='service')
router.register(r'disponibilidad', AvailabilityViewSet, basename='availability')
router.register(r'resenas', ReviewViewSet, basename='review')
router.register(r'categorias', CategoryViewSet, basename='category')

urlpatterns = [
    path('', include(router.urls)),
    # NUEVO: Le cambiamos el nombre a 'horarios' para que no pelee con el router
    path('horarios/<int:professional_id>/', ProfessionalAvailabilityView.as_view(), name='salon-availability'),
]