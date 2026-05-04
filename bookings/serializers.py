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

class BookingSerializer(serializers.ModelSerializer):
    service_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True
    )
    client_name = serializers.ReadOnlyField(source='client.full_name')

    class Meta:
        model = Booking
        fields = [
            'id', 'professional', 'booking_date', 
            'start_time', 'total_price', 'status', 'service_ids', 'client_name'
        ]
        read_only_fields = ['id', 'status', 'client_name']

    # --- NUESTRO NUEVO PORTERO DE DISCOTECA ---
    def validate(self, data):
        professional = data.get('professional')
        booking_date = data.get('booking_date')
        start_time = data.get('start_time')
        service_ids = data.get('service_ids')

        # Si faltan datos clave (DRF los bloqueará de todos modos, pero por si acaso)
        if not all([professional, booking_date, start_time, service_ids]):
            return data

        # 1. Comprobar el día de la semana (0=Lunes, 6=Domingo)
        day_of_week = booking_date.weekday()
        availability = Availability.objects.filter(
            professional=professional,
            day_of_week=day_of_week
        ).first()

        # PRIMERA BARRERA: ¿Trabaja ese día?
        if not availability:
            raise serializers.ValidationError({
                "booking_date": "El profesional no trabaja en este día de la semana."
            })

        # 2. Calculamos a qué hora terminará la cita para ver si le da tiempo
        services = Service.objects.filter(id__in=service_ids)
        total_duration = sum([s.duration_minutes for s in services])
        
        dummy_date = datetime(2000, 1, 1, start_time.hour, start_time.minute)
        end_time = (dummy_date + timedelta(minutes=total_duration)).time()

        # SEGUNDA BARRERA: ¿La cita cabe dentro de su horario?
        if start_time < availability.start_time or end_time > availability.end_time:
            raise serializers.ValidationError({
                "start_time": f"Horario no válido. El turno de este día es de {availability.start_time.strftime('%H:%M')} a {availability.end_time.strftime('%H:%M')} y esta reserva terminaría a las {end_time.strftime('%H:%M')}."
            })

        return data
    # ----------------------------------------

    def create(self, validated_data):
        service_ids = validated_data.pop('service_ids')
        start_time = validated_data['start_time']
        
        services = Service.objects.filter(id__in=service_ids)
        total_duration = sum([s.duration_minutes for s in services])
        
        dummy_date = datetime(2000, 1, 1, start_time.hour, start_time.minute)
        end_time = (dummy_date + timedelta(minutes=total_duration)).time()
        
        validated_data['end_time'] = end_time
        booking = Booking.objects.create(**validated_data)
        booking.services.set(services)
        
        return booking


class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = '__all__'
        read_only_fields = ['professional']

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'