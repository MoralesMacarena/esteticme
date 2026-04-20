from django.contrib import admin
from .models import Service, Booking, Availability, Review, Category

# 1. Servicios
admin.site.register(Category)

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'professional', 'price', 'is_active') # Añadimos category a la lista
    list_filter = ('category', 'is_active', 'professional')

# 2. Reservas

class BookingAdmin(admin.ModelAdmin):
    # 1. Quitamos 'service' de la lista y ponemos nuestra función inventada 'get_services'
    list_display = ('client', 'professional', 'booking_date', 'start_time', 'status', 'get_services')
    
    # ... si tienes search_fields o list_filter, déjalos como los tenías ...

    # 2. Creamos esta pequeña función mágica para mostrar los servicios como texto separado por comas
    def get_services(self, obj):
        # Recorre los servicios elegidos y une sus nombres con una coma
        return ", ".join([service.name for service in obj.services.all()])
    
    # Le ponemos el nombre bonito a la columna
    get_services.short_description = 'Servicios'

admin.site.register(Booking, BookingAdmin)

# 3. Disponibilidad (Horarios)
@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    list_display = ('professional', 'day_of_week', 'start_time', 'end_time')
    list_filter = ('day_of_week',)

# 4. Reseñas
@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('booking', 'rating', 'created_at')
    list_filter = ('rating',)