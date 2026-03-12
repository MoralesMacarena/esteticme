from django.db import models
from django.conf import settings # Para poder enlazar con tu CustomUser

class Service(models.Model):
    # Relacionamos el servicio con el usuario que lo ofrece (el profesional)
    professional = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
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
    # Opciones para tu campo ENUM de estado
    STATUS_CHOICES = (
        ('pending', 'Pendiente'),
        ('confirmed', 'Confirmada'),
        ('cancelled', 'Cancelada'),
    )

    # El cliente que reserva
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='client_bookings'
    )
    # El profesional que da el servicio
    professional = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='professional_bookings'
    )
    # El servicio elegido
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    
    # Fechas y horas
    booking_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True) # Se rellena solo al crearla

    def __str__(self):
        return f"Reserva de {self.client.email} para {self.service.name}"

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

    # Relacionamos la reseña con la reserva (como en tu diagrama)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(choices=RATING_CHOICES)
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reseña de {self.booking.client.email} - Nota: {self.rating}"
