from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet

# El enrutador mágico para los usuarios
router = DefaultRouter()
router.register(r'profiles', UserViewSet) # Usamos 'profiles' para que la URL quede limpia

urlpatterns = [
    path('', include(router.urls)),
]