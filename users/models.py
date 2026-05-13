from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    """
    Modelo de usuario personalizado que extiende AbstractUser.
    Soporta roles (cliente, profesional, administrador) y contiene 
    campos adicionales tanto para el perfil personal como para los 
    datos de negocio de los profesionales.
    """
    ROLE_CHOICES = (
        ('client', 'Cliente'),
        ('professional', 'Profesional'),
        ('admin', 'Administrador'),
    )

    # Campos base del usuario
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client')
    full_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    
    # Campos exclusivos para profesionales
    business_name = models.CharField(max_length=150, blank=True, null=True)
    business_address = models.TextField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    salon_picture = models.ImageField(upload_to='salons/', blank=True, null=True)
    points = models.IntegerField(default=0, help_text="Puntos de fidelidad acumulados")
    
    def __str__(self):
        """
        Representación en cadena del usuario, utilizando el correo electrónico
        para facilitar su búsqueda en el panel de administración.
        """
        return self.email


class SalonImage(models.Model):
    """
    Modelo para almacenar las imágenes de la galería asociadas a un profesional.
    Permite a los profesionales (salones) subir múltiples fotos de sus trabajos.
    """
    professional = models.ForeignKey(
        'CustomUser',
        on_delete=models.CASCADE,
        related_name='gallery_images',
        limit_choices_to={'role': 'professional'}
    )
    
    image = models.ImageField(upload_to='salon_gallery/')
    alt_text = models.CharField(max_length=100, blank=True, null=True)
    is_cover = models.BooleanField(default=False, help_text="¿Es la foto principal de la galería?")
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        """
        Representación en cadena de la imagen, mostrando el nombre de negocio
        del profesional (o su nombre completo si no tiene negocio).
        """
        name = self.professional.business_name or self.professional.full_name
        return f"Foto de galería - {name}"