from django.urls import path
from .views import (
    reservas_list_create,
    reservas_detail,
    mesas_list_create,
    mesas_detail,
    disponibilidad_view,
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("mesas/", mesas_list_create, name="mesas-list-create"),
    path("mesas/<int:pk>/", mesas_detail, name="mesas-detail"),
    path("reservas/", reservas_list_create, name="reservas-list-create"),
    path("reservas/<int:pk>/", reservas_detail, name="reservas-detail"),
    path("disponibilidad/", disponibilidad_view, name="disponibilidad"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]