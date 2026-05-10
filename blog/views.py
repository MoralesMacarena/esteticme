from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Post, Comment
from .serializers import PostSerializer, CommentSerializer

class PostViewSet(viewsets.ModelViewSet):
    # 1. QUITAMOS el queryset estático y usamos get_queryset dinámico
    serializer_class = PostSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        # Si el usuario está logueado y es admin, le devolvemos TODOS los posts (incluidos borradores)
        if self.request.user.is_authenticated and (self.request.user.role == 'admin' or self.request.user.is_superuser):
            return Post.objects.all().order_by('-created_at')
        
        # Para el resto del mundo, solo los que están publicados
        return Post.objects.filter(is_published=True).order_by('-created_at')

    def get_permissions(self):
        # Listar y ver detalle: Permitido a todos
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        # El resto (crear, editar, borrar): Solo Staff/Admin
        return [permissions.IsAdminUser()]

    # ¡HEMOS ELIMINADO perform_create DE AQUÍ! 
    # Ahora Django guardará automáticamente el 'author' y 'category' que le mandemos desde React.


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

    def get_permissions(self):
        # 1. Ver comentarios: Todo el mundo
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        
        # 2. Crear y BORRAR: Cualquier usuario logueado (la seguridad extra va abajo)
        if self.action in ['create', 'destroy']:
            return [permissions.IsAuthenticated()]
            
        # 3. Editar (update) u otros: Sigue siendo solo para Admin
        return [permissions.IsAdminUser()]

    def perform_create(self, serializer):
        # Asignamos el usuario logueado al comentario
        serializer.save(user=self.request.user)

    # --- NUEVA FUNCIÓN PARA EL BORRADO SEGURO ---
    def destroy(self, request, *args, **kwargs):
        comment = self.get_object() # Buscamos el comentario en la DB
        
        # Comprobamos si es Admin o si el usuario logueado es el autor
        is_admin = getattr(request.user, 'role', None) == 'admin' or request.user.is_superuser
        is_owner = comment.user == request.user

        if is_admin or is_owner:
            # Si se cumple alguna, borramos de verdad
            self.perform_destroy(comment)
            return Response(status=status.HTTP_204_NO_CONTENT)
        
        # Si no es ninguno de los dos, le denegamos el acceso
        return Response(
            {"detail": "No tienes permiso para borrar este comentario."},
            status=status.HTTP_403_FORBIDDEN
        )