from django.db.models import Avg

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from bookings.models import Service, Review
from .models import CustomUser, SalonImage


class SalonImageSerializer(serializers.ModelSerializer):
    """
    Serializador para las imágenes de la galería de un salón/profesional.
    """
    class Meta:
        model = SalonImage
        fields = ['id', 'image', 'alt_text', 'is_cover']


class ServiceSerializer(serializers.ModelSerializer):
    """
    Serializador para los servicios ofrecidos por un profesional.
    Incluye el nombre de la categoría en modo de solo lectura.
    """
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = Service
        fields = ['id', 'name', 'description', 'price', 'duration_minutes', 'is_active', 'category_name']


class UserSerializer(serializers.ModelSerializer):
    """
    Serializador principal para el modelo CustomUser.
    Gestiona la serialización de clientes y profesionales, incluyendo la 
    encriptación de contraseñas y el cálculo de la nota media.
    """
    password = serializers.CharField(write_only=True)
    services = ServiceSerializer(many=True, read_only=True)
    gallery_images = SalonImageSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'password', 'full_name', 'role', 'phone', 
            'business_name', 'business_address', 'description',
            'profile_picture', 'salon_picture',
            'services', 'gallery_images',
            'average_rating',
            'points'
        ]
        read_only_fields = ['points']  

    def create(self, validated_data):
        """
        Sobrescribe el método create para extraer la contraseña y guardarla 
        encriptada de forma segura en la base de datos.
        """
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        
        if password is not None:
            instance.set_password(password)
            
        instance.save()
        return instance

    def get_average_rating(self, obj):
        """
        Calcula y devuelve la nota media de un profesional basándose en 
        las reseñas (Reviews) de sus citas asociadas.
        """
        if obj.role == 'professional':
            media = Review.objects.filter(booking__professional=obj).aggregate(Avg('rating'))['rating__avg']
            return round(media, 1) if media else None
        return None


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializador personalizado para la generación del token JWT.
    Añade información extra (como el rol) al diccionario de respuesta del login.
    """
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Añadimos el rol al payload para que React sepa qué tipo de usuario es
        data['role'] = self.user.role

        return data