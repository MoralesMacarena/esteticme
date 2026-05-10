from rest_framework import serializers
from .models import Post, Comment

class CommentSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.full_name')

    class Meta:
        model = Comment
        # 1. Hemos añadido 'user' justo antes de 'user_name'
        fields = ['id', 'post', 'user', 'user_name', 'comment', 'created_at']
        # 2. Añadimos esta línea para que Django no exija el ID del usuario al crear el comentario
        read_only_fields = ['user']

class PostSerializer(serializers.ModelSerializer):
    # Ya no necesitamos author_name porque author es un texto directamente
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