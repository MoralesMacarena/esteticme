from django.db import models
from django.conf import settings


class Category(models.Model):
    """
    Modelo para clasificar los diferentes servicios estéticos.
    Utiliza iconos de Google Fonts para la representación visual en el frontend.
    """
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=50, help_text="Nombre del icono de Google Fonts (ej: 'face', 'content_cut')")

    def __str__(self):
        return self.name


class Service(models.Model):
    """
    Modelo que representa un tratamiento o servicio ofrecido por un profesional.
    """
    professional = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='services'
    )
    category = models.ForeignKey(
        Category, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='services'
    )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_minutes = models.IntegerField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.duration_minutes} min)"
    

class Booking(models.Model):
    """
    Modelo central de la aplicación para gestionar las citas.
    Soporta tanto reservas de clientes registrados (vía plataforma) como 
    reservas manuales introducidas por el profesional (clientes invitados).
    Incluye campos para el registro del sistema de fidelización y descuentos.
    """
    STATUS_CHOICES = (
        ('pending', 'Pendiente'),
        ('confirmed', 'Confirmada'),
        ('completed', 'Terminada'),
        ('cancelled', 'Cancelada'),
    )

    # Cliente registrado (puede ser nulo para permitir citas manuales)
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='client_bookings', 
        null=True, 
        blank=True
    )
    
    # Datos para clientes sin cuenta en la plataforma
    guest_name = models.CharField(
        max_length=100, 
        blank=True, 
        null=True, 
        help_text="Nombre para citas sin cuenta web"
    )
    guest_phone = models.CharField(max_length=20, blank=True, null=True)
    
    professional = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='professional_bookings'
    )
    
    services = models.ManyToManyField(Service, related_name='bookings')
    
    booking_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Sistema de Fidelización
    points_used = models.IntegerField(default=0, help_text="Puntos que el cliente gastó en esta reserva")
    discount_amount = models.DecimalField(max_digits=6, decimal_places=2, default=0.00, help_text="Dinero descontado por los puntos")
    points_earned = models.IntegerField(default=0, help_text="Puntos que ganó por esta reserva")

    def __str__(self):
        """
        Muestra el email si es un cliente registrado, o el nombre manual si es invitado.
        """
        nombre = self.client.email if self.client else self.guest_name
        return f"Reserva de {nombre} el {self.booking_date}"


class Availability(models.Model):
    """
    Modelo para configurar el horario laboral de los profesionales.
    Evita la duplicidad de horarios para el mismo día de la semana.
    """
    DAYS_OF_WEEK = (
        (0, 'Lunes'), (1, 'Martes'), (2, 'Miércoles'),
        (3, 'Jueves'), (4, 'Viernes'), (5, 'Sábado'), (6, 'Domingo')
    )

    professional = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='availabilities'
    )
    day_of_week = models.IntegerField(choices=DAYS_OF_WEEK)
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        unique_together = ('professional', 'day_of_week')

    def __str__(self):
        return f"Horario de {self.professional.email} - {self.get_day_of_week_display()}"


class Review(models.Model):
    """
    Modelo para almacenar las valoraciones y reseñas de las citas finalizadas.
    """
    RATING_CHOICES = (
        (1, '⭐ (1/5)'), (2, '⭐⭐ (2/5)'), (3, '⭐⭐⭐ (3/5)'),
        (4, '⭐⭐⭐⭐ (4/5)'), (5, '⭐⭐⭐⭐⭐ (5/5)')
    )

    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(choices=RATING_CHOICES)
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        nombre = self.booking.client.email if self.booking.client else self.booking.guest_name
        return f"Reseña de {nombre} - Nota: {self.rating}"