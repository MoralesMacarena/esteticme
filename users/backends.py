from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
from django.db.models import Q

User = get_user_model()


class EmailOrUsernameModelBackend(ModelBackend):
    """
    Backend de autenticación personalizado que permite a los usuarios
    iniciar sesión en la plataforma utilizando tanto su nombre de usuario 
    (username) como su dirección de correo electrónico (email).
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        """
        Verifica las credenciales del usuario. Busca en la base de datos 
        una coincidencia exacta ya sea en el campo 'username' o en 'email'.
        Si lo encuentra y la contraseña es válida, devuelve el objeto usuario.
        """
        if username is None:
            username = kwargs.get(User.USERNAME_FIELD)
        
        try:
            user = User.objects.get(Q(username=username) | Q(email=username))
        except User.DoesNotExist:
            return None
        
        if user.check_password(password) and self.user_can_authenticate(user):
            return user