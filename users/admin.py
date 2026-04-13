from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    # 1. Columnas de la lista principal
    list_display = ('email', 'full_name', 'role', 'is_staff', 'business_name', 'is_active')
    list_editable = ('role', 'is_active') # Para cambiar roles sin entrar al usuario
    search_fields = ('email', 'full_name', 'business_name')
    list_filter = ('role', 'is_staff', 'is_active')
    ordering = ('email',)

    # 2. FORMULARIO DE EDICIÓN 
    fieldsets = UserAdmin.fieldsets + (
        ('Información Personal EsteticMe', {
            'fields': ('role', 'full_name', 'phone', 'profile_picture') # <-- Añadida foto perfil
        }),
        ('Datos del Salón (Solo Profesionales)', {
            'fields': ('business_name', 'business_address', 'description', 'salon_picture') # <-- Añadida foto salón
        }),
    )

    # 3. FORMULARIO DE CREACIÓN 
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Información Básica Obligatoria', {
            'fields': ('email', 'full_name', 'role', 'phone', 'profile_picture'),
        }),
        ('Datos Profesionales Iniciales', {
            'classes': ('collapse',), 
            'fields': ('business_name', 'business_address', 'salon_picture'),
        }),
    )

# Registramos el modelo con la configuración nueva
admin.site.register(CustomUser, CustomUserAdmin)