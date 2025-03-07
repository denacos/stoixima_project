from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

# Οι διαθέσιμοι ρόλοι χρηστών

class CustomUser(AbstractUser):
    USER_ROLES = [
        ('user', 'Χρήστης'),
        ('cashier', 'Ταμίας'),
        ('manager', 'Μάνατζερ'),
        ('boss', 'Αφεντικό'),
        ('admin', 'Admin'),
    ]

    role = models.CharField(max_length=10, choices=USER_ROLES, default='user')
    boss = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name="boss_managers")
    manager = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name="manager_cashiers")
    cashier = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name="cashier_users")

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

class Bet(models.Model):
    STATUS_CHOICES = [
        ('open', 'Ανοιχτό'),
        ('won', 'Κερδισμένο'),
        ('lost', 'Χαμένο'),
        ('cashed_out', 'Cashout'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)  # Χρησιμοποιούμε το CustomUser!
    match_id = models.CharField(max_length=100)
    choice = models.CharField(max_length=100)
    odds = models.FloatField()
    stake = models.FloatField()
    potential_payout = models.FloatField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(auto_now_add=True)
    cashed_out_amount = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.choice} @ {self.odds} ({self.status})"

class UserBalance(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)  # Χρησιμοποιούμε το CustomUser!
    balance = models.FloatField(default=1000.0)  # Αρχικό υπόλοιπο σε μονάδες

    def __str__(self):
        return f"{self.user.username} - Balance: {self.balance}"

    def deduct_balance(self, amount):
        """Αφαιρεί μονάδες από τον χρήστη αν υπάρχει αρκετό υπόλοιπο."""
        if self.balance >= amount:
            self.balance -= amount
            self.save()
            return True
        raise ValueError("Ανεπαρκές υπόλοιπο")

    def add_balance(self, amount):
        """Προσθέτει μονάδες στον χρήστη."""
        self.balance += amount
        self.save()

@receiver(post_save, sender=CustomUser)
def create_user_balance(sender, instance, created, **kwargs):
    """Δημιουργεί υπόλοιπο για κάθε νέο χρήστη αν δεν υπάρχει."""
    if created:
        UserBalance.objects.get_or_create(user=instance)



