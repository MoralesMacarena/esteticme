from django.db import models
from django.conf import settings

from bookings.models import Category


class Post(models.Model):
    """
    Modelo que representa un artículo o entrada en el blog de la plataforma.
    Incluye campos para optimización SEO (slug), categorización y 
    control del estado de publicación (borrador/publicado).
    """
    author = models.CharField(max_length=150, default='Equipo EsteticMe')
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    
    category = models.ForeignKey(
        Category, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='blog_posts'
    )
    content = models.TextField()
    image = models.ImageField(upload_to='blog_images/', blank=True, null=True) 
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Comment(models.Model):
    """
    Modelo para gestionar los comentarios de los usuarios en el blog.
    Establece una relación dependiente tanto con el artículo (Post) 
    como con el usuario registrado que lo escribe.
    """
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='user_comments'
    )
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comentario de {self.user.email} en {self.post.title}"