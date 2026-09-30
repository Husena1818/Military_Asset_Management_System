from rest_framework.permissions import BasePermission


class RolePermission(BasePermission):

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        # Admin has full access
        if user.is_superuser or user.groups.filter(name="Admin").exists():
            return True

        role = None

        if user.groups.filter(name="Base Commander").exists():
            role = "commander"

        elif user.groups.filter(name="Logistics Officer").exists():
            role = "logistics"

        if role == "commander":
            return self.commander_access(request, view)

        if role == "logistics":
            return self.logistics_access(request, view)

        return False

    def commander_access(self, request, view):
        allowed = [
            "base",
            "equipmenttype",
            "openingbalance",
            "purchase",
            "transfer",
            "assignment",
            "expenditure",
            "dashboard",
        ]

        return view.basename in allowed

    def logistics_access(self, request, view):
        # Logistics Officer: purchases, transfers and dashboard
        allowed = [
            "purchase",
            "transfer",
            "dashboard",
        ]

        return view.basename in allowed 