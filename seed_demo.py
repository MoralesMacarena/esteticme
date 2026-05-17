import os
import django
from datetime import date, time, timedelta

# Configuración de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings') 
django.setup()

# PASO 1: Importamos todos tus modelos exactos
from django.contrib.auth import get_user_model
from bookings.models import Category, Service, Availability, Booking, Review
from blog.models import Post, Comment

User = get_user_model()

def create_demo():
    print("🧹 1. Limpiando la base de datos...")
    User.objects.all().delete()
    Category.objects.all().delete()
    Post.objects.all().delete()

    print("👑 2. Creando Super Administrador...")
    admin = User.objects.create_superuser(
        username='admin',
        email='admin@esteticme.com',
        password='adminpassword123',
        full_name='Admin General',
        role='admin'
    )

    print("💇 3. Creando Profesionales...")
    pro_luxe = User.objects.create_user(
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

    pro_barber = User.objects.create_user(
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

    print("👥 4. Creando Clientes con Puntos de Fidelidad...")
    cliente_marta = User.objects.create_user(
        username='cliente_marta',
        email='marta@gmail.com',
        password='userpassword123',
        full_name='Marta Sánchez',
        role='client',
        phone='655999888',
        points=500  # Puntos para gastar en la demo
    )

    cliente_pablo = User.objects.create_user(
        username='cliente_pablo',
        email='pablo@hotmail.com',
        password='userpassword123',
        full_name='Pablo López',
        role='client',
        phone='644777666',
        points=25   # Puntos iniciales
    )

    print("🏷️ 5. Creando Categorías...")
    cat_peluqueria = Category.objects.create(name='Peluquería', icon='content_cut')
    cat_estetica = Category.objects.create(name='Estética', icon='spa')
    cat_barberia = Category.objects.create(name='Barbería', icon='face')
    cat_bienestar = Category.objects.create(name='Bienestar', icon='self_care')

    print("💆‍♀️ 6. Creando Servicios...")
    serv_corte = Service.objects.create(
        professional=pro_barber,
        category=cat_barberia,
        name='Corte Clásico + Arreglo de Barba',
        description='Corte a tijera o máquina, incluye perfilado de barba con toalla caliente.',
        price=25.00,
        duration_minutes=45
    )
    
    serv_limpieza = Service.objects.create(
        professional=pro_luxe,
        category=cat_estetica,
        name='Limpieza Facial Profunda',
        description='Tratamiento purificante con extracción, exfoliación y mascarilla calmante.',
        price=60.00,
        duration_minutes=60
    )

    print("📅 7. Configurando Horarios (Availability)...")
    for dia in range(5):
        Availability.objects.create(
            professional=pro_barber,
            day_of_week=dia,
            start_time=time(9, 0),
            end_time=time(14, 0)
        )
        # Añadimos horario a Luxe Beauty también para poder hacer la demo de reservas
        Availability.objects.create(
            professional=pro_luxe,
            day_of_week=dia,
            start_time=time(10, 0),
            end_time=time(19, 0)
        )

    print("📝 8. Creando Reservas...")
    fecha_manana = date.today() + timedelta(days=1)
    fecha_pasada = date.today() - timedelta(days=5)
    
    # Reserva Futura de Pablo (Barbería)
    reserva_pablo_futura = Booking.objects.create(
        client=cliente_pablo,
        professional=pro_barber,
        booking_date=fecha_manana,
        start_time=time(10, 0),
        end_time=time(10, 45),
        status='confirmed',
        total_price=25.00,
        points_earned=25
    )
    reserva_pablo_futura.services.add(serv_corte)

    # Reserva Pasada de Pablo (Luxe Beauty) -> Para poder ponerle reseña
    reserva_pablo_pasada = Booking.objects.create(
        client=cliente_pablo,
        professional=pro_luxe,
        booking_date=fecha_pasada,
        start_time=time(11, 0),
        end_time=time(12, 0),
        status='completed',
        total_price=60.00,
        points_earned=60
    )
    reserva_pablo_pasada.services.add(serv_limpieza)

    # Reserva Pasada de Marta (Luxe Beauty) -> Corrección Matemática Aplicada
    reserva_marta = Booking.objects.create(
        client=cliente_marta,
        professional=pro_luxe,
        booking_date=date.today(),
        start_time=time(17, 0),
        end_time=time(18, 0),
        status='completed',
        total_price=55.00,     # Costaba 60, paga 55
        points_used=500,       # Gasta 500 puntos exactos (5€)
        discount_amount=5.00,  # Descuento de 5€
        points_earned=55       # Gana puntos por lo pagado
    )
    reserva_marta.services.add(serv_limpieza)

    print("⭐ 9. Creando Reseñas de 5 Estrellas...")
    Review.objects.create(
        booking=reserva_marta,
        rating=5,
        comment='¡Increíble! El trato de Elena es inmejorable y el tratamiento me dejó la piel perfecta. Repetiré sin duda.'
    )
    
    Review.objects.create(
        booking=reserva_pablo_pasada,
        rating=5,
        comment='Fui para prepararme para un evento y el resultado fue espectacular. 100% recomendable.'
    )

    print("📰 10. Creando Posts para el Magazine...")
    post1 = Post.objects.create(
        author=pro_barber.full_name,
        title='Tendencias en cortes de pelo para este verano',
        slug='tendencias-cortes-verano',
        category=cat_barberia,
        content='<p>El verano ya está aquí y con él llegan las nuevas tendencias...</p><h2>El corte Fade</h2><p>Sigue siendo el rey indiscutible en las barberías, ideal para combatir el calor manteniendo el estilo.</p>',
        is_published=True,
        image='https://images.unsplash.com/photo-1585747685350-31c216327617'
    )

    post2 = Post.objects.create(
        author='Equipo EsteticMe',
        title='Beneficios de la limpieza facial mensual',
        slug='beneficios-limpieza-facial',
        category=cat_estetica,
        content='<p>Nuestra piel está expuesta diariamente a la contaminación.</p><p>Realizar una limpieza profunda ayuda a prevenir el envejecimiento prematuro, elimina toxinas y devuelve la luminosidad natural a tu rostro.</p><blockquote>Invertir en tu piel es invertir en tu salud.</blockquote>',
        is_published=True,
        image='https://images.unsplash.com/photo-1570172619644-dfd03ed5d881'
    )

    print("💬 11. Añadiendo Comentarios al Magazine...")
    Comment.objects.create(
        post=post1,
        user=cliente_pablo,
        comment='¡Totalmente de acuerdo! El mes que viene me animo con el fade.'
    )
    
    Comment.objects.create(
        post=post2,
        user=cliente_marta,
        comment='Desde que voy una vez al mes noto la piel muchísimo más luminosa. ¡Gracias por los consejos!'
    )

    print("\n✅ ¡BASE DE DATOS DEMO GENERADA CON ÉXITO!")
    print("-" * 40)
    print("Ya puedes hacer login con:")
    print("Admin: admin@esteticme.com / adminpassword123")
    print("Profesional: contacto@luxebeauty.com / propassword123")
    print("Cliente: marta@gmail.com / userpassword123")
    print("-" * 40)

if __name__ == '__main__':
    create_demo()