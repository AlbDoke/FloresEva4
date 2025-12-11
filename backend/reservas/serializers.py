from rest_framework import serializers
from .models import Reserva, Mesa


class MesaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mesa
        fields = ["id", "numero", "capacidad"]

    def validate_capacidad(self, value):
        if value < 1 or value > 15:
            raise serializers.ValidationError("La capacidad debe estar entre 1 y 15.")
        return value


class ReservaSerializer(serializers.ModelSerializer):
    nombreCliente = serializers.CharField(source="nombre_cliente")
    fechaReserva = serializers.DateField(source="fecha_reserva")
    horaReserva = serializers.TimeField(source="hora_reserva")
    cantidadPersonas = serializers.IntegerField(source="cantidad_personas")
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)
    telefono = serializers.CharField()
    try:
        estado = serializers.ChoiceField(choices=Reserva.Estado.choices)
    except Exception:
        estado = serializers.CharField()

    mesa = serializers.PrimaryKeyRelatedField(queryset=Mesa.objects.all())
    observacion = serializers.CharField(allow_blank=True, allow_null=True, required=False)

    class Meta:
        model = Reserva
        fields = [
            "id",
            "nombreCliente",
            "telefono",
            "fechaReserva",
            "horaReserva",
            "cantidadPersonas",
            "estado",
            "mesa",
            "observacion",
            "createdAt",
            "updatedAt",
        ]

    def validate_cantidadPersonas(self, value):
        if value < 1 or value > 15:
            raise serializers.ValidationError("La cantidad de personas debe estar entre 1 y 15.")
        return value

    def validate(self, attrs):
        mesa = attrs.get("mesa")
        fecha = attrs.get("fecha_reserva")
        hora = attrs.get("hora_reserva")
        cantidad = attrs.get("cantidad_personas")

        if mesa is not None and cantidad is not None:
            if cantidad > mesa.capacidad:
                raise serializers.ValidationError(
                    {
                        "cantidadPersonas": f"La cantidad ({cantidad}) excede la capacidad de la mesa #{mesa.numero} ({mesa.capacidad})."
                    }
                )

        instance_id = self.instance.id if self.instance else None
        if mesa and fecha and hora:
            conflict_qs = Reserva.objects.filter(mesa=mesa, fecha_reserva=fecha, hora_reserva=hora)
            if instance_id:
                conflict_qs = conflict_qs.exclude(id=instance_id)
            if conflict_qs.exists():
                raise serializers.ValidationError(
                    {"non_field_errors": ["Ya existe una reserva para esa mesa en esa fecha y hora."]}
                )

        return attrs