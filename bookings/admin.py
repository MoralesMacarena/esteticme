from django.contrib import admin
from .models import Service, Booking, Availability, Review, Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """
    Configuración del panel de administración para las categorías de servicios.
    """
    list_display = ('name', 'icon')


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    """
    Configuración del panel de administración para los servicios.
    Añade filtros y columnas visibles para facilitar la gestión.
    """
    list_display = ('name', 'category', 'professional', 'price', 'is_active')
    list_filter = ('category', 'is_active', 'professional')


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    """
    Configuración del panel de administración para las reservas.
    Incluye una función personalizada para mostrar campos ManyToMany (servicios)
    directamente en la tabla principal.
    """
    list_display = ('client', 'professional', 'booking_date', 'start_time', 'status', 'get_services')
    list_filter = ('status', 'booking_date', 'professional') 
    search_fields = ('guest_name', 'professional__business_name') 

    def get_services(self, obj):
        """
        Concatena y devuelve los nombres de todos los servicios asociados a la cita.
        Requerido porque Django no permite mostrar campos ManyToMany directamente en list_display.
        """
        return ", ".join([service.name for service in obj.services.all()])
    
    get_services.short_description = 'Servicios'


@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    """
    Configuración del panel de administración para la disponibilidad (horarios).
    """
    list_display = ('professional', 'day_of_week', 'start_time', 'end_time')
    list_filter = ('day_of_week', 'professional')


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    """
    Configuración del panel de administración para las reseñas.
    """
    list_display = ('booking', 'rating', 'created_at')
    list_filter = ('rating',)