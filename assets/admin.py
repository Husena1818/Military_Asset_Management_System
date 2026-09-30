from django.contrib import admin
from .models import (
    Base,
    EquipmentType,
    Purchase,
    Transfer,
    Assignment,
    Expenditure,
    AuditLog,
)


admin.site.register(Base)
admin.site.register(EquipmentType)
admin.site.register(Purchase)
admin.site.register(Transfer)
admin.site.register(Assignment)
admin.site.register(Expenditure)
admin.site.register(AuditLog)