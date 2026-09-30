from datetime import datetime

from django.db.models import Sum
from django.utils import timezone

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Base,
    EquipmentType,
    OpeningBalance,
    Purchase,
    Transfer,
    Assignment,
    Expenditure,
    AuditLog,
)

from .serializers import (
    BaseSerializer,
    EquipmentTypeSerializer,
    OpeningBalanceSerializer,
    PurchaseSerializer,
    TransferSerializer,
    AssignmentSerializer,
    ExpenditureSerializer,
    AuditLogSerializer,
)

from .permissions import RolePermission


# ---------------------------------------------------------
# Helper functions
# ---------------------------------------------------------

def is_admin(user):
    return (
        user.is_superuser
        or user.groups.filter(name="Admin").exists()
    )


def is_commander(user):
    return user.groups.filter(name="Base Commander").exists()


def is_logistics(user):
    return user.groups.filter(name="Logistics Officer").exists()


def get_commanded_base(user):
    try:
        return user.commanded_base
    except Base.DoesNotExist:
        return None


def create_audit_log(user, action, entity, entity_id=None, description=""):
    AuditLog.objects.create(
        user=user,
        action=action,
        entity=entity,
        entity_id=entity_id,
        description=description,
    )


# ---------------------------------------------------------
# Base API
# ---------------------------------------------------------

class BaseViewSet(viewsets.ModelViewSet):

    queryset = Base.objects.all()
    serializer_class = BaseSerializer
    permission_classes = [RolePermission]
    basename = "base"

    def get_queryset(self):
        queryset = Base.objects.all()

        if is_commander(self.request.user):
            commanded_base = get_commanded_base(self.request.user)

            if commanded_base:
                queryset = queryset.filter(id=commanded_base.id)

        return queryset

    def perform_create(self, serializer):
        obj = serializer.save()

        create_audit_log(
            self.request.user,
            "CREATE",
            "Base",
            obj.id,
            f"Created base: {obj.name}",
        )

    def perform_update(self, serializer):
        obj = serializer.save()

        create_audit_log(
            self.request.user,
            "UPDATE",
            "Base",
            obj.id,
            f"Updated base: {obj.name}",
        )

    def perform_destroy(self, instance):
        entity_id = instance.id
        name = instance.name

        instance.delete()

        create_audit_log(
            self.request.user,
            "DELETE",
            "Base",
            entity_id,
            f"Deleted base: {name}",
        )


# ---------------------------------------------------------
# Equipment Type API
# ---------------------------------------------------------

class EquipmentTypeViewSet(viewsets.ModelViewSet):

    queryset = EquipmentType.objects.all()
    serializer_class = EquipmentTypeSerializer
    permission_classes = [RolePermission]
    basename = "equipmenttype"

    def perform_create(self, serializer):
        obj = serializer.save()

        create_audit_log(
            self.request.user,
            "CREATE",
            "EquipmentType",
            obj.id,
            f"Created equipment type: {obj.name}",
        )

    def perform_update(self, serializer):
        obj = serializer.save()

        create_audit_log(
            self.request.user,
            "UPDATE",
            "EquipmentType",
            obj.id,
            f"Updated equipment type: {obj.name}",
        )

    def perform_destroy(self, instance):
        entity_id = instance.id
        name = instance.name

        instance.delete()

        create_audit_log(
            self.request.user,
            "DELETE",
            "EquipmentType",
            entity_id,
            f"Deleted equipment type: {name}",
        )


# ---------------------------------------------------------
# Opening Balance API
# ---------------------------------------------------------

class OpeningBalanceViewSet(viewsets.ModelViewSet):

    queryset = OpeningBalance.objects.all()
    serializer_class = OpeningBalanceSerializer
    permission_classes = [RolePermission]
    basename = "openingbalance"

    def get_queryset(self):
        queryset = OpeningBalance.objects.all()

        if is_commander(self.request.user):
            commanded_base = get_commanded_base(self.request.user)

            if commanded_base:
                queryset = queryset.filter(
                    base=commanded_base
                )

        return queryset

    def perform_create(self, serializer):
        obj = serializer.save()

        create_audit_log(
            self.request.user,
            "CREATE",
            "OpeningBalance",
            obj.id,
            f"Created opening balance of {obj.quantity} unit(s)",
        )


# ---------------------------------------------------------
# Purchase API
# ---------------------------------------------------------

class PurchaseViewSet(viewsets.ModelViewSet):

    queryset = Purchase.objects.all()
    serializer_class = PurchaseSerializer
    permission_classes = [RolePermission]
    basename = "purchase"

    def get_queryset(self):
        queryset = Purchase.objects.all()

        if is_commander(self.request.user):
            commanded_base = get_commanded_base(self.request.user)

            if commanded_base:
                queryset = queryset.filter(
                    base=commanded_base
                )

        return queryset.order_by("-purchase_date")

    def perform_create(self, serializer):
        obj = serializer.save()

        create_audit_log(
            self.request.user,
            "CREATE",
            "Purchase",
            obj.id,
            (
                f"Purchased {obj.quantity} unit(s) "
                f"of equipment type {obj.equipment_type_id} "
                f"at base {obj.base_id}"
            ),
        )

    def perform_update(self, serializer):
        obj = serializer.save()

        create_audit_log(
            self.request.user,
            "UPDATE",
            "Purchase",
            obj.id,
            f"Updated purchase {obj.id}",
        )

    def perform_destroy(self, instance):
        entity_id = instance.id

        instance.delete()

        create_audit_log(
            self.request.user,
            "DELETE",
            "Purchase",
            entity_id,
            f"Deleted purchase {entity_id}",
        )


# ---------------------------------------------------------
# Transfer API
# ---------------------------------------------------------

class TransferViewSet(viewsets.ModelViewSet):

    queryset = Transfer.objects.all()
    serializer_class = TransferSerializer
    permission_classes = [RolePermission]
    basename = "transfer"

    def get_queryset(self):
        queryset = Transfer.objects.all()

        if is_commander(self.request.user):
            commanded_base = get_commanded_base(self.request.user)

            if commanded_base:
                queryset = queryset.filter(
                    from_base=commanded_base
                ) | queryset.filter(
                    to_base=commanded_base
                )

        return queryset.order_by("-transfer_date")

    def perform_create(self, serializer):

        transfer = serializer.save(
            transferred_by=self.request.user
        )

        create_audit_log(
            self.request.user,
            "CREATE",
            "Transfer",
            transfer.id,
            (
                f"Transferred {transfer.quantity} unit(s) "
                f"from base {transfer.from_base_id} "
                f"to base {transfer.to_base_id}"
            ),
        )

    def perform_update(self, serializer):

        transfer = serializer.save()

        create_audit_log(
            self.request.user,
            "UPDATE",
            "Transfer",
            transfer.id,
            f"Updated transfer {transfer.id}",
        )

    def perform_destroy(self, instance):

        entity_id = instance.id

        instance.delete()

        create_audit_log(
            self.request.user,
            "DELETE",
            "Transfer",
            entity_id,
            f"Deleted transfer {entity_id}",
        )


# ---------------------------------------------------------
# Assignment API
# ---------------------------------------------------------

class AssignmentViewSet(viewsets.ModelViewSet):

    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [RolePermission]
    basename = "assignment"

    def get_queryset(self):

        queryset = Assignment.objects.all()

        if is_commander(self.request.user):
            commanded_base = get_commanded_base(self.request.user)

            if commanded_base:
                queryset = queryset.filter(
                    base=commanded_base
                )

        return queryset.order_by("-assignment_date")

    def perform_create(self, serializer):

        assignment = serializer.save()

        create_audit_log(
            self.request.user,
            "CREATE",
            "Assignment",
            assignment.id,
            (
                f"Assigned {assignment.quantity} unit(s) "
                f"to user {assignment.personnel_id}"
            ),
        )

    def perform_update(self, serializer):

        assignment = serializer.save()

        create_audit_log(
            self.request.user,
            "UPDATE",
            "Assignment",
            assignment.id,
            f"Updated assignment {assignment.id}",
        )

    def perform_destroy(self, instance):

        entity_id = instance.id

        instance.delete()

        create_audit_log(
            self.request.user,
            "DELETE",
            "Assignment",
            entity_id,
            f"Deleted assignment {entity_id}",
        )


# ---------------------------------------------------------
# Expenditure API
# ---------------------------------------------------------

class ExpenditureViewSet(viewsets.ModelViewSet):

    queryset = Expenditure.objects.all()
    serializer_class = ExpenditureSerializer
    permission_classes = [RolePermission]
    basename = "expenditure"

    def get_queryset(self):

        queryset = Expenditure.objects.all()

        if is_commander(self.request.user):
            commanded_base = get_commanded_base(self.request.user)

            if commanded_base:
                queryset = queryset.filter(
                    base=commanded_base
                )

        return queryset.order_by("-expenditure_date")

    def perform_create(self, serializer):

        expenditure = serializer.save(
            recorded_by=self.request.user
        )

        create_audit_log(
            self.request.user,
            "CREATE",
            "Expenditure",
            expenditure.id,
            f"Expended {expenditure.quantity} unit(s)",
        )

    def perform_update(self, serializer):

        expenditure = serializer.save()

        create_audit_log(
            self.request.user,
            "UPDATE",
            "Expenditure",
            expenditure.id,
            f"Updated expenditure {expenditure.id}",
        )

    def perform_destroy(self, instance):

        entity_id = instance.id

        instance.delete()

        create_audit_log(
            self.request.user,
            "DELETE",
            "Expenditure",
            entity_id,
            f"Deleted expenditure {entity_id}",
        )


# ---------------------------------------------------------
# Audit Log API
# ---------------------------------------------------------

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):

    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [RolePermission]
    basename = "auditlog"

    def get_queryset(self):
        return AuditLog.objects.all().order_by("-timestamp")


# ---------------------------------------------------------
# Dashboard API
# ---------------------------------------------------------

class DashboardView(APIView):

    permission_classes = [RolePermission]

    basename = "dashboard"

    def get(self, request):

        user = request.user

        base_id = request.GET.get("base")
        equipment_type_id = request.GET.get("equipment_type")

        date_from = request.GET.get("date_from")
        date_to = request.GET.get("date_to")

        # -------------------------------------------------
        # Base scope
        # -------------------------------------------------

        if is_commander(user):

            commanded_base = get_commanded_base(user)

            if commanded_base:
                base_id = commanded_base.id

        # -------------------------------------------------
        # Parse dates
        # -------------------------------------------------

        start_date = None
        end_date = None

        if date_from:
            try:
                start_date = datetime.strptime(
                    date_from,
                    "%Y-%m-%d"
                ).date()
            except ValueError:
                return Response(
                    {
                        "error": "date_from must be YYYY-MM-DD"
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if date_to:
            try:
                end_date = datetime.strptime(
                    date_to,
                    "%Y-%m-%d"
                ).date()
            except ValueError:
                return Response(
                    {
                        "error": "date_to must be YYYY-MM-DD"
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # -------------------------------------------------
        # Opening Balance
        # -------------------------------------------------

        opening_queryset = OpeningBalance.objects.all()

        if base_id:
            opening_queryset = opening_queryset.filter(
                base_id=base_id
            )

        if equipment_type_id:
            opening_queryset = opening_queryset.filter(
                equipment_type_id=equipment_type_id
            )

        if start_date:
            opening_queryset = opening_queryset.filter(
                balance_date__lte=start_date
            )

        # Get latest opening balance for each
        # base + equipment type combination
        opening_records = {}

        for item in opening_queryset.order_by(
            "base_id",
            "equipment_type_id",
            "balance_date",
        ):
            key = (
                item.base_id,
                item.equipment_type_id,
            )

            opening_records[key] = item.quantity

        opening_balance = sum(
            opening_records.values()
        )

        # -------------------------------------------------
        # Purchases
        # -------------------------------------------------

        purchases = Purchase.objects.all()

        if base_id:
            purchases = purchases.filter(
                base_id=base_id
            )

        if equipment_type_id:
            purchases = purchases.filter(
                equipment_type_id=equipment_type_id
            )

        if start_date:
            purchases = purchases.filter(
                purchase_date__gte=start_date
            )

        if end_date:
            purchases = purchases.filter(
                purchase_date__lte=end_date
            )

        purchase_total = (
            purchases.aggregate(
                total=Sum("quantity")
            )["total"]
            or 0
        )

        # -------------------------------------------------
        # Transfer In
        # -------------------------------------------------

        transfer_in = Transfer.objects.all()

        if base_id:
            transfer_in = transfer_in.filter(
                to_base_id=base_id
            )

        if equipment_type_id:
            transfer_in = transfer_in.filter(
                equipment_type_id=equipment_type_id
            )

        if start_date:
            transfer_in = transfer_in.filter(
                transfer_date__date__gte=start_date
            )

        if end_date:
            transfer_in = transfer_in.filter(
                transfer_date__date__lte=end_date
            )

        transfer_in_total = (
            transfer_in.aggregate(
                total=Sum("quantity")
            )["total"]
            or 0
        )

        # -------------------------------------------------
        # Transfer Out
        # -------------------------------------------------

        transfer_out = Transfer.objects.all()

        if base_id:
            transfer_out = transfer_out.filter(
                from_base_id=base_id
            )

        if equipment_type_id:
            transfer_out = transfer_out.filter(
                equipment_type_id=equipment_type_id
            )

        if start_date:
            transfer_out = transfer_out.filter(
                transfer_date__date__gte=start_date
            )

        if end_date:
            transfer_out = transfer_out.filter(
                transfer_date__date__lte=end_date
            )

        transfer_out_total = (
            transfer_out.aggregate(
                total=Sum("quantity")
            )["total"]
            or 0
        )

        # -------------------------------------------------
        # Assignments
        # -------------------------------------------------

        assignments = Assignment.objects.all()

        if base_id:
            assignments = assignments.filter(
                base_id=base_id
            )

        if equipment_type_id:
            assignments = assignments.filter(
                equipment_type_id=equipment_type_id
            )

        if start_date:
            assignments = assignments.filter(
                assignment_date__date__gte=start_date
            )

        if end_date:
            assignments = assignments.filter(
                assignment_date__date__lte=end_date
            )

        assigned_total = (
            assignments.aggregate(
                total=Sum("quantity")
            )["total"]
            or 0
        )

        # -------------------------------------------------
        # Expenditures
        # -------------------------------------------------

        expenditures = Expenditure.objects.all()

        if base_id:
            expenditures = expenditures.filter(
                base_id=base_id
            )

        if equipment_type_id:
            expenditures = expenditures.filter(
                equipment_type_id=equipment_type_id
            )

        if start_date:
            expenditures = expenditures.filter(
                expenditure_date__date__gte=start_date
            )

        if end_date:
            expenditures = expenditures.filter(
                expenditure_date__date__lte=end_date
            )

        expended_total = (
            expenditures.aggregate(
                total=Sum("quantity")
            )["total"]
            or 0
        )

        # -------------------------------------------------
        # Net Movement
        # -------------------------------------------------

        net_movement = (
            purchase_total
            + transfer_in_total
            - transfer_out_total
        )

        # Available closing balance
        closing_balance = (
            opening_balance
            + net_movement
            - assigned_total
            - expended_total
        )

        return Response(
            {
                "opening_balance": opening_balance,
                "purchases": purchase_total,
                "transfer_in": transfer_in_total,
                "transfer_out": transfer_out_total,
                "net_movement": net_movement,
                "assigned": assigned_total,
                "expended": expended_total,
                "closing_balance": closing_balance,
            }
        )