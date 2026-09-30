from django.db import models
from django.contrib.auth.models import AbstractUser

class Rol(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    permisos = models.JSONField(default=list)

    def __str__(self):
        return self.nombre

class Usuario(AbstractUser):
    roles_custom = models.ManyToManyField(Rol, related_name="usuarios", blank=True)
    
    def __str__(self):
        return self.username

class PerfilCliente(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, related_name='perfil_cliente')

class PerfilAdminMunicipal(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, related_name='perfil_admin')
    cargo = models.CharField(max_length=100, blank=True, null=True)

class PerfilPrestador(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, related_name='perfil_prestador')
    zona_cobertura = models.CharField(max_length=200)

class PerfilComerciante(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, related_name='perfil_comerciante')
    cuit = models.CharField(max_length=20, unique=True)

class Categoria(models.Model):
    nombre = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.nombre

class Comercio(models.Model):
    propietario = models.ForeignKey(PerfilComerciante, on_delete=models.CASCADE, related_name='comercios')
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True, null=True)
    direccion = models.CharField(max_length=300, blank=True, null=True)
    ubicacion = models.JSONField(blank=True, null=True)
    contacto = models.JSONField(blank=True, null=True)
    vidriera = models.JSONField(blank=True, null=True)
    estado = models.CharField(
        max_length=50, 
        choices=[('pendiente', 'Pendiente'), ('aprobado', 'Aprobado'), ('rechazado', 'Rechazado')], 
        default='pendiente'
    )
    calificacion_promedio = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    categorias = models.ManyToManyField(Categoria, related_name='comercios')

    def __str__(self):
        return self.nombre
