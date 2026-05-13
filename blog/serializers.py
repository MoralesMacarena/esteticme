from rest_framework import serializers

from .models import Post, Comment


class CommentSerializer(serializers.ModelSerializer):
    """
    Serializador para los comentarios del blog.
    Extrae dinámicamente el nombre completo del autor para simplificar
    el renderizado en el frontend.
    """
    user_name = serializers.ReadOnlyField(source='user.full_name')

    class Meta:
        model = Comment
        fields = ['id', 'post', 'user', 'user_name', 'comment', 'created_at']
        read_only_fields = ['user']


class PostSerializer(serializers.ModelSerializer):
    """
    Serializador para las entradas (Posts) del blog.
    Anida los comentarios asociados y calcula el total de respuestas recibidas.
    """
    category_name = serializers.ReadOnlyField(source='category.name')
    comments = CommentSerializer(many=True, read_only=True)
    comment_count = serializers.IntegerField(source='comments.count', read_only=True)

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'category', 'category_name', 
            'content', 'author', 'image', 'is_published', 
            'created_at', 'comments', 'comment_count'
        ]