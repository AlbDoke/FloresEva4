from django.contrib import admin
from .models import Mesa, Reserva
# Register your models here.

@admin.register(Mesa)
class MesaAdmin(admin.ModelAdmin):
    list_display = ("numero", "capacidad")
    search_fields = ("numero",)

@admin.register(Reserva)
class ReservaAdmin(admin.ModelAdmin):
    list_display = ("id", "nombre_cliente", "fecha_reserva", "hora_reserva", "cantidad_personas", "estado", "mesa")
    list_filter = ("estado", "fecha_reserva")
    search_fields = ("nombre_cliente", "telefono")