from django.core.exceptions import ValidationError
from django.db import models


class Mesa(models.Model):
    numero = models.PositiveIntegerField(unique=True)
    capacidad = models.PositiveIntegerField()

    def __str__(self):
        return f"Mesa {self.numero} (capacidad {self.capacidad})"


ESTADOS = [
    ("RESERVADO", "Reservado"),
    ("COMPLETADA", "Completada"),
    ("ANULADA", "Anulada"),
    ("NO ASISTEN", "No asisten"),
]


class Reserva(models.Model):
    nombre_cliente = models.CharField(max_length=100)
    telefono = models.CharField(max_length=15)
    fecha_reserva = models.DateField()
    hora_reserva = models.TimeField()
    cantidad_personas = models.PositiveIntegerField()
    estado = models.CharField(max_length=12, choices=ESTADOS, default="RESERVADO")
    mesa = models.ForeignKey(Mesa, on_delete=models.PROTECT, related_name="reservas")
    observacion = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["mesa", "fecha_reserva", "hora_reserva"],
                name="unique_reserva_mesa_fecha_hora",
            )
        ]

    def __str__(self):
        return f"{self.nombre_cliente} - {self.fecha_reserva} {self.hora_reserva}"

    def clean(self):
        if self.cantidad_personas is not None and not (1 <= self.cantidad_personas <= 15):
            raise ValidationError(
                {"cantidad_personas": "La cantidad de personas debe estar entre 1 y 15."}
            )

        if self.mesa and self.cantidad_personas:
            if self.cantidad_personas > self.mesa.capacidad:
                raise ValidationError(
                    {
                        "cantidad_personas": f"La cantidad ({self.cantidad_personas}) excede la capacidad de la mesa #{self.mesa.numero} ({self.mesa.capacidad})."
                    }
                )

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)