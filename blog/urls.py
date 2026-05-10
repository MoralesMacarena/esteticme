from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, CommentViewSet

# El enrutador mágico para el blog
router = DefaultRouter()

# ---> AÑADIMOS EL BASENAME AQUÍ <---
router.register(r'posts', PostViewSet, basename='post')
router.register(r'comments', CommentViewSet, basename='comment')

urlpatterns = [
    path('', include(router.urls)),
]