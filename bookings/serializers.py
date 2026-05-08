from rest_framework import serializers
from .models import Service, Booking, Availability, Review, Category
from datetime import datetime, timedelta

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'icon']

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'
        read_only_fields = ['professional']

# --- AÑADIMOS EL DE RESEÑAS AQUÍ ARRIBA ---
class ReviewSerializer(serializers.ModelSerializer):
    # Añadimos un campo "mágico" para sacar el nombre de quien hace la reseña
    reviewer_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'booking', 'rating', 'comment', 'created_at', 'reviewer_name']
        read_only_fields = ['booking', 'created_at']

    def get_reviewer_name(self, obj):
        # Si tiene cuenta web, mostramos su nombre. Si no, "Cliente Anónimo"
        if obj.booking.client:
            return obj.booking.client.full_name or "Cliente"
        return obj.booking.guest_name or "Cliente Anónimo"


class BookingSerializer(serializers.ModelSerializer):
    service_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True
    )
    client_name = serializers.ReadOnlyField(source='client.full_name')
    professional_name = serializers.ReadOnlyField(source='professional.business_name')
    
    # Expandimos los servicios para ver nombre, precio, etc., no solo el ID
    services = ServiceSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)

    # --- EL CAMPO MÁGICO ---
    # Este campo no existe en la base de datos, lo "fabricamos" nosotros aquí abajo
    display_phone = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id', 'professional', 'professional_name', 'booking_date', 'client',
            'start_time', 'total_price', 'status', 'service_ids', 'client_name', 
            'guest_name', 'guest_phone', 'reviews', 'services', 'display_phone'
        ]
        read_only_fields = ['id', 'client_name', 'professional_name', 'total_price']

    # --- LÓGICA DEL CAMPO MÁGICO ---
    def get_display_phone(self, obj):
        # 1. Si hay cliente registrado y tiene teléfono, lo usamos
        if obj.client and obj.client.phone:
            return obj.client.phone
        # 2. Si no (es un invitado), usamos el guest_phone que añadiste al modelo
        if obj.guest_phone:
            return obj.guest_phone
        # 3. Si no hay nada de nada
        return "Sin teléfono"

    def validate(self, data):
        # ... (Tu lógica de validate se queda exactamente igual)
        professional = data.get('professional')
        booking_date = data.get('booking_date')
        start_time = data.get('start_time')
        service_ids = data.get('service_ids')

        if not all([professional, booking_date, start_time, service_ids]):
            return data

        day_of_week = booking_date.weekday()
        availability = Availability.objects.filter(
            professional=professional,
            day_of_week=day_of_week
        ).first()

        if not availability:
            raise serializers.ValidationError({
                "booking_date": "El profesional no trabaja en este día de la semana."
            })

        services_db = Service.objects.filter(id__in=service_ids)
        total_duration = sum([s.duration_minutes for s in services_db])
        
        dummy_date = datetime(2000, 1, 1, start_time.hour, start_time.minute)
        end_time = (dummy_date + timedelta(minutes=total_duration)).time()

        if start_time < availability.start_time or end_time > availability.end_time:
            raise serializers.ValidationError({
                "start_time": f"Horario no válido. El turno es de {availability.start_time.strftime('%H:%M')} a {availability.end_time.strftime('%H:%M')}."
            })

        return data

    def create(self, validated_data):
        # ... (Tu lógica de create se queda exactamente igual)
        service_ids = validated_data.pop('service_ids')
        start_time = validated_data['start_time']
        
        services_db = Service.objects.filter(id__in=service_ids)
        total_duration = sum([s.duration_minutes for s in services_db])
        total_price = sum([s.price for s in services_db])
        
        dummy_date = datetime(2000, 1, 1, start_time.hour, start_time.minute)
        end_time = (dummy_date + timedelta(minutes=total_duration)).time()
        
        validated_data['end_time'] = end_time
        validated_data['total_price'] = total_price 
        
        booking = Booking.objects.create(**validated_data)
        booking.services.set(services_db)
        
        return booking

class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = '__all__'
        read_only_fields = ['professional']

# Añadimos este serializador público para el buscador de Tratamientos
class PublicServiceSerializer(serializers.ModelSerializer):
    # Sacamos los datos del salón "dueño" de este servicio para pintarlos en la tarjeta
    salon_name = serializers.CharField(source='professional.business_name', read_only=True)
    salon_address = serializers.CharField(source='professional.business_address', read_only=True)
    salon_id = serializers.IntegerField(source='professional.id', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Service
        fields = [
            'id', 'name', 'description', 'price', 'duration_minutes', 
            'salon_name', 'salon_address', 'salon_id', 'category_name'
        ]