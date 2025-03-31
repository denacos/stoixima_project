
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, PermissionDenied
from django.shortcuts import get_object_or_404
from django.db.models import Sum
from django.contrib.auth import get_user_model
from users.models import UserBalance, CustomUser, Transaction
from users.serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated

User = get_user_model()

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        role = serializer.validated_data.get("role")
        if role == "manager":
            if user.role != "boss":
                raise PermissionDenied("Only Boss can create a Manager.")
            serializer.save(boss=user)
        elif role == "cashier":
            if user.role != "manager":
                raise PermissionDenied("Only Manager can create a Cashier.")
            serializer.save(manager=user)
        elif role == "user":
            if user.role != "cashier":
                raise PermissionDenied("Only Cashier can create a User.")
            serializer.save(cashier=user)
        else:
            raise PermissionDenied("Invalid role assignment.")

class UpdateUserView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class ListUsersView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserBalanceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        balance = get_object_or_404(UserBalance, user=request.user)
        return Response({"balance": balance.balance})

class TransferUnitsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        sender = request.user
        target_username = request.data.get("target_username")
        amount = request.data.get("amount")
        if not target_username or not amount:
            raise ValidationError("Απαιτούνται target_username και amount.")
        target_user = get_object_or_404(CustomUser, username=target_username)
        sender_balance = get_object_or_404(UserBalance, user=sender)
        target_balance = get_object_or_404(UserBalance, user=target_user)
        if sender_balance.balance < float(amount):
            raise ValidationError("Μη επαρκές υπόλοιπο για μεταφορά.")
        sender_balance.balance -= float(amount)
        target_balance.balance += float(amount)
        sender_balance.save()
        target_balance.save()
        Transaction.objects.create(sender=sender, receiver=target_user, amount=amount)
        return Response({
            "message": f"Μεταφέρθηκαν {amount} μονάδες στον {target_user.username}.",
            "sender_new_balance": sender_balance.balance,
            "receiver_new_balance": target_balance.balance,
        })

class TransactionHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        transactions = Transaction.objects.filter(sender=request.user) | Transaction.objects.filter(receiver=request.user)
        transactions = transactions.order_by('-timestamp')
        history = [
            {
                "sender": t.sender.username,
                "receiver": t.receiver.username,
                "amount": t.amount,
                "timestamp": t.timestamp.strftime("%Y-%m-%d %H:%M:%S")
            } for t in transactions
        ]
        return Response({"history": history})

class FinancialReportsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = UserBalance.objects.all()
        reports = []
        for user_balance in users:
            revenue = user_balance.balance * 1.2
            expense = user_balance.balance * 0.5
            profit = revenue - expense
            reports.append({
                "user": user_balance.user.username,
                "revenue": revenue,
                "expense": expense,
                "profit": profit,
            })
        return Response(reports)


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
