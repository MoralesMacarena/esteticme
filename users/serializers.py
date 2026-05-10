from rest_framework import serializers
from .models import CustomUser, SalonImage 
from bookings.models import Service, Review # <-- 1. Añadimos Review
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.db.models import Avg # <-- 2. Importamos la función matemática Avg

# 1. Serializer para las Imágenes de la Galería
class SalonImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalonImage
        fields = ['id', 'image', 'alt_text', 'is_cover']

# 2. Serializer para los Servicios
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

    # --- 3. NUEVO: Creamos el campo para la nota media ---
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

    # --- 5. NUEVA FUNCIÓN: Así es como Django calcula la media ---
    def get_average_rating(self, obj):
        # Solo calculamos la nota si el usuario es un profesional
        if obj.role == 'professional':
            # Buscamos las reseñas de las citas (bookings) que pertenecen a este profesional
            media = Review.objects.filter(booking__professional=obj).aggregate(Avg('rating'))['rating__avg']
            # Si hay nota, la redondeamos a 1 decimal (ej: 4.8). Si no hay reseñas aún, devolvemos None.
            return round(media, 1) if media else None
        return None


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