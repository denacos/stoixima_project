from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdmin(BasePermission):
    """ Ο Admin έχει πλήρη πρόσβαση στο σύστημα. """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'admin')

class CanManageManagers(BasePermission):
    """ Το Αφεντικό μπορεί να διαχειριστεί Μάνατζερ, αλλά μόνο τους δικούς του. """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'boss')

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.boss == request.user if hasattr(obj, "boss") else False

class CanManageCashiers(BasePermission):
    """ Ο Μάνατζερ μπορεί να διαχειριστεί Ταμίες, αλλά μόνο τους δικούς του. """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'manager')

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.manager == request.user if hasattr(obj, "manager") else False

class CanManageUsers(BasePermission):
    """ Ο Ταμίας μπορεί να διαχειρίζεται μόνο Χρήστες που του ανήκουν. """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'cashier')

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.cashier == request.user if hasattr(obj, "cashier") else False

class HasRole(BasePermission):
    """ Επιτρέπει πρόσβαση σε χρήστες με συγκεκριμένους ρόλους. """
    allowed_roles = []  # Ρόλοι που επιτρέπεται να έχουν πρόσβαση

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in self.allowed_roles)

class IsBoss(HasRole):
    """ Επιτρέπει πρόσβαση μόνο σε χρήστες που είναι 'boss'. """
    allowed_roles = ["boss"]

class IsManager(HasRole):
    """ Επιτρέπει πρόσβαση μόνο σε χρήστες που είναι 'manager'. """
    allowed_roles = ["manager"]

class IsCashier(HasRole):
    """ Επιτρέπει πρόσβαση μόνο σε χρήστες που είναι 'cashier'. """
    allowed_roles = ["cashier"]
