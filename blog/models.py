from django.db import models
from django.conf import settings # Para enlazar con tu CustomUser

class Post(models.Model):
    # El autor del artículo
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='blog_posts'
    )
    title = models.CharField(max_length=200)
    # El 'slug' es la versión del título para la URL (ej: mi-primer-articulo)
    slug = models.SlugField(max_length=200, unique=True)
    content = models.TextField()
    image_url = models.TextField(blank=True, null=True) 
    is_published = models.BooleanField(default=False) # TINYINT(1) en tu diagrama
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Comment(models.Model):
    # A qué artículo pertenece el comentario
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    # Qué usuario lo ha escrito
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='user_comments'
    )
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comentario de {self.user.email} en {self.post.title}"