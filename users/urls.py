from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, ProfessionalViewSet, RegisterView, LoginView, AdminDashboardStatsView


router = DefaultRouter()
router.register(r'profiles', UserViewSet) 
router.register(r'salones', ProfessionalViewSet, basename='salones')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('dashboard-stats/', AdminDashboardStatsView.as_view(), name='dashboard_stats'),
    path('', include(router.urls)),
]