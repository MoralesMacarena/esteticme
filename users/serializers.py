from rest_framework import serializers
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        # En lugar de '__all__', listamos los campos seguros
        fields = ['id', 'email', 'full_name', 'role', 'phone', 'business_name', 'business_address', 'description']