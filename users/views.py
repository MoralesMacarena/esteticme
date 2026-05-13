from rest_framework import viewsets, generics, status
from rest_framework.views import APIView # <-- NUEVO: Para crear vistas personalizadas sueltas
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser # <-- NUEVO: Añadido IsAdminUser
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import Q
from .models import CustomUser, SalonImage
from .serializers import CustomTokenObtainPairSerializer, UserSerializer

# <-- NUEVO: Importamos el modelo de Citas/Reservas
# OJO: Si tu modelo se llama "Cita" o está en otra app, cámbialo aquí.
from bookings.models import Booking 

# 1. VISTA DE REGISTRO
class RegisterView(generics.CreateAPIView):
    """
    Permite crear nuevos usuarios (clientes o profesionales).
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny] # Cualquier persona puede registrarse

# 2. VISTA DE LOGIN
class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]

# 3. Tu ViewSet original (Administración y perfil personal)
class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    
    @action(detail=False, methods=['GET', 'PATCH'], permission_classes=[IsAuthenticated])
    def me(self, request):
        user = request.user

        # SI ES GET: Solo devolvemos los datos
        if request.method == 'GET':
            serializer = self.get_serializer(user)
            return Response(serializer.data)

        # SI ES PATCH: Guardamos los cambios y las fotos
        elif request.method == 'PATCH':
            # 1. Guardamos el texto y la foto principal
            serializer = self.get_serializer(user, data=request.data, partial=True)
            
            if serializer.is_valid():
                user = serializer.save()
                
                # --- ¡LO NUEVO! 2. BORRAMOS LAS FOTOS MARCADAS ---
                images_to_delete = request.data.getlist('delete_gallery_images')
                if images_to_delete:
                    # Añadimos professional=user por seguridad (¡para que nadie borre fotos de otro!)
                    SalonImage.objects.filter(id__in=images_to_delete, professional=user).delete()
                
                # 3. Atrapamos TODAS las fotos de la galería NUEVAS
                gallery_files = request.FILES.getlist('gallery_images')
                
                # 4. Guardamos cada foto extra en el modelo SalonImage
                for image in gallery_files:
                    SalonImage.objects.create(professional=user, image=image)
                
                # Refrescamos los datos para devolverle a React la galería actualizada
                return Response(self.get_serializer(user).data)
                
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# 4. VIEWSET PARA REACT (Público y Seguro)
class ProfessionalViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para listar salones con capacidad de búsqueda.
    """
    serializer_class = UserSerializer

    def get_queryset(self):
        # 1. Empezamos con todos los profesionales activos
        queryset = CustomUser.objects.filter(role='professional', is_active=True)
        
        # 2. Capturamos el parámetro 'search' de la URL (ej: ?search=Madrid)
        search_query = self.request.query_params.get('search', None)
        
        if search_query:
            queryset = queryset.filter(
                Q(business_name__icontains=search_query) | 
                Q(description__icontains=search_query) |
                Q(services__name__icontains=search_query) |
                Q(business_address__icontains=search_query)     
            ).distinct() 
            
        return queryset

# --------------------------------------------------------
# 5. VISTA DEL DASHBOARD ADMIN (¡LO NUEVO DE HOY!)
# --------------------------------------------------------
class AdminDashboardStatsView(APIView):
    # El portero: solo deja pasar a administradores
    permission_classes = [IsAdminUser]

    def get(self, request):
        # 1. Contamos los usuarios y profesionales (usamos CustomUser que ya está importado arriba)
        total_users = CustomUser.objects.count()
        total_professionals = CustomUser.objects.filter(role='professional').count()
        
        # Contamos las citas 
        total_bookings = Booking.objects.count() 

        # 2. Obtenemos los últimos 5 profesionales registrados
        latest_pros = CustomUser.objects.filter(role='professional').order_by('-date_joined')[:5]
        
        # Preparamos la lista para enviarla al Frontend
        latest_pros_data = [
            {
                "id": pro.id,
                "business_name": pro.business_name or pro.full_name, # Si no tiene nombre de negocio, usamos su nombre
                "date_joined": pro.date_joined.strftime("%d/%m/%Y")
            } for pro in latest_pros
        ]

        # 3. Empaquetamos todo en un JSON y lo enviamos
        return Response({
            "total_users": total_users,
            "total_professionals": total_professionals,
            "total_bookings": total_bookings,
            "latest_professionals": latest_pros_data
        })