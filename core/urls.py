from django.contrib import admin
from django.urls import path, include
from django.conf import settings             
from django.conf.urls.static import static

from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from blog.views import CommentViewSet, PostViewSet
from users.serializers import CustomTokenObtainPairSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Vista personalizada para la obtención del token JWT.
    Utiliza el serializador CustomTokenObtainPairSerializer para 
    incluir datos adicionales (como el rol del usuario) en el payload.
    """
    serializer_class = CustomTokenObtainPairSerializer


# Configuración del enrutador (Router) para la API del Blog
# Genera automáticamente las rutas estándar (GET, POST, PUT, DELETE)
router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='post')
router.register(r'comments', CommentViewSet, basename='comment')

urlpatterns = [
    # Panel de administración de Django
    path('admin/', admin.site.urls),
    
    # Endpoints de las aplicaciones principales
    path('api/users/', include('users.urls')),
    path('api/bookings/', include('bookings.urls')),
    
    # Endpoints del blog generados por el router (/api/blog/posts/ y /api/blog/comments/)
    path('api/blog/', include(router.urls)), 

    # Endpoints para la autenticación y refresco de tokens JWT
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

# Configuración para servir archivos multimedia (imágenes) en el entorno de desarrollo local
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)