from rest_framework import serializers

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


class BaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Base
        fields = "__all__"


class EquipmentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EquipmentType
        fields = "__all__"


class OpeningBalanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = OpeningBalance
        fields = "__all__"


class PurchaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Purchase
        fields = "__all__"


class TransferSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transfer
        fields = "__all__"


class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = "__all__"


class ExpenditureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expenditure
        fields = "__all__"


class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = "__all__"