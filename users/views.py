from rest_framework import viewsets
from .models import CustomUser
from .serializers import UserSerializer

# 1. Tu ViewSet original (Ideal para un panel de administración interno)
class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    # Aquí en el futuro añadiríamos: permission_classes = [IsAdminUser]

# 2. EL NUEVO VIEWSET PARA REACT (Público y Seguro)
class ProfessionalViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Este ViewSet es de Solo Lectura (ReadOnly). 
    Nadie puede borrar ni crear usuarios desde esta URL.
    Además, filtramos para que SOLO devuelva a los profesionales activos.
    """
    queryset = CustomUser.objects.filter(role='professional', is_active=True)
    serializer_class = UserSerializer