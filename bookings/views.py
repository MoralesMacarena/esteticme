from django.contrib.auth import get_user_model

from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Service, Booking, Availability, Review, Category
from .serializers import (
    PublicServiceSerializer, 
    ServiceSerializer, 
    BookingSerializer, 
    AvailabilitySerializer, 
    ReviewSerializer, 
    CategorySerializer
)

User = get_user_model()


class BookingViewSet(viewsets.ModelViewSet):
    """
    ViewSet principal para la gestión de citas (reservas).
    Permite a los clientes crear reservas y a los profesionales gestionar su calendario.
    Incluye la lógica de negocio para el sistema de fidelización (puntos).
    """
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated] 

    def perform_create(self, serializer):
        """
        Asigna automáticamente el cliente a la cita si el usuario que 
        realiza la petición tiene el rol de cliente.
        """
        user = self.request.user
        if user.role == 'professional':
            serializer.save()
        else:
            serializer.save(client=user)

    def get_queryset(self):
        """
        Filtra las citas para devolver únicamente los registros relevantes:
        - Profesionales: Citas asignadas a su negocio.
        - Clientes: Su propio historial de reservas.
        """
        user = self.request.user
        if user.role == 'professional':
            return Booking.objects.filter(professional=user).order_by('-booking_date', 'start_time')
        else:
            return Booking.objects.filter(client=user).order_by('-booking_date', 'start_time')
    
    def perform_update(self, serializer):
        """
        Sobrescribe la actualización para interceptar cambios de estado.
        Sistema de Fidelización: Si la cita cambia a estado 'completed', 
        se calculan y otorgan puntos al cliente basándose en el importe total.
        """
        old_status = self.get_object().status
        booking = serializer.save()
        
        if old_status != 'completed' and booking.status == 'completed':
            
            if booking.client:
                # Se otorga 1 punto de fidelidad por cada euro gastado (entero)
                puntos_ganados = int(booking.total_price)
                
                booking.client.points += puntos_ganados
                booking.client.save()
                
                # Se registra la cantidad de puntos generados en la propia cita
                booking.points_earned = puntos_ganados
                booking.save(update_fields=['points_earned'])

    @action(detail=False, methods=['GET'], permission_classes=[AllowAny])
    def ocupadas(self, request):
        """
        Devuelve las franjas horarias ocupadas (citas pendientes o confirmadas) 
        para un profesional en una fecha específica.
        """
        profesional_id = request.query_params.get('profesional')
        fecha = request.query_params.get('fecha')
        
        if not profesional_id or not fecha:
            return Response(
                {"error": "Faltan parámetros obligatorios: profesional y fecha"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        citas_activas = Booking.objects.filter(
            professional_id=profesional_id,
            booking_date=fecha,
            status__in=['pending', 'confirmed']
        )
        serializer = self.get_serializer(citas_activas, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['GET'])
    def mis_clientes(self, request):
        """
        Endpoint auxiliar que devuelve un listado básico de los clientes de la plataforma.
        """
        clientes = User.objects.filter(role='client')
        data = [{"id": c.id, "nombre": c.full_name, "email": c.email, "phone": c.phone} for c in clientes]
        return Response(data)

    @action(detail=True, methods=['POST'])
    def rate(self, request, pk=None):
        """
        Permite al cliente dejar una reseña para una cita finalizada.
        Aplica validaciones de seguridad, estado de la cita y duplicidad.
        """
        booking = self.get_object()

        # Validación 1: Pertenencia de la cita
        if booking.client != request.user:
            return Response({"error": "No tienes permiso para valorar esta cita."}, status=status.HTTP_403_FORBIDDEN)

        # Validación 2: Estado de finalización
        if booking.status != 'completed':
            return Response({"error": "Solo puedes valorar citas que ya hayan finalizado."}, status=status.HTTP_400_BAD_REQUEST)

        # Validación 3: Reseña única por cita
        if Review.objects.filter(booking=booking).exists():
            return Response({"error": "Ya has dejado una reseña para esta visita."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(booking=booking)
            return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ServiceViewSet(viewsets.ModelViewSet):
    """
    ViewSet para la gestión (CRUD) de los servicios ofrecidos por un profesional.
    """
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Service.objects.filter(professional=self.request.user)

    def perform_create(self, serializer):
        serializer.save(professional=self.request.user)


class AvailabilityViewSet(viewsets.ModelViewSet):
    """
    ViewSet para configurar y gestionar los horarios de disponibilidad del salón.
    """
    serializer_class = AvailabilitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Availability.objects.filter(professional=self.request.user)

    def perform_create(self, serializer):
        serializer.save(professional=self.request.user)


class ReviewViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet de solo lectura para exponer el listado de reseñas en el perfil del salón.
    (La creación de nuevas reseñas se maneja exclusivamente a través de la acción 'rate').
    """
    queryset = Review.objects.all().order_by('-created_at')
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet de solo lectura para recuperar el catálogo de categorías de servicios.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ProfessionalAvailabilityView(APIView):
    """
    Endpoint público para consultar el horario de trabajo configurado 
    por un profesional específico (requerido para el proceso de checkout).
    """
    permission_classes = [AllowAny]

    def get(self, request, professional_id):
        availabilities = Availability.objects.filter(professional_id=professional_id)
        serializer = AvailabilitySerializer(availabilities, many=True)
        return Response(serializer.data)
    

class PublicServiceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Endpoint público para alimentar el buscador general de tratamientos.
    Retorna todos los servicios que se encuentren marcados como activos.
    """
    queryset = Service.objects.filter(is_active=True).order_by('name')
    serializer_class = PublicServiceSerializer
    permission_classes = [AllowAny]