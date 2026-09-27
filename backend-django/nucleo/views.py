from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Comercio, Categoria
from .serializers import ComercioSerializer, CategoriaSerializer, UsuarioSerializer
from django.contrib.auth import get_user_model

Usuario = get_user_model()

class RegistroView(generics.CreateAPIView):
    queryset = Usuario.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UsuarioSerializer

class ComercioViewSet(viewsets.ModelViewSet):
    queryset = Comercio.objects.all()
    serializer_class = ComercioSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        # Por ahora asumimos que el usuario que lo crea tiene un PerfilComerciante.
        # Esto se ajustará con los permisos específicos más adelante.
        if hasattr(self.request.user, 'perfil_comerciante'):
            serializer.save(propietario=self.request.user.perfil_comerciante)
        else:
            raise Exception("El usuario no tiene un perfil de comerciante.")
