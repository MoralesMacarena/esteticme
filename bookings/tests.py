from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model

class BookingSecurityTests(APITestCase):
    def test_unauthenticated_user_cannot_access_bookings(self):
        """
        Prueba que un usuario sin token JWT reciba un error 401
        al intentar acceder al endpoint de citas utilizando reverse.
        """
        # Genera automáticamente la ruta basándose en el basename del router
        url = reverse('booking-list') 
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)



User = get_user_model()

class BookingCreationTests(APITestCase):
    def setUp(self):
        # Preparamos un usuario de prueba antes de ejecutar el test
        self.user = User.objects.create_user(username='test_client', password='strongpassword123')
        # Forzamos la autenticación para simular el token JWT
        self.client.force_authenticate(user=self.user)

    def test_create_valid_booking(self):
        """
        Prueba que un usuario autenticado puede agendar una cita correctamente.
        """
        url = '/api/bookings/citas/'
        payload = {
            "booking_date": "2026-06-15",
            "start_time": "10:00",
            "status": "confirmed",
            "guest_name": "Invitado Prueba"
            # Añade 'service_id' o 'professional' si son obligatorios en tu modelo
        }
        
        response = self.client.post(url, payload, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['guest_name'], "Invitado Prueba")