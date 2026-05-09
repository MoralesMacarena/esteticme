from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Post, Comment
from .serializers import PostSerializer, CommentSerializer

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.filter(is_published=True)
    serializer_class = PostSerializer
    lookup_field = 'slug'

    def get_permissions(self):
        # Listar y ver detalle: Permitido a todos (incluso sin loguear si quieres)
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        # El resto (crear, editar, borrar): Solo Staff/Admin
        return [permissions.IsAdminUser()]

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

    def get_permissions(self):
        # Solo usuarios autenticados (clientes o profesionales) pueden comentar
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        # Solo pueden borrar/editar sus propios comentarios si quieres (o solo Admin)
        return [permissions.IsAdminUser()]

    def perform_create(self, serializer):
        # Al crear un comentario, guardamos quién es el usuario logueado automáticamente
        serializer.save(user=self.request.user)