from rest_framework import serializers
from .models import CustomUser, SalonImage 
from bookings.models import Service 
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# 1. Serializer para las Imágenes de la Galería (¡Lo Nuevo!)
class SalonImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalonImage
        fields = ['id', 'image', 'alt_text', 'is_cover']

# 2. Serializer para los Servicios (Lo que ya tenías)
class ServiceSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = Service
        fields = ['id', 'name', 'description', 'price', 'duration_minutes', 'is_active', 'category_name']

# 3. El Serializer Principal del Usuario/Profesional
class UserSerializer(serializers.ModelSerializer):
    services = ServiceSerializer(many=True, read_only=True)
    
    # ¡LA NUEVA MAGIA!: Añadimos la galería de imágenes a la lista
    # Usamos 'gallery_images' porque es el related_name del models.py
    gallery_images = SalonImageSerializer(many=True, read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'full_name', 'role', 'phone', 
            'business_name', 'business_address', 'description',
            'profile_picture', 'salon_picture',
            'services',       # Tus servicios
            'gallery_images'  # <-- Tus nuevas fotos de galería
        ]

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # 1. Ejecutamos la validación normal (que comprueba usuario y contraseña)
        data = super().validate(attrs)

        # 2. self.user contiene el usuario que acaba de hacer login correctamente
        # Añadimos nuestro campo extra al diccionario de respuesta
        data['role'] = self.user.role
        
        # (Opcional) Puedes mandar más cosas si quieres, como el nombre:
        # data['full_name'] = self.user.full_name

        return data