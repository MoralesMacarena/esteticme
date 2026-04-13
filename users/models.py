from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    # Opciones para tu campo ENUM de roles
    ROLE_CHOICES = (
        ('client', 'Cliente'),
        ('professional', 'Profesional'),
        ('admin', 'Administrador'),
    )

    # Django ya  crea los campos 'id' y 'password' automáticamente en secreto
    
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client')
    full_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    
    # Campos exclusivos para profesionales (pueden quedar vacíos para los clientes)
    business_name = models.CharField(max_length=150, blank=True, null=True)
    business_address = models.TextField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    salon_picture = models.ImageField(upload_to='salons/', blank=True, null=True)
    

    # Le decimos a Django que queremos ver el email cuando busquemos un usuario
    def __str__(self):
        return self.email