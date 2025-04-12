from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.timezone import now

# Οι διαθέσιμοι ρόλοι χρηστών
class CustomUser(AbstractUser):
    # Χρήση της κλάσης TextChoices για τους ρόλους χρηστών
    class UserRoles(models.TextChoices):
        USER = 'user', 'User'
        CASHIER = 'cashier', 'Cashier'
        MANAGER = 'manager', 'Manager'
        BOSS = 'boss', 'Boss'
        ADMIN = 'admin', 'Admin'

    role = models.CharField(max_length=20, choices=UserRoles.choices)
    
    # Ιεραρχία χρηστών
    boss = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='boss_users')
    manager = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='manager_users')
    cashier = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='cashier_users')

    # Πρόσθετα πεδία
    country = models.CharField(max_length=100, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    birth_date = models.DateField(blank=True, null=True)

    def __str__(self):
        return self.username

class Bet(models.Model):
    STATUS_CHOICES = [
        ('open', 'Ανοιχτό'),
        ('won', 'Κερδισμένο'),
        ('lost', 'Χαμένο'),
        ('cashed_out', 'Cashout'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)  # ✅ Χρησιμοποιούμε CustomUser!
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
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)  # ✅ Χρησιμοποιούμε CustomUser!
    balance = models.FloatField(default=1000.0)

    def __str__(self):
        return f"{self.user.username} - Balance: {self.balance}"
    
    def transfer_units(self, target_user, amount):
        """Μεταφορά μονάδων με έλεγχο ιεραρχίας ρόλων."""
        ROLE_HIERARCHY = {
            "admin": "boss",
            "boss": "manager",
            "manager": "cashier",
            "cashier": "user"
        }

        if self.user.role not in ROLE_HIERARCHY:
            raise ValueError("Ο ρόλος δεν μπορεί να κάνει μεταφορές.")

        if ROLE_HIERARCHY[self.user.role] != target_user.role:
            raise ValueError("Δεν μπορείτε να μεταφέρετε μονάδες σε αυτόν τον ρόλο.")

        if self.balance < amount:
            raise ValueError("Μη επαρκές υπόλοιπο για μεταφορά.")

        # Ενημέρωση υπολοίπων
        self.balance -= amount
        target_user.userbalance.balance += amount
        self.save()
        target_user.userbalance.save()

        return f"Μεταφέρθηκαν {amount} μονάδες από {self.user.username} στον {target_user.username}."

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

class Transaction(models.Model):
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="sent_transactions")  # ✅ Χρησιμοποιούμε CustomUser!
    receiver = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="received_transactions")  # ✅ Χρησιμοποιούμε CustomUser!
    amount = models.FloatField()
    timestamp = models.DateTimeField(default=now)

    def __str__(self):
        return f"{self.sender.username} -> {self.receiver.username}: {self.amount} μονάδες στις {self.timestamp}"
