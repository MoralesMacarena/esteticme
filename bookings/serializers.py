from datetime import datetime, timedelta
from decimal import Decimal

from rest_framework import serializers

from .models import Service, Booking, Availability, Review, Category


class CategorySerializer(serializers.ModelSerializer):
    """
    Serializador para las categorías de los servicios.
    """
    class Meta:
        model = Category
        fields = ['id', 'name', 'icon']


class ServiceSerializer(serializers.ModelSerializer):
    """
    Serializador para la gestión interna de los servicios de un profesional.
    """
    class Meta:
        model = Service
        fields = '__all__'
        read_only_fields = ['professional']


class ReviewSerializer(serializers.ModelSerializer):
    """
    Serializador para las valoraciones y reseñas de las citas.
    Incluye la resolución dinámica del nombre del autor de la reseña.
    """
    reviewer_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'booking', 'rating', 'comment', 'created_at', 'reviewer_name']
        read_only_fields = ['booking', 'created_at']

    def get_reviewer_name(self, obj):
        """
        Resuelve el nombre a mostrar para la reseña. Si el usuario está registrado, 
        muestra su nombre completo. En caso de ser un usuario invitado, 
        muestra el nombre proporcionado o valores por defecto.
        """
        if obj.booking.client:
            return obj.booking.client.full_name or "Cliente"
        return obj.booking.guest_name or "Cliente Anónimo"


class BookingSerializer(serializers.ModelSerializer):
    """
    Serializador principal para las citas (Bookings).
    Maneja la validación de horarios, la asignación de servicios y 
    la integración con el sistema de fidelización (puntos y descuentos).
    """
    service_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True
    )
    client_name = serializers.ReadOnlyField(source='client.full_name')
    professional_name = serializers.ReadOnlyField(source='professional.business_name')
    
    services = ServiceSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)

    display_phone = serializers.SerializerMethodField()
    use_points = serializers.BooleanField(write_only=True, default=False)

    class Meta:
        model = Booking
        fields = [
            'id', 'professional', 'professional_name', 'booking_date', 'client',
            'start_time', 'total_price', 'status', 'service_ids', 'client_name', 
            'guest_name', 'guest_phone', 'reviews', 'services', 'display_phone',
            'points_used', 'discount_amount', 'points_earned', 'use_points'
        ]
        read_only_fields = ['id', 'client_name', 'professional_name', 'total_price', 'points_used', 'discount_amount', 'points_earned']

    def get_display_phone(self, obj):
        """
        Resuelve el teléfono de contacto a mostrar en la cita, 
        priorizando el del usuario registrado sobre el del invitado.
        """
        if obj.client and obj.client.phone:
            return obj.client.phone
        if obj.guest_phone:
            return obj.guest_phone
        return "Sin teléfono"

    def validate(self, data):
        """
        Valida la disponibilidad del profesional para la fecha y hora seleccionadas,
        asegurando que los servicios solicitados quepan en el horario laboral.
        """
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
        """
        Sobrescribe la creación de la cita para calcular la duración total,
        aplicar el sistema de fidelización (uso de puntos) y generar 
        el precio final descontado antes de persistir en base de datos.
        """
        service_ids = validated_data.pop('service_ids')
        use_points = validated_data.pop('use_points', False)
        
        start_time = validated_data['start_time']
        client = validated_data.get('client')
        
        services_db = Service.objects.filter(id__in=service_ids)
        total_duration = sum([s.duration_minutes for s in services_db])
        original_price = sum([s.price for s in services_db]) 
        
        dummy_date = datetime(2000, 1, 1, start_time.hour, start_time.minute)
        end_time = (dummy_date + timedelta(minutes=total_duration)).time()
        
        validated_data['end_time'] = end_time

        # Lógica de descuento (Sistema de Fidelización)
        final_price = original_price
        points_to_use = 0
        discount = Decimal('0.00')

        # Solo aplicamos descuento si quiere usar puntos y tiene al menos 100 (1€)
        if use_points and client and client.points >= 100:
            # 1. Calculamos cuántos euros enteros PUEDE descontar (ej: 760 // 100 = 7)
            max_discount_euros = Decimal(client.points // 100)
            
            # 2. El descuento no puede ser mayor que el precio de la cita
            discount = min(max_discount_euros, original_price)
            
            # 3. Calculamos los puntos exactos que se van a gastar (ej: 7€ * 100 = 700 puntos)
            points_to_use = int(discount * 100)
            
            # 4. Aplicamos las restas
            final_price -= discount
            client.points -= points_to_use
            client.save()

        validated_data['total_price'] = final_price
        validated_data['points_used'] = points_to_use
        validated_data['discount_amount'] = discount
        
        booking = Booking.objects.create(**validated_data)
        booking.services.set(services_db)
        
        return booking


class AvailabilitySerializer(serializers.ModelSerializer):
    """
    Serializador para la disponibilidad de horarios de los profesionales.
    """
    class Meta:
        model = Availability
        fields = '__all__'
        read_only_fields = ['professional']


class PublicServiceSerializer(serializers.ModelSerializer):
    """
    Serializador de lectura pública para exponer los servicios en el buscador.
    Anida datos del profesional (salón) y de la categoría para simplificar el frontend.
    """
    salon_name = serializers.CharField(source='professional.business_name', read_only=True)
    salon_address = serializers.CharField(source='professional.business_address', read_only=True)
    salon_id = serializers.IntegerField(source='professional.id', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Service
        fields = [
            'id', 'name', 'description', 'price', 'duration_minutes', 
            'salon_name', 'salon_address', 'salon_id', 'category_name','image'
        ]