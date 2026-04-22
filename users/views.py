from rest_framework import viewsets
from .models import CustomUser
from .serializers import UserSerializer
from django.db.models import Q

# 1. Tu ViewSet original (Ideal para un panel de administración interno)
class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    # Aquí en el futuro añadiríamos: permission_classes = [IsAdminUser]

# 2. EL NUEVO VIEWSET PARA REACT (Público y Seguro)
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
                Q(services__name__icontains=search_query) # Busca servicios asociados
            ).distinct() # distinct() evita que salgan duplicados si el texto coincide en varios sitios
            
        return queryset