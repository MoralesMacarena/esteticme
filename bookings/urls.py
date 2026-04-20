from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet, ServiceViewSet, AvailabilityViewSet, ReviewViewSet

# Creamos el router para bookings
router = DefaultRouter()
router.register(r'citas', BookingViewSet, basename='booking')
router.register(r'servicios', ServiceViewSet, basename='service')
router.register(r'disponibilidad', AvailabilityViewSet, basename='availability')
router.register(r'resenas', ReviewViewSet, basename='review')

urlpatterns = [
    path('', include(router.urls)),
]