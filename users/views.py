from rest_framework import viewsets, generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import Q
from .models import CustomUser
from .serializers import CustomTokenObtainPairSerializer, UserSerializer

# 1. VISTA DE REGISTRO (La que faltaba)
class RegisterView(generics.CreateAPIView):
    """
    Permite crear nuevos usuarios (clientes o profesionales).
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny] # Cualquier persona puede registrarse

# 2. VISTA DE LOGIN (La que faltaba)
# users/views.py
class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer # <-- Añade esta línea
    permission_classes = [AllowAny]

# 3. Tu ViewSet original (Administración y perfil personal)
class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    
    @action(detail=False, methods=['GET', 'PATCH'], permission_classes=[IsAuthenticated])
    def me(self, request):
        # 'request.user' tiene al usuario que ha hecho la petición con su token
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

# 4. VIEWSET PARA REACT (Público y Seguro)
class ProfessionalViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para listar salones con capacidad de búsqueda.
    """
    serializer_class = UserSerializer

    def get_queryset(self):
        # 1. Empezamos con todos los profesionales activos
        queryset = CustomUser.objects.filter(role='professional', is_active=True)
        
        # 2. Capturamos el parámetro 'search' de la URL (ej: ?search=corte)
        search_query = self.request.query_params.get('search', None)
        
        if search_query:
            # 3. Filtramos por nombre de negocio O descripción O nombre de servicios
            queryset = queryset.filter(
                Q(business_name__icontains=search_query) | 
                Q(description__icontains=search_query) |
                Q(services__name__icontains=search_query) 
            ).distinct() 
            
        return queryset