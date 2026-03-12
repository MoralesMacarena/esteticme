from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceViewSet, BookingViewSet, AvailabilityViewSet, ReviewViewSet

# El enrutador mágico
router = DefaultRouter()
# Registramos todas nuestras rutas
router.register(r'services', ServiceViewSet)
router.register(r'bookings', BookingViewSet)
router.register(r'availabilities', AvailabilityViewSet)
router.register(r'reviews', ReviewViewSet)

urlpatterns = [
    path('', include(router.urls)),
]