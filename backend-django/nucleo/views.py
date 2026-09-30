from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly, IsAuthenticatedOrReadOnly
from .models import Comercio, Categoria
from .serializers import ComercioSerializer, CategoriaSerializer, UsuarioSerializer
from django.contrib.auth import get_user_model

Usuario = get_user_model()

from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Añadir datos extra para el frontend Next.js
        roles = []
        if getattr(self.user, 'perfil_comerciante', None):
            roles.append('comerciante')
        if getattr(self.user, 'is_superuser', False):
            roles.append('superadmin')
            
        if not roles:
            roles.append('cliente')

        return {
            'token': data['access'],
            'refresh': data['refresh'],
            'nombre': self.user.username,
            'email': self.user.email,
            'roles': roles,
            'userId': self.user.id
        }

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegistroView(generics.CreateAPIView):
    queryset = Usuario.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UsuarioSerializer
    
    def create(self, request, *args, **kwargs):
        data = request.data
        username = data.get('nombre', data.get('email', ''))
        email = data.get('email', '')
        password = data.get('password', '')
        tipo = data.get('tipoUsuario', 'cliente')

        if not username or not password:
            return Response({"error": "Faltan datos requeridos."}, status=400)

        if Usuario.objects.filter(username=username).exists():
            return Response({"error": "El usuario ya existe."}, status=400)

        user = Usuario.objects.create_user(username=username, email=email, password=password)
        
        roles = []
        if tipo == 'comerciante':
            roles.append('comerciante')
            # Crear perfil (se debería importar PerfilComerciante pero simplificamos)
        else:
            roles.append('cliente')

        refresh = RefreshToken.for_user(user)
        return Response({
            "token": str(refresh.access_token),
            "nombre": user.username,
            "email": user.email,
            "roles": roles,
            "userId": user.id
        }, status=201)

from rest_framework.decorators import action

class ComercioViewSet(viewsets.ModelViewSet):
    queryset = Comercio.objects.all()
    serializer_class = ComercioSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def mis_tiendas(self, request):
        if hasattr(request.user, 'perfil_comerciante'):
            comercios = self.queryset.filter(propietario=request.user.perfil_comerciante)
            serializer = self.get_serializer(comercios, many=True)
            return Response(serializer.data)
        return Response([])

    def perform_create(self, serializer):
        from .models import PerfilComerciante
        perfil, created = PerfilComerciante.objects.get_or_create(
            usuario=self.request.user,
            defaults={'cuit': f'00-{self.request.user.id}-0'}
        )
        serializer.save(propietario=perfil)

class CategoriaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [AllowAny]
