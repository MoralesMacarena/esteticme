# users/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, ProfessionalViewSet, RegisterView, LoginView 

# El enrutador mágico
router = DefaultRouter()
router.register(r'profiles', UserViewSet) 
router.register(r'salones', ProfessionalViewSet, basename='salones')

urlpatterns = [
    # 1. Rutas manuales (Las que React busca específicamente)
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    
    # 2. Rutas del router (Para perfiles y listados)
    path('', include(router.urls)),
]