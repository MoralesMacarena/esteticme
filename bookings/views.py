from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Service, Booking, Availability, Review, Category
from .serializers import ServiceSerializer, BookingSerializer, AvailabilitySerializer, ReviewSerializer, CategorySerializer
from rest_framework.views import APIView
from django.contrib.auth import get_user_model

User = get_user_model()

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated] 

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'professional':
            serializer.save()
        else:
            serializer.save(client=user)

    def get_queryset(self):
        user = self.request.user
        if user.role == 'professional':
            return Booking.objects.filter(professional=user).order_by('-booking_date', 'start_time')
        else:
            return Booking.objects.filter(client=user).order_by('-booking_date', 'start_time')

    @action(detail=False, methods=['GET'], permission_classes=[AllowAny])
    def ocupadas(self, request):
        profesional_id = request.query_params.get('profesional')
        fecha = request.query_params.get('fecha')
        if not profesional_id or not fecha:
            return Response({"error": "Faltan parámetros: profesional y fecha"}, status=400)

        citas_activas = Booking.objects.filter(
            professional_id=profesional_id,
            booking_date=fecha,
            status__in=['pending', 'confirmed']
        )
        serializer = self.get_serializer(citas_activas, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['GET'])
    def mis_clientes(self, request):
        clientes = User.objects.filter(role='client')
        data = [{"id": c.id, "nombre": c.full_name, "email": c.email} for c in clientes]
        return Response(data)

    # --- NUEVA ACCIÓN PARA VALORAR CITAS ---
    @action(detail=True, methods=['POST'])
    def rate(self, request, pk=None):
        """
        Permite al cliente dejar una reseña en una cita específica.
        URL: POST /api/bookings/citas/<id>/rate/
        """
        booking = self.get_object()

        # 1. Seguridad: ¿Es el dueño de la cita?
        if booking.client != request.user:
            return Response({"error": "No tienes permiso para valorar esta cita."}, status=status.HTTP_403_FORBIDDEN)

        # 2. Seguridad: ¿Está terminada?
        if booking.status != 'completed':
            return Response({"error": "Solo puedes valorar citas que ya hayan finalizado."}, status=status.HTTP_400_BAD_REQUEST)

        # 3. Seguridad: ¿Ya ha sido valorada?
        if Review.objects.filter(booking=booking).exists():
            return Response({"error": "Ya has dejado una reseña para esta visita."}, status=status.HTTP_400_BAD_REQUEST)

        # 4. Crear la reseña
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(booking=booking)
            # Devolvemos la cita completa actualizada para que el Front se refresque
            return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Service.objects.filter(professional=self.request.user)

    def perform_create(self, serializer):
        serializer.save(professional=self.request.user)


class AvailabilityViewSet(viewsets.ModelViewSet):
    serializer_class = AvailabilitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Availability.objects.filter(professional=self.request.user)

    def perform_create(self, serializer):
        serializer.save(professional=self.request.user)


class ReviewViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Este ViewSet ahora es solo de lectura para mostrar las reseñas 
    en el perfil público del salón. La creación se hace vía 'rate'.
    """
    queryset = Review.objects.all().order_by('-created_at')
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ProfessionalAvailabilityView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, professional_id):
        availabilities = Availability.objects.filter(professional_id=professional_id)
        serializer = AvailabilitySerializer(availabilities, many=True)
        return Response(serializer.data)