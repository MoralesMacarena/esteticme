from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Service, Booking, Availability, Review
from .serializers import ServiceSerializer, BookingSerializer, AvailabilitySerializer, ReviewSerializer

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated] # Solo usuarios logueados pueden reservar

    def perform_create(self, serializer):
        # 1. Asignamos automáticamente el cliente que está logueado
        # 2. El cálculo de 'end_time' y la gestión de 'services' 
        #    ya la configuramos en el Serializer anteriormente.
        serializer.save(client=self.request.user)

    def get_queryset(self):
        # Opcional: Esto hace que si un cliente consulta sus citas, 
        # solo vea las suyas y no las de todo el mundo.
        user = self.request.user
        if user.is_staff:
            return Booking.objects.all()
        return Booking.objects.filter(client=user)

# El resto de ViewSets puedes dejarlos como están:
class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

class AvailabilityViewSet(viewsets.ModelViewSet):
    queryset = Availability.objects.all()
    serializer_class = AvailabilitySerializer

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer