from django.contrib import admin
from django.urls import path, include
from django.conf import settings             
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from blog.views import CommentViewSet, PostViewSet
from rest_framework.routers import DefaultRouter
from users.serializers import CustomTokenObtainPairSerializer

# 1. CONFIGURAMOS EL ROUTER PARA EL BLOG
router = DefaultRouter()

# ---> AÑADIMOS EL BASENAME EN ESTAS DOS LÍNEAS <---
router.register(r'posts', PostViewSet, basename='post')
router.register(r'comments', CommentViewSet, basename='comment')

# 2. VISTA CUSTOM DEL TOKEN
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/bookings/', include('bookings.urls')),
    
    # Aquí unificamos el blog. Con 'router.urls' ya se crean 
    # automáticamente las rutas /api/blog/posts/ y /api/blog/posts/slug/
    path('api/blog/', include(router.urls)), 

    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)