from django.db.models import Q

from rest_framework import viewsets, generics, status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from bookings.models import Booking
from .models import CustomUser, SalonImage
from .serializers import CustomTokenObtainPairSerializer, UserSerializer


class RegisterView(generics.CreateAPIView):
    """
    Vista de la API para gestionar el registro de nuevos usuarios (clientes o profesionales).
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class LoginView(TokenObtainPairView):
    """
    Vista de la API para gestionar la autenticación de usuarios y generación de tokens JWT.
    """
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet para la gestión de perfiles de usuario. 
    Proporciona operaciones CRUD estándar y un endpoint personalizado (me) 
    para que el usuario autenticado gestione su propio perfil y galería de imágenes.
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    
    @action(detail=False, methods=['GET', 'PATCH'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """
        Recupera o actualiza el perfil del usuario actualmente autenticado.
        Gestiona la actualización de datos textuales, eliminación y subida de nuevas imágenes a la galería.
        """
        user = request.user

        if request.method == 'GET':
            serializer = self.get_serializer(user)
            return Response(serializer.data)

        elif request.method == 'PATCH':
            serializer = self.get_serializer(user, data=request.data, partial=True)
            
            if serializer.is_valid():
                user = serializer.save()
                
                # Eliminación de imágenes de la galería solicitadas (asegurando la propiedad)
                images_to_delete = request.data.getlist('delete_gallery_images')
                if images_to_delete:
                    SalonImage.objects.filter(id__in=images_to_delete, professional=user).delete()
                
                # Procesamiento y guardado de nuevas imágenes para la galería
                gallery_files = request.FILES.getlist('gallery_images')
                for image in gallery_files:
                    SalonImage.objects.create(professional=user, image=image)
                
                return Response(self.get_serializer(user).data)
                
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfessionalViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet de solo lectura para listar perfiles profesionales (salones) en el directorio público.
    Incluye capacidades de filtrado complejo por nombre de negocio, descripción, dirección o servicios.
    """
    serializer_class = UserSerializer

    def get_queryset(self):
        """
        Filtra el QuerySet para incluir solo profesionales activos y aplica
        filtros de búsqueda si se proporciona el parámetro 'search' en la URL.
        """
        queryset = CustomUser.objects.filter(role='professional', is_active=True)
        search_query = self.request.query_params.get('search', None)
        
        if search_query:
            queryset = queryset.filter(
                Q(business_name__icontains=search_query) | 
                Q(description__icontains=search_query) |
                Q(services__name__icontains=search_query) |
                Q(business_address__icontains=search_query)     
            ).distinct() 
            
        return queryset


class AdminDashboardStatsView(APIView):
    """
    Vista de la API que proporciona métricas y estadísticas de la plataforma para el panel de control.
    Acceso restringido exclusivamente a usuarios con privilegios de administrador.
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        """
        Agrega los conteos totales de usuarios, profesionales y reservas,
        junto con un resumen de los 5 profesionales registrados más recientemente.
        """
        total_users = CustomUser.objects.count()
        total_professionals = CustomUser.objects.filter(role='professional').count()
        total_bookings = Booking.objects.count() 

        latest_pros = CustomUser.objects.filter(role='professional').order_by('-date_joined')[:5]
        
        latest_pros_data = [
            {
                "id": pro.id,
                "business_name": pro.business_name or pro.full_name,
                "date_joined": pro.date_joined.strftime("%d/%m/%Y")
            } for pro in latest_pros
        ]

        return Response({
            "total_users": total_users,
            "total_professionals": total_professionals,
            "total_bookings": total_bookings,
            "latest_professionals": latest_pros_data
        })