from django.db import models
from django.conf import settings # Para poder enlazar con tu CustomUser

class Category(models.Model):
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=50, help_text="Nombre del icono de Google Fonts (ej: 'face', 'content_cut')")

    def __str__(self):
        return self.name

class Service(models.Model):
    # Relacionamos el servicio con el usuario que lo ofrece (el profesional)
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
    is_active = models.BooleanField(default=True) # TINYINT(1) en tu diagrama

    # Así se mostrará el nombre del servicio en el panel de administración
    def __str__(self):
        return f"{self.name} ({self.duration_minutes} min)"
    
class Booking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pendiente'),
        ('confirmed', 'Confirmada'),
        ('completed', 'Terminada'),
        ('cancelled', 'Cancelada'),
    )

    # 1. Añadimos null=True y blank=True para que el cliente web no sea obligatorio
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='client_bookings', 
        null=True, 
        blank=True
    )
    
    # 2. Añadimos este campo nuevo para las citas manuales/por teléfono
    guest_name = models.CharField(
        max_length=100, 
        blank=True, 
        null=True, 
        help_text="Nombre para citas sin cuenta web"
    )
    
    professional = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='professional_bookings'
    )
    
    # Hemos dejado solo UNA línea de services (Many-to-Many)
    services = models.ManyToManyField(Service, related_name='bookings')
    
    booking_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        # Prevenimos el error: si hay cliente web mostramos su email, si no, el nombre manual
        nombre = self.client.email if self.client else self.guest_name
        return f"Reserva de {nombre} el {self.booking_date}"

class Availability(models.Model):
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
        # Esto evita que un profesional ponga dos horarios distintos el mismo día
        unique_together = ('professional', 'day_of_week')

    def __str__(self):
        return f"Horario de {self.professional.email} - {self.get_day_of_week_display()}"

class Review(models.Model):
    RATING_CHOICES = (
        (1, '⭐ (1/5)'), (2, '⭐⭐ (2/5)'), (3, '⭐⭐⭐ (3/5)'),
        (4, '⭐⭐⭐⭐ (4/5)'), (5, '⭐⭐⭐⭐⭐ (5/5)')
    )

    # Relacionamos la reseña con la reserva
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(choices=RATING_CHOICES)
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        # Protegemos también las reseñas por si algún cliente sin cuenta dejara una en el futuro
        nombre = self.booking.client.email if self.booking.client else self.booking.guest_name
        return f"Reseña de {nombre} - Nota: {self.rating}"