from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Bet

@admin.register(Bet)
class BetAdmin(admin.ModelAdmin):
    list_display = ('user', 'match_id', 'choice', 'odds', 'stake', 'potential_payout', 'status', 'created_at', 'cashed_out_amount')
    list_filter = ('status', 'created_at')
    search_fields = ('user__username', 'match_id', 'choice')

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('role', 'boss', 'manager', 'cashier')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('role', 'boss', 'manager', 'cashier')}),
    )
    
    list_display = ('username', 'email', 'get_role_display', 'boss', 'manager', 'cashier', 'is_staff', 'is_superuser')
    list_filter = ('role', 'is_staff', 'is_superuser', 'boss', 'manager', 'cashier')
    search_fields = ('username', 'email', 'role')

    def get_role_display(self, obj):
        """ Επιστρέφει την ονομασία του ρόλου αντί για το raw value """
        return dict(CustomUser.USER_ROLES).get(obj.role, "Unknown")
    get_role_display.short_description = "Role"

admin.site.register(CustomUser, CustomUserAdmin)
