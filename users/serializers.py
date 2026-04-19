from rest_framework import serializers
from .models import CustomUser
from bookings.models import Service # <-- Importamos el modelo de la otra app

# 1. Creamos el Serializer para los Servicios
class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        # Mandamos los datos que nos interesan para pintar la tarjeta en React
        fields = ['id', 'name', 'description', 'price', 'duration_minutes', 'is_active']

# 2. Actualizamos tu Serializer de Usuarios
class UserSerializer(serializers.ModelSerializer):
    # ¡LA MAGIA!: Le decimos que busque los servicios asociados a este usuario
    # Usamos 'services' porque es el related_name que pusiste en bookings/models.py
    services = ServiceSerializer(many=True, read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'full_name', 'role', 'phone', 
            'business_name', 'business_address', 'description',
            'profile_picture', 'salon_picture', # Tus fotos
            'services' # <-- La nueva lista de servicios
        ]