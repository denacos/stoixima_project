from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdmin(BasePermission):
    """ Ο Admin έχει πλήρη πρόσβαση στο σύστημα. """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class CanManageManagers(BasePermission):
    """ Το Αφεντικό μπορεί να διαχειριστεί Μάνατζερ, αλλά μόνο τους δικούς του. """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'boss'

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.boss == request.user  # Το αφεντικό μπορεί να διαχειριστεί μόνο τους μάνατζερ του.

class CanManageCashiers(BasePermission):
    """ Ο Μάνατζερ μπορεί να διαχειριστεί Ταμίες, αλλά μόνο τους δικούς του. """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'manager'

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.manager == request.user  # Ο Μάνατζερ μπορεί να διαχειριστεί μόνο τους Ταμίες του.

class CanManageUsers(BasePermission):
    """ Ο Ταμίας μπορεί να διαχειρίζεται μόνο Χρήστες που του ανήκουν. """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'cashier'

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.cashier == request.user  # Ο ταμίας μπορεί να επεξεργαστεί μόνο τους δικούς του χρήστες.

class IsBoss(BasePermission):
    """ Επιτρέπει πρόσβαση μόνο σε χρήστες που είναι 'boss'. """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'boss'

class IsManager(BasePermission):
    """ Επιτρέπει πρόσβαση μόνο σε χρήστες που είναι 'manager'. """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'manager'

class IsCashier(BasePermission):
    """ Επιτρέπει πρόσβαση μόνο σε χρήστες που είναι 'cashier'. """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'cashier'
