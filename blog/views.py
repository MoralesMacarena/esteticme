from rest_framework import viewsets, permissions, status
from rest_framework.response import Response

from .models import Post, Comment
from .serializers import PostSerializer, CommentSerializer


class PostViewSet(viewsets.ModelViewSet):
    """
    ViewSet para la gestión de los artículos (Posts) del blog.
    Utiliza el 'slug' como identificador en las URLs para mejorar el SEO.
    """
    serializer_class = PostSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        """
        Devuelve el QuerySet de posts evaluando los permisos del usuario.
        Los administradores tienen acceso a todo el catálogo (incluyendo borradores),
        mientras que el público general solo recibe los posts publicados.
        """
        if self.request.user.is_authenticated and (self.request.user.role == 'admin' or self.request.user.is_superuser):
            return Post.objects.all().order_by('-created_at')
        
        return Post.objects.filter(is_published=True).order_by('-created_at')

    def get_permissions(self):
        """
        Aplica restricciones a nivel de acción:
        - Lectura (list, retrieve): Acceso público.
        - Escritura/Modificación (create, update, destroy): Solo administradores.
        """
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


class CommentViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar el sistema de comentarios asociados a los posts.
    """
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

    def get_permissions(self):
        """
        Aplica un sistema de permisos escalonado:
        - Lectura pública.
        - Creación y borrado propio para usuarios autenticados.
        - Control total para administradores.
        """
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        
        if self.action in ['create', 'destroy']:
            return [permissions.IsAuthenticated()]
            
        return [permissions.IsAdminUser()]

    def perform_create(self, serializer):
        """
        Vincula automáticamente el comentario creado con el usuario que hace la petición.
        """
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        """
        Sobrescribe la lógica de borrado por defecto para aplicar validación de propiedad.
        Un comentario solo puede ser eliminado por su autor original o por un administrador.
        """
        comment = self.get_object() 
        
        is_admin = getattr(request.user, 'role', None) == 'admin' or request.user.is_superuser
        is_owner = comment.user.id == request.user.id

        if is_admin or is_owner:
            self.perform_destroy(comment)
            return Response(status=status.HTTP_204_NO_CONTENT)
        
        return Response(
            {"detail": "No tienes permiso para borrar este comentario."},
            status=status.HTTP_403_FORBIDDEN
        )