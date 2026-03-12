from django.contrib import admin
from .models import Service, Booking 

admin.site.register(Service)


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    # Las columnas que se verán en la tabla principal
    list_display = ('client', 'professional', 'service', 'booking_date', 'start_time', 'status')
    # Filtros laterales mágicos
    list_filter = ('status', 'booking_date')
    # Barra de búsqueda (buscará por el email del cliente o el nombre del servicio)
    search_fields = ('client__email', 'service__name')