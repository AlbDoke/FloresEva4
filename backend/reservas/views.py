from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination

from .models import Reserva, Mesa
from .serializers import ReservaSerializer, MesaSerializer

def paginate_queryset(queryset, request, serializer_class):
    paginator = PageNumberPagination()
    paginated = paginator.paginate_queryset(queryset, request)
    serializer = serializer_class(paginated, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def mesas_list_create(request):
    if request.method == "GET":
        qs = Mesa.objects.all()

        q = request.query_params.get("search")
        if q:
            if q.isdigit():
                qs = qs.filter(Q(numero=int(q)) | Q(capacidad=int(q)))
            else:
                pass

        ordering = request.query_params.get("ordering")
        allowed = {"numero", "-numero", "capacidad", "-capacidad", "id", "-id"}
        if ordering in allowed:
            qs = qs.order_by(ordering)
        else:
            qs = qs.order_by("numero")

        return paginate_queryset(qs, request, MesaSerializer)

    serializer = MesaSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([AllowAny])
def mesas_detail(request, pk):
    mesa = get_object_or_404(Mesa, pk=pk)

    if request.method == "GET":
        serializer = MesaSerializer(mesa)
        return Response(serializer.data)

    if request.method in ["PUT", "PATCH"]:
        partial = request.method == "PATCH"
        serializer = MesaSerializer(mesa, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
    mesa.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def reservas_list_create(request):
    if request.method == "GET":
        qs = Reserva.objects.all()

        q = request.query_params.get("search")
        if q:
            qs = qs.filter(
                Q(nombre_cliente__icontains=q) |
                Q(telefono__icontains=q)
            )

        ordering = request.query_params.get("ordering")
        allowed = {
            "fecha_reserva", "-fecha_reserva",
            "hora_reserva", "-hora_reserva",
            "estado", "-estado",
            "mesa", "-mesa",
            "id", "-id",
        }
        if ordering in allowed:
            qs = qs.order_by(ordering)
        else:
            qs = qs.order_by("fecha_reserva", "hora_reserva")

        return paginate_queryset(qs, request, ReservaSerializer)

    # EL POST
    serializer = ReservaSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([AllowAny])
def reservas_detail(request, pk):
    reserva = get_object_or_404(Reserva, pk=pk)

    if request.method == "GET":
        serializer = ReservaSerializer(reserva)
        return Response(serializer.data)

    if request.method in ["PUT", "PATCH"]:
        partial = request.method == "PATCH"
        serializer = ReservaSerializer(reserva, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    reserva.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@permission_classes([AllowAny])
def disponibilidad_view(request):
    fecha = request.query_params.get("fecha_reserva")
    hora = request.query_params.get("hora_reserva")

    if not fecha or not hora:
        return Response(
            {"detail": "Debe enviar fecha_reserva y hora_reserva"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    reservadas_ids = Reserva.objects.filter(
        fecha_reserva=fecha,
        hora_reserva=hora
    ).values_list("mesa_id", flat=True)

    libres = Mesa.objects.exclude(id__in=reservadas_ids).order_by("numero")
    serializer = MesaSerializer(libres, many=True)
    return Response({"mesasLibres": serializer.data})