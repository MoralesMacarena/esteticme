from rest_framework import serializers
from .models import Service, Booking, Availability, Review
from datetime import datetime, timedelta

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    # 1. Recibimos una lista de IDs desde el carrito de React: [1, 4]
    service_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True
    )

    client_name = serializers.ReadOnlyField(source='client.full_name')

    class Meta:
        model = Booking
        # 2. Especificamos qué campos queremos manejar. 
        # Quitamos 'client' y 'end_time' porque los calculamos en el servidor.
        fields = [
            'id', 'professional', 'booking_date', 
            'start_time', 'total_price', 'status', 'service_ids', 'client_name'
        ]
        read_only_fields = ['id', 'status', 'client_name']

    def create(self, validated_data):
        # 3. Extraemos los IDs de los servicios antes de crear la reserva
        service_ids = validated_data.pop('service_ids')
        start_time = validated_data['start_time']
        
        # 4. Buscamos los servicios reales para calcular la duración
        services = Service.objects.filter(id__in=service_ids)
        total_duration = sum([s.duration_minutes for s in services])
        
        # 5. CÁLCULO AUTOMÁTICO DE HORA DE FIN
        # Convertimos la hora a un objeto datetime temporal para sumarle los minutos
        dummy_date = datetime(2000, 1, 1, start_time.hour, start_time.minute)
        end_time = (dummy_date + timedelta(minutes=total_duration)).time()
        
        # Añadimos la hora de fin calculada a los datos
        validated_data['end_time'] = end_time

        # 6. Creamos la reserva en la base de datos
        booking = Booking.objects.create(**validated_data)
        
        # 7. Asociamos los servicios a la reserva (Relación ManyToMany)
        booking.services.set(services)
        
        return booking

class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'