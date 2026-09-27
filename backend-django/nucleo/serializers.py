from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Comercio, Categoria, Rol, PerfilComerciante

Usuario = get_user_model()

class UsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        user = Usuario.objects.create_user(**validated_data)
        return user

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

class ComercioSerializer(serializers.ModelSerializer):
    categorias = CategoriaSerializer(many=True, read_only=True)
    
    class Meta:
        model = Comercio
        fields = '__all__'
