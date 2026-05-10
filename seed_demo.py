import os
import django

# Configuración de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings') # Cambia 'core' si tu carpeta principal se llama distinto
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def create_demo():
    print("🧹 Limpiando base de datos de usuarios...")
    User.objects.all().delete()

    print("👑 Creando Super Administrador...")
    User.objects.create_superuser(
        username='admin',
        email='admin@esteticme.com',
        password='adminpassword123',
        full_name='Admin General',
        role='admin'
    )

    print("💇 Creando Profesionales...")
    # Profesional 1
    User.objects.create_user(
        username='salon_luxe',
        email='contacto@luxebeauty.com',
        password='propassword123',
        full_name='Elena Rodríguez',
        role='professional',
        phone='600111222',
        business_name='Luxe Beauty & Spa',
        business_address='Calle Velázquez, 45, Madrid',
        description='Especialistas en tratamientos faciales de alta gama y microblading.'
    )

    # Profesional 2
    User.objects.create_user(
        username='barber_shop',
        email='info@thebarber.com',
        password='propassword123',
        full_name='Marcos García',
        role='professional',
        phone='600333444',
        business_name='The Classic Barber',
        business_address='Avenida de la Constitución, 12, Sevilla',
        description='Barbería tradicional con técnicas modernas. Corte, barba y cuidado masculino.'
    )

    print("👥 Creando Clientes...")
    User.objects.create_user(
        username='cliente_marta',
        email='marta@gmail.com',
        password='userpassword123',
        full_name='Marta Sánchez',
        role='client',
        phone='655999888'
    )

    User.objects.create_user(
        username='cliente_pablo',
        email='pablo@hotmail.com',
        password='userpassword123',
        full_name='Pablo López',
        role='client',
        phone='644777666'
    )

    print("\n✅ ¡Usuarios demo creados con éxito!")
    print("-" * 30)
    print("Admin: admin@esteticme.com / adminpassword123")
    print("Pro 1: contacto@luxebeauty.com / propassword123")
    print("Cliente 1: marta@gmail.com / userpassword123")

if __name__ == '__main__':
    create_demo()