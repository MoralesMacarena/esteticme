# users/backends.py
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()

class EmailOrUsernameModelBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        # Si el username viene vacío, intentamos pillarlo de los kwargs
        if username is None:
            username = kwargs.get(User.USERNAME_FIELD)
        
        try:
            # Buscamos si el texto introducido coincide con el 'username' o con el 'email'
            user = User.objects.get(Q(username=username) | Q(email=username))
        except User.DoesNotExist:
            # Si no existe, no hacemos nada
            return None
        
        # Si existe, comprobamos que la contraseña sea correcta
        if user.check_password(password) and self.user_can_authenticate(user):
            return user