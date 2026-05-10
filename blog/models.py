from django.db import models
from django.conf import settings # Para enlazar con tu CustomUser (en los comentarios)
from bookings.models import Category

class Post(models.Model):
    # Ahora es un texto libre. Le ponemos un valor por defecto por si se te olvida rellenarlo.
    author = models.CharField(max_length=150, default='Equipo EsteticMe')
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    
    # Categoría opcional (puede estar vacía)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='blog_posts')
    content = models.TextField()
    image = models.ImageField(upload_to='blog_images/', blank=True, null=True) 
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']

class Comment(models.Model):
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