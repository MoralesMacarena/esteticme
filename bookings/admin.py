from django.contrib import admin
from .models import Service, Booking, Availability, Review, Category

# 1. Servicios
admin.site.register(Category)

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'professional', 'price', 'is_active') # Añadimos category a la lista
    list_filter = ('category', 'is_active', 'professional')

# 2. Reservas
@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('client', 'professional', 'service', 'booking_date', 'start_time', 'status')
    list_filter = ('status', 'booking_date')
    search_fields = ('client__email', 'service__name')

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