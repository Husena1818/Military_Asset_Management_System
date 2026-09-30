from django.db import models
from django.contrib.auth.models import User


class Base(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=200)
    commander = models.OneToOneField(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="commanded_base"
    )

    def __str__(self):
        return self.name


class EquipmentType(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class OpeningBalance(models.Model):
    base = models.ForeignKey(
        Base,
        on_delete=models.CASCADE,
        related_name="opening_balances"
    )
    equipment_type = models.ForeignKey(
        EquipmentType,
        on_delete=models.CASCADE
    )
    quantity = models.PositiveIntegerField()
    balance_date = models.DateField()

    class Meta:
        unique_together = ("base", "equipment_type", "balance_date")

    def __str__(self):
        return f"{self.base} - {self.equipment_type} - {self.quantity}"


class Purchase(models.Model):
    base = models.ForeignKey(Base, on_delete=models.CASCADE)
    equipment_type = models.ForeignKey(
        EquipmentType,
        on_delete=models.CASCADE
    )
    quantity = models.PositiveIntegerField()
    purchase_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.equipment_type} - {self.quantity}"


class Transfer(models.Model):
    from_base = models.ForeignKey(
        Base,
        on_delete=models.CASCADE,
        related_name="transfers_out"
    )
    to_base = models.ForeignKey(
        Base,
        on_delete=models.CASCADE,
        related_name="transfers_in"
    )
    equipment_type = models.ForeignKey(
        EquipmentType,
        on_delete=models.CASCADE
    )
    quantity = models.PositiveIntegerField()
    transfer_date = models.DateTimeField(auto_now_add=True)
    transferred_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )

    def __str__(self):
        return f"{self.from_base} → {self.to_base}"


class Assignment(models.Model):
    base = models.ForeignKey(Base, on_delete=models.CASCADE)
    equipment_type = models.ForeignKey(
        EquipmentType,
        on_delete=models.CASCADE
    )
    personnel = models.ForeignKey(User, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    assignment_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.personnel.username} - {self.equipment_type}"


class Expenditure(models.Model):
    base = models.ForeignKey(Base, on_delete=models.CASCADE)
    equipment_type = models.ForeignKey(
        EquipmentType,
        on_delete=models.CASCADE
    )
    quantity = models.PositiveIntegerField()
    expenditure_date = models.DateTimeField(auto_now_add=True)
    recorded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )

    def __str__(self):
        return f"{self.equipment_type} - {self.quantity}"


class AuditLog(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )
    action = models.CharField(max_length=100)
    entity = models.CharField(max_length=100)
    entity_id = models.PositiveIntegerField(
        null=True,
        blank=True
    )
    description = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.action} - {self.timestamp}"