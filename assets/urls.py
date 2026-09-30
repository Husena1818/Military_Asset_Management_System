from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    BaseViewSet,
    EquipmentTypeViewSet,
    OpeningBalanceViewSet,
    PurchaseViewSet,
    TransferViewSet,
    AssignmentViewSet,
    ExpenditureViewSet,
    AuditLogViewSet,
    DashboardView,
)

router = DefaultRouter()

router.register(r"bases", BaseViewSet, basename="base")
router.register(r"equipment-types", EquipmentTypeViewSet, basename="equipmenttype")
router.register(r"opening-balances", OpeningBalanceViewSet, basename="openingbalance")
router.register(r"purchases", PurchaseViewSet, basename="purchase")
router.register(r"transfers", TransferViewSet, basename="transfer")
router.register(r"assignments", AssignmentViewSet, basename="assignment")
router.register(r"expenditures", ExpenditureViewSet, basename="expenditure")
router.register(r"audit-logs", AuditLogViewSet, basename="auditlog")

urlpatterns = [
    path("", include(router.urls)),
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
]