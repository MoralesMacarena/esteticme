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
        # AQUÍ es donde debe ir esta línea:
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
        # Y aquí también estaba bien
        read_only_fields = ['id', 'status', 'client_name']

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