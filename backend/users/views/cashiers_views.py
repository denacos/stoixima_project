
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Sum
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.dateparse import parse_date
from users.models import UserBalance, CustomUser, Transaction
from users.models import Bet, UserBalance
from users.serializers import BetSerializer, CustomUserSerializer
from users.permissions import IsCashier

User = get_user_model()

class CashierTransferView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cashier = request.user
        if cashier.role != "cashier":
            raise PermissionDenied("Μόνο ταμίες μπορούν να κάνουν μεταφορές.")

        user_id = request.data.get("user_id")
        amount = float(request.data.get("amount", 0))
        transfer_type = request.data.get("type")

        if not user_id or not transfer_type or amount <= 0:
            raise ValidationError("Απαιτούνται user_id, type και θετικό ποσό.")

        user = get_object_or_404(CustomUser, id=user_id, cashier=cashier)
        cashier_balance = get_object_or_404(UserBalance, user=cashier)
        user_balance = get_object_or_404(UserBalance, user=user)

        if transfer_type == "deposit":
            if cashier_balance.balance < amount:
                raise ValidationError("Ανεπαρκές υπόλοιπο ταμία.")
            cashier_balance.balance -= amount
            user_balance.balance += amount
            Transaction.objects.create(sender=cashier, receiver=user, amount=amount)

        elif transfer_type == "withdraw":
            if user_balance.balance < amount:
                raise ValidationError("Ανεπαρκές υπόλοιπο χρήστη.")
            user_balance.balance -= amount
            cashier_balance.balance += amount
            Transaction.objects.create(sender=user, receiver=cashier, amount=amount)

        else:
            raise ValidationError("Ο τύπος πρέπει να είναι 'deposit' ή 'withdraw'.")

        cashier_balance.save()
        user_balance.save()

        return Response({
            "message": f"Επιτυχής {transfer_type} ποσού €{amount} στον χρήστη {user.username}."
        }, status=200)

class CashierTransactionHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cashier = request.user
        if cashier.role != "cashier":
            raise PermissionDenied("Μόνο ταμίες έχουν πρόσβαση.")
        
        manager = cashier.manager

        # Ανάλογα με τον τύπο φτιάχνουμε εξαρχής το σωστό queryset
        transfer_type = request.query_params.get("type")
        if transfer_type == "deposit":
            transactions = Transaction.objects.filter(sender=cashier) | Transaction.objects.filter(sender=manager)
        elif transfer_type == "withdraw":
            transactions = Transaction.objects.filter(receiver=cashier) | Transaction.objects.filter(receiver=manager)
        else:
            transactions = (
                Transaction.objects.filter(sender=cashier) |
                Transaction.objects.filter(receiver=cashier) |
                Transaction.objects.filter(sender=manager) |
                Transaction.objects.filter(receiver=manager)
            )

        # Εφαρμογή ημερομηνιών
        from_date = request.query_params.get("from")
        to_date = request.query_params.get("to")
        if from_date:
            transactions = transactions.filter(timestamp__date__gte=from_date)
        if to_date:
            transactions = transactions.filter(timestamp__date__lte=to_date)

        # Εφαρμογή φίλτρου χρήστη (είτε sender είτε receiver)
        user_id = request.query_params.get("user")
        if user_id:
            if transfer_type == "deposit":
                transactions = transactions.filter(receiver_id=user_id)
            elif transfer_type == "withdraw":
                transactions = transactions.filter(sender_id=user_id)
            else:
                transactions = transactions.filter(
                    models.Q(sender_id=user_id) | models.Q(receiver_id=user_id)
                )

        transactions = transactions.order_by("-timestamp")

        history = [
            {
                "id": t.id,
                "type": "deposit" if t.sender == cashier else "withdraw",
                "user": t.receiver.username if t.sender == cashier else t.sender.username,
                "amount": t.amount,
                "timestamp": t.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            }
            for t in transactions
        ]

        return Response(history)

class CashierBalancesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user  # cashiers only view their users' balances

        # Get filter date range (from_date, to_date)
        from_date = request.query_params.get("from_date")
        to_date = request.query_params.get("to_date")

        # Fetch all users under the cashier
        users = User.objects.filter(cashier=user)

        data = []

        for u in users:
            user_balance = UserBalance.objects.get(user=u)
            total_bets = Bet.objects.filter(user=u).aggregate(total_stake=Sum("stake"))["total_stake"] or 0
            total_winnings = Bet.objects.filter(user=u, status="won").aggregate(total_winnings=Sum("potential_payout"))["total_winnings"] or 0
            total_losses = total_bets - total_winnings

            # Calculate Mixed (Gross - Stakes)
            mixed = total_winnings - total_bets

            # Calculate commission (20% for now)
            commission = 0.2

            # Calculate owed commission (100% - commission %)
            owed_commission = (100 - 20) / 100 * mixed

            # Calculate net (commission * mixed)
            net = commission * mixed

            data.append({
                "user": u.username,
                "total_bets": total_bets,
                "total_winnings": total_winnings,
                "total_losses": total_losses,
                "mixed": mixed,
                "commission": commission,
                "owed_commission": owed_commission,
                "net": net,
            })

        return Response(data)
    
class CashierUserListView(generics.ListAPIView):
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return CustomUser.objects.filter(cashier=user)

class CashierFinancialReportView(APIView):
    permission_classes = [IsAuthenticated, IsCashier]
    def get(self, request):
        users = CustomUser.objects.filter(cashier=request.user, role="user")
        report = []
        for user in users:
            report.append({
                "user": user.username,
                "balance": user.userbalance.balance
            })
        return Response(report)

class CashierUserBetsReportView(generics.ListAPIView):
    serializer_class = BetSerializer
    permission_classes = [IsAuthenticated, IsCashier]

    def get_queryset(self):
        cashier = self.request.user
        queryset = Bet.objects.filter(user__cashier=cashier).order_by('-created_at')

        status = self.request.query_params.get('status')
        bet_type = self.request.query_params.get('type')
        bet_id = self.request.query_params.get('bet_id')
        user_id = self.request.query_params.get('user_id')
        from_date = self.request.query_params.get('from_date')
        to_date = self.request.query_params.get('to_date')

        if status:
            queryset = queryset.filter(status=status)

        if bet_type:
            queryset = queryset.filter(type=bet_type)

        if bet_id and bet_id.isdigit():
            queryset = queryset.filter(id=int(bet_id))

        if user_id and user_id.isdigit():
            queryset = queryset.filter(user__id=int(user_id))

        if from_date:
            try:
                parsed = parse_date(from_date)
                if parsed:
                    queryset = queryset.filter(created_at__date__gte=parsed)
            except ValueError:
                pass

        if to_date:
            try:
                parsed = parse_date(to_date)
                if parsed:
                    queryset = queryset.filter(created_at__date__lte=parsed)
            except ValueError:
                pass

        return queryset