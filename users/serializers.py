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
    # Añadimos password como campo explícito para poder configurarlo
    password = serializers.CharField(write_only=True)
    
    services = ServiceSerializer(many=True, read_only=True)
    gallery_images = SalonImageSerializer(many=True, read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'password', 'full_name', 'role', 'phone', 
            'business_name', 'business_address', 'description',
            'profile_picture', 'salon_picture',
            'services', 'gallery_images'
        ]

    def create(self, validated_data):
        # 1. Extraemos la contraseña antes de crear el usuario
        password = validated_data.pop('password', None)
        # 2. Creamos la instancia del usuario
        instance = self.Meta.model(**validated_data)
        # 3. Encriptamos la contraseña
        if password is not None:
            instance.set_password(password)
        # 4. Guardamos
        instance.save()
        return instance

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