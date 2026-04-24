"""
URL configuration for core project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings             
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# 1. IMPORTAMOS TU NUEVO SERIALIZADOR
from users.serializers import CustomTokenObtainPairSerializer

# 2. CREAMOS LA VISTA CUSTOM AQUÍ MISMO
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/blog/', include('blog.urls')),
    path('api/bookings/', include('bookings.urls')), 

    # 3. CAMBIAMOS LA RUTA DEL TOKEN PARA QUE USE NUESTRA VISTA CUSTOM
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)