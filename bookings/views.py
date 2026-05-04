from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Service, Booking, Availability, Review, Category
from .serializers import ServiceSerializer, BookingSerializer, AvailabilitySerializer, ReviewSerializer, CategorySerializer
from rest_framework.views import APIView

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated] 

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)

    def get_queryset(self):
        user = self.request.user
        
        # 1. ¡CORRECCIÓN VITAL! Discriminamos por rol
        if user.role == 'professional':
            # Si es profesional, devolvemos las citas donde él es el profesional
            # IMPORTANTE: Queremos ver TODAS (incluidas las canceladas) en el panel
            return Booking.objects.filter(professional=user).order_by('-booking_date', 'start_time')
        else:
            # Si es cliente, devolvemos las citas que ha reservado
            return Booking.objects.filter(client=user).order_by('-booking_date', 'start_time')

    # 2. EL TRUCO PARA LIBERAR HUECOS CANCELADOS
    @action(detail=False, methods=['GET'], permission_classes=[AllowAny])
    def ocupadas(self, request):
        """
        Endpoint que usa el Frontend en el Checkout para saber qué horas bloquear.
        Ejemplo de URL: /api/bookings/citas/ocupadas/?profesional=1&fecha=2026-04-24
        """
        profesional_id = request.query_params.get('profesional')
        fecha = request.query_params.get('fecha')

        if not profesional_id or not fecha:
            return Response({"error": "Faltan parámetros: profesional y fecha"}, status=400)

        # AQUÍ ESTÁ LA MAGIA: Solo contamos como "ocupadas" las confirmadas o pendientes
        citas_activas = Booking.objects.filter(
            professional_id=profesional_id,
            booking_date=fecha,
            status__in=['pending', 'confirmed'] # ¡Las canceladas quedan excluidas y el hueco libre!
        )
        
        serializer = self.get_serializer(citas_activas, many=True)
        return Response(serializer.data)


# El resto de ViewSets puedes dejarlos como están:
class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated] # Solo usuarios logueados

    def get_queryset(self):
        # Filtramos para que solo devuelva los servicios de este profesional
        return Service.objects.filter(professional=self.request.user)

    def perform_create(self, serializer):
        # ¡MAGIA!: Cuando el profesional cree un servicio nuevo en React, 
        # Django le asignará automáticamente su usuario como 'dueño' del servicio.
        serializer.save(professional=self.request.user)


class AvailabilityViewSet(viewsets.ModelViewSet):
    serializer_class = AvailabilitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Filtramos para que solo devuelva los horarios de este profesional
        return Availability.objects.filter(professional=self.request.user)

    def perform_create(self, serializer):
        # Asigna el usuario automáticamente al crear un horario
        serializer.save(professional=self.request.user)

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

class CategoryViewSet(viewsets.ReadOnlyModelViewSet): # Solo lectura para profesionales
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ProfessionalAvailabilityView(APIView):
    permission_classes = [AllowAny] # Cualquiera puede ver los horarios de un salón

    def get(self, request, professional_id):
        # Buscamos todos los días que trabaja este profesional
        availabilities = Availability.objects.filter(professional_id=professional_id)
        serializer = AvailabilitySerializer(availabilities, many=True)
        return Response(serializer.data)